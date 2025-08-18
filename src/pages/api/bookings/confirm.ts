// src/pages/api/bookings/confirm.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { stripe } from '~/lib/stripe';
import { insertEvent } from '~/lib/google';
import { sendMail } from '~/lib/email';

const LONDON_TZ = 'Europe/London';
const STUDIO_EMAIL = process.env.EMAIL_USER || 'admin@hulltattoostudio.com';

function formatGBP(pence?: number | null) {
  const val = typeof pence === 'number' ? pence : 0;
  return `£${(val / 100).toFixed(2)}`;
}
function parseNotes(notes: string | null) {
  if (!notes) return {};
  try { return JSON.parse(notes) || {}; } catch { return {}; }
}
function formatWhenRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: LONDON_TZ,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  const s = start.toLocaleString('en-GB', opts);
  const e = end.toLocaleString('en-GB', { timeZone: LONDON_TZ, hour: '2-digit', minute: '2-digit' });
  return `${s} – ${e} (${LONDON_TZ})`;
}
function buildEventDescription(booking: any) {
  const extra = parseNotes(booking.notes);
  const lines: string[] = [];
  lines.push(`Service: ${booking.service?.title || ''}`);
  lines.push(`Artist: ${booking.artist?.name || ''}`);
  lines.push(`Customer: ${booking.customerName || booking.customerEmail || 'N/A'}`);
  lines.push(`Email: ${booking.customerEmail || 'N/A'}`);
  lines.push(`When: ${formatWhenRange(booking.start, booking.end)}`);
  lines.push(`Price: ${formatGBP(booking.totalAmount)} ${booking.currency || 'GBP'}`);
  if (extra.placement) lines.push(`Placement: ${extra.placement}`);
  if (extra.brief) { lines.push('Brief:'); lines.push(extra.brief); }
  const imgs: string[] = Array.isArray(extra.images) ? extra.images : [];
  if (imgs.length) {
    lines.push('Images:');
    imgs.forEach((u, i) => lines.push(`${i + 1}. ${u}`));
  }
  lines.push('');
  lines.push(`Booking ID: ${booking.id}`);
  return lines.join('\n');
}
function buildStudioEmailHTML(booking: any) {
  const extra = parseNotes(booking.notes);
  const imgs: string[] = Array.isArray(extra.images) ? extra.images : [];
  return `
    <h2>New Booking Confirmed</h2>
    <p><strong>Service:</strong> ${booking.service?.title || ''}</p>
    <p><strong>Artist:</strong> ${booking.artist?.name || ''}</p>
    <p><strong>Customer:</strong> ${booking.customerName || booking.customerEmail || 'N/A'}</p>
    <p><strong>Email:</strong> ${booking.customerEmail || 'N/A'}</p>
    <p><strong>When:</strong> ${formatWhenRange(booking.start, booking.end)}</p>
    <p><strong>Price:</strong> ${formatGBP(booking.totalAmount)} ${booking.currency || 'GBP'}</p>
    ${extra.placement ? `<p><strong>Placement:</strong> ${extra.placement}</p>` : ''}
    ${extra.brief ? `<p><strong>Brief:</strong><br/>${String(extra.brief).replace(/\n/g, '<br/>')}</p>` : ''}
    ${
      imgs.length
        ? `<p><strong>Images:</strong><br/>${imgs.map(u => `<a href="${u}" target="_blank" rel="noreferrer">${u}</a>`).join('<br/>')}</p>`
        : ''
    }
    <p><strong>Booking ID:</strong> ${booking.id}</p>
  `;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({ error:'Method Not Allowed' }); }

  try {
    const { session_id, bookingId: bookingIdQ } = (req.body || req.query || {}) as { session_id?: string; bookingId?: string };
    if (!session_id && !bookingIdQ) return res.status(400).json({ error: 'session_id or bookingId required' });

    // Verify via Stripe when session_id is present
    let bookingId = bookingIdQ;
    let paymentIntentId: string | undefined;
    if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ['payment_intent'] });
      if (session.payment_status !== 'paid') return res.status(402).json({ error: 'Payment not completed' });
      bookingId = (session.metadata?.bookingId as string) || bookingIdQ || undefined;
      const pi = session.payment_intent as any;
      paymentIntentId = (pi && typeof pi === 'object') ? pi.id : undefined;
    }
    if (!bookingId) return res.status(400).json({ error: 'bookingId missing' });

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { artist: true, service: true },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'CONFIRMED') return res.status(200).json({ ok: true, already: true });

    // conflict check vs CONFIRMED
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

    // GCal event with full text
    let gEventId: string | null = null;
    try {
      gEventId = await insertEvent({
        artistId: booking.artistId,
        start: booking.start,
        end: booking.end,
        summary: `${booking.service.title} – ${booking.customerName || booking.customerEmail || 'Client'}`,
        description: buildEventDescription(booking),
        timeZone: LONDON_TZ,
        attendees: booking.customerEmail ? [{ email: booking.customerEmail }] : undefined,
        location: 'Hull Tattoo Studio, 255 Hedon Road, Hull, HU9 1NQ',
      });
    } catch (e: any) {
      console.error('[confirm] insertEvent failed:', e?.message || e);
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        stripePaymentIntentId: paymentIntentId || booking.stripePaymentIntentId || null,
        notes: JSON.stringify({
          ...(parseNotes(booking.notes) || {}),
          gcalEventId: gEventId || null,
          stripePaymentIntentId: paymentIntentId || null,
        }),
      },
    });

    // Email studio with full details
    try {
      await sendMail({
        to: STUDIO_EMAIL,
        subject: `New booking – ${booking.service.title} with ${booking.artist.name} – ${formatWhenRange(booking.start, booking.end)}`,
        html: buildStudioEmailHTML(booking),
      });
    } catch (e: any) {
      console.error('[confirm] studio email failed:', e?.message || e);
    }

    return res.status(200).json({ ok: true, gcalEventId: gEventId });
  } catch (err: any) {
    console.error('/api/bookings/confirm error', err?.message || err, err?.stack);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
