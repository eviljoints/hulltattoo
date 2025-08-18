import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { stripe } from '~/lib/stripe';

type Iso = string;
const LONDON_TZ = 'Europe/London';

function addMinutes(iso: Iso, m: number) {
  return new Date(new Date(iso).getTime() + m * 60000).toISOString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      artistId, serviceId, startISO, customerEmail, customerName,
      placement, brief, imageUrls // string[]
    } = req.body || {};

    if (!artistId || !serviceId || !startISO || !customerEmail) {
      return res.status(400).json({ error: 'artistId, serviceId, startISO, customerEmail required' });
    }

    const [artist, service] = await Promise.all([
      prisma.artist.findUnique({ where: { id: artistId }, select: { id: true, name: true } }),
      prisma.service.findUnique({
        where: { id: serviceId },
        select: {
          id: true, slug: true, title: true,
          durationMin: true, bufferBeforeMin: true, bufferAfterMin: true,
          priceGBP: true, active: true
        }
      }),
    ]);

    if (!artist) return res.status(404).json({ error: 'Artist not found' });
    if (!service || !service.active) return res.status(404).json({ error: 'Service not found or inactive' });

    // Effective price: per-artist override via ServiceOnArtist, else base Service.priceGBP
    let unitAmount = Number(service.priceGBP || 0);
    const soa = await prisma.serviceOnArtist.findUnique({
      where: { artistId_serviceId: { artistId, serviceId } },
      select: { priceGBP: true, active: true },
    }).catch(() => null);

    if (soa && soa.active && soa.priceGBP != null) {
      unitAmount = Number(soa.priceGBP);
    }

    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({ error: 'Invalid price for service' });
    }

    const duration = Number(service.durationMin || 60);
    const endISO = addMinutes(startISO, duration);

    // Prevent double-booking
    const conflict = await prisma.booking.findFirst({
      where: {
        artistId,
        start: { lt: new Date(endISO) },
        end: { gt: new Date(startISO) },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { id: true },
    });
    if (conflict) {
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
        artistId,
        serviceId,
        start: new Date(startISO),
        end: new Date(endISO),
        status: 'PENDING',
        totalAmount: unitAmount,   // matches your schema
        currency: 'GBP',
        notes,
        customerEmail: customerEmail || null,
        customerName: customerName || null,
      },
      select: { id: true },
    });

    const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/book?success=1&bid=${booking.id}`;
    const cancelUrl  = `${process.env.NEXT_PUBLIC_SITE_URL}/book?canceled=1&bid=${booking.id}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
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
      metadata: {
        bookingId: booking.id,
        artistId, serviceId, startISO, endISO,
        placement: (placement || '').slice(0, 200),
        image: Array.isArray(imageUrls) && imageUrls[0] ? imageUrls[0] : '',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

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
