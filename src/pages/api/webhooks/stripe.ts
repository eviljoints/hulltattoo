// ./src/pages/api/webhooks/stripe.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { insertEvent } from '@/lib/google';
import { buildICS } from '@/lib/ics';
import { sendMail } from '@/lib/email';

export const config = { api: { bodyParser: false } };

async function readRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    req.on('data', (c: any) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    const buf = await readRawBody(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('[stripe] constructEvent failed:', err?.message || err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        if (!bookingId) break;

        const paymentIntentId =
          (typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id) || null;

        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { service: true, artist: true },
        });
        if (!booking) break;

        // Final overlap guard — if another CONFIRMED/PENDING overlaps, cancel this booking and (optionally) refund
        const overlapping = await prisma.booking.findFirst({
          where: {
            artistId: booking.artistId,
            status: { in: ['PENDING', 'CONFIRMED'] },
            NOT: { id: booking.id },
            AND: [{ start: { lt: booking.end } }, { end: { gt: booking.start } }],
          },
          select: { id: true },
        });
        if (overlapping) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'CANCELLED' },
          });
          return res.status(200).json({ doubleBooked: true });
        }

        // Build a rich description for Google Calendar (include form details & image links)
        let details: { placement?: string; brief?: string; images?: string[]; email?: string; name?: string } = {};
        try { details = booking.notes ? JSON.parse(booking.notes) : {}; } catch {}

        const lines: string[] = [
          'Booked via Hull Tattoo Studio',
          details.placement ? `Placement: ${details.placement}` : '',
          details.brief ? `Brief: ${details.brief}` : '',
        ].filter(Boolean);
        if (Array.isArray(details.images) && details.images.length) {
          lines.push('Images:');
          details.images.slice(0, 3).forEach((u) => lines.push(u));
        }
        lines.push(`BOOKING:${booking.id}`);
        const description = lines.join('\n');

        // Create/update Google Calendar event
        let gEventId = '';
        try {
          const { eventId } = await insertEvent({
            artistId: booking.artistId,
            start: booking.start,
            end: booking.end,
            summary: `${booking.service.title} – ${booking.customerName || booking.customerEmail || 'Client'}`,
            description,
            attendees: booking.customerEmail
              ? [{ email: booking.customerEmail, displayName: booking.customerName || undefined }]
              : undefined,
            location: details.placement || undefined,
            timeZone: 'Europe/London',
          });
          gEventId = eventId || '';
        } catch (e: any) {
          console.error('[gcal] insertEvent failed:', e?.message || e);
        }

        // Confirm booking & store Stripe + GCal refs
        const extra = gEventId ? ` [gEventId:${gEventId}]` : '';
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CONFIRMED',
            stripePaymentIntentId: paymentIntentId,
            notes: `${booking.notes || ''}${extra}`.trim(),
          },
        });

        // Email customer with ICS
        try {
          const ics = await buildICS({
            title: booking.service.title,
            start: booking.start,
            end: booking.end,
            description: 'Hull Tattoo Studio booking',
            location: '255 Hedon Road, Hull, HU9 1NQ',
          });

          if (booking.customerEmail) {
            await sendMail({
              to: booking.customerEmail,
              subject: `Booking confirmed – ${booking.service.title}`,
              html: `<p>Your booking is confirmed.</p>
                     <p><strong>Date:</strong> ${booking.start.toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
                     <p>We look forward to seeing you.</p>`,
              attachments: [
                { filename: 'booking.ics', content: ics, contentType: 'text/calendar' },
              ],
            });
          }
        } catch (e: any) {
          console.error('[email] sendMail failed:', e?.message || e);
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        if (bookingId) {
          const b = await prisma.booking.findUnique({ where: { id: bookingId }, select: { status: true } });
          if (b?.status === 'PENDING') {
            await prisma.booking.delete({ where: { id: bookingId } });
          }
        }
        break;
      }

      default:
        // ignore other events
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[stripe webhook] handler error:', err?.message || err);
    // Acknowledge anyway to avoid retries; errors were logged.
    return res.status(200).json({ received: true, warning: err?.message || 'non-fatal' });
  }
}
