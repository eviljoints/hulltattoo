// src/pages/api/webhooks/stripe.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '~/lib/stripe';
import { prisma } from '~/lib/prisma';
import { insertEvent } from '~/lib/google';

export const config = { api: { bodyParser: false } };

function buffer(readable: any) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: any[] = [];
    readable.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

function mergeNotes(notes: string | null, patch: Record<string, any>) {
  let base: Record<string, any> = {};
  try { if (notes) base = JSON.parse(notes); } catch {}
  return JSON.stringify({ ...base, ...patch });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).end('Method Not Allowed'); }

  const sig = req.headers['stripe-signature'] as string;
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('[stripe webhook] signature error', err?.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as any;
      const bookingId = s.metadata?.bookingId as string | undefined;
      const paymentIntentId = s.payment_intent;
      if (!bookingId) return res.status(200).json({ ok: true });

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { artist: true, service: true },
      });
      if (!booking) return res.status(200).json({ ok: true });
      if (booking.status === 'CONFIRMED') return res.status(200).json({ ok: true, already: true });

      // final overlap check against CONFIRMED bookings
      const overlap = await prisma.booking.findFirst({
        where: {
          artistId: booking.artistId,
          NOT: { id: booking.id },
          status: 'CONFIRMED',
          AND: [{ start: { lt: booking.end } }, { end: { gt: booking.start } }],
        },
        select: { id: true },
      });
      if (overlap) {
        await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } });
        return res.status(200).json({ cancelled: true });
      }

      // create Google event
      let gEventId: string | null = null;
      try {
        gEventId = await insertEvent({
          artistId: booking.artistId,
          start: booking.start,
          end: booking.end,
          summary: `${booking.service.title} – ${booking.customerName || booking.customerEmail || 'Client'}`,
          description: 'Booked via Hull Tattoo Studio',
          timeZone: 'Europe/London',
          attendees: booking.customerEmail ? [{ email: booking.customerEmail }] : undefined,
          location: 'Hull Tattoo Studio, 255 Hedon Road, Hull, HU9 1NQ',
        });
      } catch (e: any) {
        console.error('[webhook] insertEvent failed:', e?.message || e);
      }

      const newNotes = mergeNotes(booking.notes || null, {
        gcalEventId: gEventId,
        stripePaymentIntentId: paymentIntentId,
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          stripePaymentIntentId: paymentIntentId || booking.stripePaymentIntentId || null,
          notes: newNotes,
        },
      });

      return res.status(200).json({ ok: true });
    }

    // Expired checkout sessions → cancel the pending hold
    if (event.type === 'checkout.session.expired') {
      const s = event.data.object as any;
      const bookingId = s.metadata?.bookingId as string | undefined;
      if (bookingId) {
        await prisma.booking.updateMany({
          where: { id: bookingId, status: 'PENDING' },
          data: { status: 'CANCELLED' },
        });
      }
      return res.status(200).json({ ok: true });
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as any;
      const bookingId = pi.metadata?.bookingId as string | undefined;
      if (bookingId) {
        await prisma.booking.updateMany({
          where: { id: bookingId, status: 'PENDING' },
          data: { status: 'CANCELLED' },
        });
      }
      return res.status(200).json({ ok: true });
    }

    // default: acknowledge
    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[stripe webhook] handler error', err?.message || err, err?.stack);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
