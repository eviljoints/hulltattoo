import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { stripe } from '~/lib/stripe';
import { insertEvent } from '~/lib/google';
import { buildICS } from '~/lib/ics';
import { sendMail } from '~/lib/email';

const LONDON_TZ = 'Europe/London';
const STUDIO_EMAIL = process.env.EMAIL_USER || 'admin@hulltattoostudio.com';

function parseNotes(notes: string | null) {
  if (!notes) return {};
  try { return JSON.parse(notes) || {}; } catch { return {}; }
}
function formatGBP(pence?: number | null) {
  const val = typeof pence === 'number' ? pence : 0;
  return `£${(val / 100).toFixed(2)}`;
}
function formatWhenRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: LONDON_TZ, weekday: 'short', year: 'numeric', month: 'short',
    day: '2-digit', hour: '2-digit', minute: '2-digit'
  };
  const s = start.toLocaleString('en-GB', opts);
  const e = end.toLocaleString('en-GB', { timeZone: LONDON_TZ, hour: '2-digit', minute: '2-digit' });
  return `${s} – ${e} (${LONDON_TZ})`;
}
function buildEventDescription(booking: any) {
  const extra = parseNotes(booking.notes);
  const imgs: string[] = Array.isArray(extra.images) ? extra.images : [];
  return [
    `Service: ${booking.service?.title || ''}`,
    `Artist: ${booking.artist?.name || ''}`,
    `Customer: ${booking.customerName || booking.customerEmail || 'N/A'}`,
    `Email: ${booking.customerEmail || 'N/A'}`,
    `When: ${formatWhenRange(booking.start, booking.end)}`,
    `Price: ${formatGBP(booking.totalAmount)} ${booking.currency || 'GBP'}`,
    extra.placement ? `Placement: ${extra.placement}` : '',
    extra.brief ? `Brief:\n${extra.brief}` : '',
    imgs.length ? `Images:\n${imgs.map((u, i) => `${i + 1}. ${u}`).join('\n')}` : '',
    '',
    `Booking ID: ${booking.id}`,
  ].filter(Boolean).join('\n');
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
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = (req.method === 'POST' ? req.body : req.query) as any;
    const { session_id, bookingId: bookingIdQ } = payload;

    let bookingId = bookingIdQ as string | undefined;
    let paymentIntentId: string | undefined;

    if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(String(session_id), { expand: ['payment_intent'] });
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

    // block if already confirmed conflict
    const clash = await prisma.booking.findFirst({
      where: {
        artistId: booking.artistId,
        NOT: { id: booking.id },
        status: 'CONFIRMED',
        AND: [{ start: { lt: booking.end } }, { end: { gt: booking.start } }],
      },
      select: { id: true },
    });
    if (clash) {
      await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } });
      return res.status(409).json({ error: 'Time was taken by another confirmed booking' });
    }

    // Google event
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

    // Emails
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
                 <p><strong>Artist:</strong> ${booking.artist.name}</p>
                 <p><strong>When:</strong> ${formatWhenRange(booking.start, booking.end)}</p>
                 <p><strong>Price:</strong> ${formatGBP(booking.totalAmount)}</p>
                 <p>We look forward to seeing you.</p>`,
          attachments: [{ filename: 'booking.ics', content: ics, contentType: 'text/calendar' }],
        });
      }

      await sendMail({
        to: STUDIO_EMAIL,
        subject: `New booking – ${booking.service.title} with ${booking.artist.name}`,
        html: buildStudioEmailHTML(booking),
      });
    } catch (emailErr: any) {
      console.error('[email] send failed', emailErr?.message || emailErr);
    }

    return res.status(200).json({ ok: true, gcalEventId: gEventId });
  } catch (err: any) {
    console.error('/api/bookings/confirm error', err?.message || err, err?.stack);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
