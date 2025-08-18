// ./src/pages/api/bookings/checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

function required(v?: string) {
  return typeof v === 'string' && v.trim().length > 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Ensure proper server key
    const secret = process.env.STRIPE_SECRET_KEY || '';
    if (!secret || !secret.startsWith('sk_')) {
      console.error('[checkout] Misconfigured STRIPE_SECRET_KEY (must start with sk_)');
      return res.status(500).json({ error: 'Payment configuration error' });
    }

    const { artistId, serviceId, startISO, customerEmail, customerName, notes } = req.body || {};
    if (!required(artistId) || !required(serviceId) || !required(startISO) || !required(customerEmail)) {
      return res.status(400).json({ error: 'artistId, serviceId, startISO, customerEmail are required' });
    }

    const start = new Date(startISO);
    if (isNaN(start.getTime())) return res.status(400).json({ error: 'Invalid startISO' });

    // Fetch artist + service
    const [artist, service] = await Promise.all([
      prisma.artist.findUnique({ where: { id: String(artistId) } }),
      prisma.service.findUnique({ where: { id: String(serviceId) } }),
    ]);
    if (!artist?.isActive) return res.status(400).json({ error: 'Artist not active or not found' });
    if (!service?.active) return res.status(400).json({ error: 'Service not active or not found' });

    // Duration and end time
    const durationMin = service.durationMin ?? 60;
    const end = new Date(start.getTime() + durationMin * 60_000);

    // Price with per-artist override (ServiceOnArtist)
    let unitAmount = service.priceGBP || 0;
    const link = await prisma.serviceOnArtist.findUnique({
      where: { artistId_serviceId: { artistId: artist.id, serviceId: service.id } },
      select: { priceGBP: true, active: true },
    });
    if (link) {
      if (link.active === false) return res.status(400).json({ error: 'Service not offered by this artist' });
      if (typeof link.priceGBP === 'number' && link.priceGBP >= 0) unitAmount = link.priceGBP;
    }
    if (!unitAmount || unitAmount < 50) {
      console.error('[checkout] Invalid amount (pence):', unitAmount);
      return res.status(400).json({ error: 'Invalid service price' });
    }

    // Quick double-booking guard
    const clash = await prisma.booking.findFirst({
      where: {
        artistId: artist.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        AND: [{ start: { lt: end } }, { end: { gt: start } }],
      },
    });
    if (clash) return res.status(409).json({ error: 'Time slot just taken. Pick another slot.' });

    // Create pending booking (note: totalAmount per your schema)
    const booking = await prisma.booking.create({
      data: {
        artistId: artist.id,
        serviceId: service.id,
        start,
        end,
        status: 'PENDING',
        totalAmount: unitAmount,
        currency: 'GBP',
        customerEmail: String(customerEmail),
        customerName: customerName ? String(customerName) : null,
        notes: notes ? String(notes) : null,
      },
      include: { service: true, artist: true },
    });

    // Stripe Checkout — show all eligible & enabled methods
    const site = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'auto',
      automatic_payment_methods: { enabled: true }, // ✅ lets Stripe render all eligible, enabled methods

      billing_address_collection: 'auto',

      client_reference_id: booking.id,
      metadata: { bookingId: booking.id, artistId: artist.id, serviceId: service.id },
      payment_intent_data: {
        metadata: { bookingId: booking.id, artistId: artist.id, serviceId: service.id },
      },

      customer_email: booking.customerEmail || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'gbp',
            unit_amount: unitAmount,
            product_data: {
              name: booking.service.title,
              description: `Artist: ${booking.artist.name} • ${durationMin} min • ${start.toLocaleString('en-GB', { timeZone: 'Europe/London' })}`,
            },
          },
        },
      ],
      success_url: `${site}/booking/success?bookingId=${booking.id}`,
      cancel_url: `${site}/booking/cancelled?bookingId=${booking.id}`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('[checkout] error', {
      message: err?.message,
      type: err?.type,
      code: err?.code,
      stack: err?.stack,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
