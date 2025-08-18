// ./src/pages/api/bookings/checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { stripe } from '~/lib/stripe';

type Iso = string;
const LONDON_TZ = 'Europe/London';
const HOLD_MINUTES = Number(process.env.BOOKING_HOLD_MINUTES || 20); // fresh-hold window

function addMinutes(iso: Iso, m: number) {
  return new Date(new Date(iso).getTime() + m * 60000).toISOString();
}

function siteOriginFromReq(req: NextApiRequest) {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env && /^https?:\/\//i.test(env)) return env.replace(/\/+$/,'');
  const host = req.headers.host || 'localhost:3000';
  const proto = host.includes('localhost') ? 'http' : 'https';
  return `${proto}://${host}`;
}

function required(v?: string) {
  return typeof v === 'string' && v.trim().length > 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Stripe sanity (server key must be set, must start with sk_)
    const secret = process.env.STRIPE_SECRET_KEY || '';
    if (!secret || !secret.startsWith('sk_')) {
      console.error('[checkout] Misconfigured STRIPE_SECRET_KEY (must start with sk_)');
      return res.status(500).json({ error: 'Payment configuration error' });
    }

    const {
      artistId, serviceId, startISO, customerEmail, customerName,
      placement, brief, imageUrls // string[]
    } = req.body || {};

    if (!required(artistId) || !required(serviceId) || !required(startISO) || !required(customerEmail)) {
      return res.status(400).json({ error: 'artistId, serviceId, startISO, customerEmail required' });
    }

    const [artist, service] = await Promise.all([
      prisma.artist.findUnique({ where: { id: String(artistId) }, select: { id: true, name: true, isActive: true } }),
      prisma.service.findUnique({
        where: { id: String(serviceId) },
        select: {
          id: true, slug: true, title: true,
          durationMin: true, bufferBeforeMin: true, bufferAfterMin: true,
          priceGBP: true, active: true
        }
      }),
    ]);

    if (!artist?.isActive) return res.status(404).json({ error: 'Artist not found or inactive' });
    if (!service?.active) return res.status(404).json({ error: 'Service not found or inactive' });

    let unitAmount = Number(service.priceGBP || 0);
    const soa = await prisma.serviceOnArtist.findUnique({
      where: { artistId_serviceId: { artistId: artist.id, serviceId: service.id } },
      select: { priceGBP: true, active: true },
    }).catch(() => null);

    if (soa) {
      if (soa.active === false) return res.status(400).json({ error: 'Service not offered by this artist' });
      if (soa.priceGBP != null) unitAmount = Number(soa.priceGBP);
    }
    if (!Number.isFinite(unitAmount) || unitAmount < 50) {
      return res.status(400).json({ error: 'Invalid price for service' });
    }

    // Duration + end time
    const duration = Number(service.durationMin || 60);
    const endISO = addMinutes(startISO, duration);

    // Quick double-booking guard
    const pendingFreshAfter = new Date(Date.now() - HOLD_MINUTES * 60_000);
    const clash = await prisma.booking.findFirst({
      where: {
        artistId: artist.id,
        AND: [{ start: { lt: new Date(endISO) } }, { end: { gt: new Date(startISO) } }],
        OR: [
          { status: 'CONFIRMED' },
          { status: 'PENDING', createdAt: { gt: pendingFreshAfter } }, // only fresh PENDING blocks
        ],
      },
      select: { id: true, status: true, createdAt: true },
    });

    if (clash) {
      return res.status(409).json({ error: 'That time has just been taken. Please pick another slot.' });
    }

    // Store form details in notes as JSON
    const details = {
      name: customerName || null,
      email: customerEmail,
      placement: placement || null,
      brief: brief || null,
      images: Array.isArray(imageUrls) ? imageUrls.slice(0, 3) : [],
      tz: LONDON_TZ,
    };
    const notes = JSON.stringify(details);

    // Hold slot (PENDING)
    const booking = await prisma.booking.create({
      data: {
        artistId: artist.id,
        serviceId: service.id,
        start: new Date(startISO),
        end: new Date(endISO),
        status: 'PENDING',
        totalAmount: unitAmount,   // per your schema
        currency: 'GBP',
        notes,
        customerEmail: String(customerEmail),
        customerName: customerName ? String(customerName) : null,
      },
      include: { service: true, artist: true },
    });

    const origin = siteOriginFromReq(req);
    const successUrl = `${origin}/booking/success?bookingId=${booking.id}`;
    const cancelUrl  = `${origin}/booking/cancelled?bookingId=${booking.id}`;

    // Stripe Checkout — show all eligible methods you enabled in Dashboard
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'auto',
      automatic_payment_methods: { enabled: true }, // let Stripe render Apple/Google Pay, Klarna, Clearpay, Revolut Pay, etc.

      billing_address_collection: 'auto',

      client_reference_id: booking.id,
      metadata: {
        bookingId: booking.id,
        artistId: artist.id,
        serviceId: service.id,
        startISO, endISO,
        placement: (placement || '').slice(0, 200),
        image: Array.isArray(imageUrls) && imageUrls[0] ? String(imageUrls[0]) : '',
      },
      payment_intent_data: {
        metadata: {
          bookingId: booking.id,
          artistId: artist.id,
          serviceId: service.id,
        },
      },

      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: unitAmount,
            product_data: {
              name: `${service.title} with ${artist.name}`,
              description: new Date(startISO).toLocaleString('en-GB', {
                timeZone: LONDON_TZ, weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
              }),
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Expire session (Stripe will emit checkout.session.expired for your webhook to cancel the PENDING hold)
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    // Keep a reference to the session (handy in dashboard & cross-checks)
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeCheckoutId: session.id },
    });

    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.error('/api/bookings/checkout error', e?.message || e, e?.stack);
    return res.status(500).json({ error: 'Internal Server Error', detail: e?.message || String(e) });
  }
}
