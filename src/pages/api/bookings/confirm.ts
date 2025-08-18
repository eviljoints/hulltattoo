// src/pages/api/bookings/confirm.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { stripe } from '~/lib/stripe';
import { insertEvent } from '~/lib/google';

const LONDON_TZ = 'Europe/London';

function mergeNotes(notes: string | null, patch: Record<string, any>) {
  let base: Record<string, any> = {};
  try { if (notes) base = JSON.parse(notes); } catch {}
  return JSON.stringify({ ...base, ...patch });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({ error:'Method Not Allowed' }); }

  try {
    const { session_id, bookingId: bookingIdQ } = (req.body || req.query || {}) as { session_id?: string; bookingId?: string };
    if (!session_id && !bookingIdQ) return res.status(400).json({ error: 'session_id or bookingId required' });

    // 1) Verify with Stripe
    let bookingId = bookingIdQ;
    let paymentIntentId: string | undefined;

    if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ['payment_intent'] });
      if (session.payment_status !== 'paid') return res.status(402).json({ error: 'Payment not completed' });
      bookingId = (session.metadata?.bookingId as string) || bookingIdQ || undefined;
      const pi = session.payment_intent as any;
      paymentIntentId = (pi && typeof pi === 'object') ? pi.id : undefined;
      if (!bookingId) return res.status(400).json({ error: 'No bookingId on session' });
    }
    if (!bookingId) return res.status(400).json({ error: 'bookingId missing' });

    // 2) Load booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { artist: true, service: true },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status === 'CONFIRMED') return res.status(200).json({ ok: true, already: true });

    // 3) Final overlap check (CONFIRMED conflict)
    const overlapping = await prisma.booking.findFirst({
      where: {
        artistId: booking.artistId,
        NOT: { id: booking.id },
        status: 'CONFIRMED',
        AND: [{ start: { lt: booking.end } }, { end: { gt: booking.start } }],
      },
      select: { id: true },
    });
    if (overlapping) {
      await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } });
      return res.status(409).json({ error: 'Time was taken by another confirmed booking' });
    }

    // 4) Insert Google Calendar event
    let gEventId: string | null = null;
    try {
      gEventId = await insertEvent({
        artistId: booking.artistId,
        start: booking.start,
        end: booking.end,
        summary: `${booking.service.title} – ${booking.customerName || booking.customerEmail || 'Client'}`,
        description: 'Booked via Hull Tattoo Studio',
        timeZone: LONDON_TZ,
        attendees: booking.customerEmail ? [{ email: booking.customerEmail }] : undefined,
        location: 'Hull Tattoo Studio, 255 Hedon Road, Hull, HU9 1NQ',
      });
    } catch (e: any) {
      console.error('[confirm] insertEvent failed:', e?.message || e);
      // continue; still confirm to avoid user confusion
    }

    // 5) Confirm
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

    return res.status(200).json({ ok: true, gcalEventId: gEventId });
  } catch (err: any) {
    console.error('/api/bookings/confirm error', err?.message || err, err?.stack);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
