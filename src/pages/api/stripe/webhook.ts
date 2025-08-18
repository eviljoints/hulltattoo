import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { stripe } from '~/lib/stripe';
import { getCalendarClientForArtist } from '~/lib/google';
import Stripe from 'stripe';

// Next needs the raw body for signature verification
export const config = { api: { bodyParser: false } };

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const LONDON_TZ = 'Europe/London';

function buildEventDescription(opts: {
  bookingId: string;
  artistName: string;
  serviceTitle: string;
  serviceSlug: string;
  customerName?: string | null;
  customerEmail?: string | null;
  placement?: string | null;
  brief?: string | null;
  images?: string[];
}) {
  const {
    bookingId, artistName, serviceTitle, serviceSlug,
    customerName, customerEmail, placement, brief, images = []
  } = opts;

  const lines: string[] = [];
  lines.push(`Service: ${serviceTitle} (${serviceSlug})`);
  lines.push(`Artist: ${artistName}`);
  lines.push(`Booking ID: ${bookingId}`);
  lines.push(''); // spacer
  lines.push('Customer');
  lines.push(`- Name: ${customerName || '—'}`);
  lines.push(`- Email: ${customerEmail || '—'}`);
  if (placement) lines.push(`- Placement: ${placement}`);
  lines.push(''); // spacer
  lines.push('Brief');
  lines.push(brief ? brief : '—');
  if (images.length) {
    lines.push('');
    lines.push('Images');
    images.forEach((u, i) => lines.push(`- ${u}`)); // URLs render clickable in Calendar
  }
  lines.push('');
  lines.push(`BOOKING:${bookingId}`); // marker for idempotency/search

  return lines.join('\n');
}

async function ensureGoogleEventForBooking(bookingId: string) {
  const label = '[stripe→gcal]';

  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true, artistId: true, serviceId: true,
      start: true, end: true, notes: true,
    },
  });
  if (!b) { console.warn(label, 'booking not found', bookingId); return; }

  const [artist, service] = await Promise.all([
    prisma.artist.findUnique({
      where: { id: b.artistId },
      select: { id: true, name: true, calendarId: true },
    }),
    prisma.service.findUnique({
      where: { id: b.serviceId! },
      select: { title: true, slug: true },
    }),
  ]);
  if (!artist) { console.warn(label, 'artist not found', b.artistId); return; }
  if (!service) { console.warn(label, 'service not found', b.serviceId); return; }

  let details: {
    name?: string | null;
    email?: string | null;
    placement?: string | null;
    brief?: string | null;
    images?: string[];
  } = {};
  try { details = JSON.parse(b.notes || '{}'); } catch { /* ignore */ }

  const g = await getCalendarClientForArtist(artist.id);
  if (!g) { console.warn(label, 'artist has no google link; skipping'); return; }

  const calendarId = g.calendarId || 'primary';
  const startISO = b.start.toISOString();
  const endISO = b.end.toISOString();
  const marker = `BOOKING:${b.id}`;
  const summary = `${service.title} — ${artist.name}`;
  const description = buildEventDescription({
    bookingId: b.id,
    artistName: artist.name,
    serviceTitle: service.title,
    serviceSlug: service.slug,
    customerName: details.name || null,
    customerEmail: details.email || null,
    placement: details.placement || null,
    brief: details.brief || null,
    images: Array.isArray(details.images) ? details.images.slice(0, 3) : [],
  });
  const attendees = details.email ? [{ email: details.email, displayName: details.name || undefined }] : undefined;
  const location = details.placement || undefined;

  // Idempotency: look for existing event around that time with our marker
  let existingId: string | undefined;
  try {
    const search = await g.calendar.events.list({
      calendarId,
      timeMin: new Date(new Date(startISO).getTime() - 60_000).toISOString(),
      timeMax: new Date(new Date(endISO).getTime() + 60_000).toISOString(),
      singleEvents: true,
      maxResults: 10,
      q: b.id, // search by booking ID (we put it in description)
      orderBy: 'startTime',
    });
    const existing = (search.data.items || []).find(ev => (ev.description || '').includes(marker));
    if (existing?.id) existingId = existing.id;
  } catch (e: any) {
    console.warn(label, 'events.list failed (continuing):', e?.message || e);
  }

  try {
    if (existingId) {
      // Update existing with full details (patch)
      await g.calendar.events.patch({
        calendarId,
        eventId: existingId,
        requestBody: {
          summary,
          description,
          location,
          start: { dateTime: startISO, timeZone: LONDON_TZ },
          end:   { dateTime: endISO,   timeZone: LONDON_TZ },
          attendees,
        },
        sendUpdates: 'all',
      });
      // Record event id in booking notes if not present
      if (!/gEventId:/.test(b.notes || '')) {
        await prisma.booking.update({
          where: { id: b.id },
          data: { notes: `${(b.notes || '').trim()} [gEventId:${existingId}]`.trim() },
        });
      }
      console.log(label, 'event updated', { calendarId, eventId: existingId });
    } else {
      // Create a new event with details
      const created = await g.calendar.events.insert({
        calendarId,
        requestBody: {
          summary,
          description,
          location,
          start: { dateTime: startISO, timeZone: LONDON_TZ },
          end:   { dateTime: endISO,   timeZone: LONDON_TZ },
          attendees,
        },
        sendUpdates: 'all',
      });
      const eventId = created.data.id || '';
      console.log(label, 'event created', { calendarId, eventId });

      await prisma.booking.update({
        where: { id: b.id },
        data: { notes: `${(b.notes || '').trim()} [gEventId:${eventId}]`.trim() },
      });
    }
  } catch (e: any) {
    // Don’t fail the webhook – just log
    console.error(label, 'create/update failed:', e?.message || e);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'] as string;
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;
  if (!secret) return res.status(500).send('Missing STRIPE_WEBHOOK_SECRET');

  let event: Stripe.Event;
  try {
    const buf = await readRawBody(req);
    event = stripe.webhooks.constructEvent(buf, sig, secret);
  } catch (err: any) {
    console.error('[stripe] signature verification failed', err?.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        const paymentIntentId =
          (typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id) || null;

        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED', stripePaymentIntentId: paymentIntentId },
          });

          // Create or update the Google Calendar event with FULL details (incl. image links)
          await ensureGoogleEventForBooking(bookingId);
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

    // Always acknowledge so Stripe doesn't retry forever
    return res.status(200).json({ received: true });
  } catch (e: any) {
    console.error('[stripe] webhook handler error', e?.message || e);
    // Still return 200 to avoid infinite retries if Google fails repeatedly
    return res.status(200).json({ received: true, warning: e?.message || 'non-fatal' });
  }
}
