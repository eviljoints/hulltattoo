import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

/** Minimal bearer auth to match your admin dashboard cookie/token flow */
function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const auth = (req.headers.authorization || '').trim();
  if (!auth.startsWith('Bearer ') || auth.length < 20) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return true;
}

function minutesAgoDate(mins: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - mins);
  return d;
}

/** Safely determine if a Checkout Session has been paid */
async function isCheckoutPaid(checkoutId?: string | null): Promise<boolean> {
  if (!checkoutId) return false;
  try {
    const s = await stripe.checkout.sessions.retrieve(checkoutId);

    // Session itself can tell us this:
    if (s.payment_status === 'paid' || s.status === 'complete') return true;

    // Fallback: check the PaymentIntent if present
    if (typeof s.payment_intent === 'string') {
      const pi = await stripe.paymentIntents.retrieve(s.payment_intent);
      if (pi.status === 'succeeded' || pi.status === 'requires_capture') return true;
    }
  } catch (e: any) {
    console.warn('[admin/bookings] Stripe lookup failed', checkoutId, e?.message);
  }
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  try {
    switch (req.method) {
      /**
       * GET /api/admin/bookings?status=PENDING&olderThanMinutes=30&limit=200
       * Lists bookings (no Stripe checks here for speed).
       */
      case 'GET': {
        const status = (req.query.status as string) || 'PENDING';
        const olderThanMinutes = Number(req.query.olderThanMinutes || 0);
        const limit = Math.min(Number(req.query.limit || 200), 500);

        const where: any = { status };
        if (olderThanMinutes > 0) {
          where.createdAt = { lt: minutesAgoDate(olderThanMinutes) };
        }

        const items = await prisma.booking.findMany({
          where,
          orderBy: [{ start: 'asc' }],
          take: limit,
          select: {
            id: true,
            status: true,
            start: true,
            end: true,
            createdAt: true,
            customerEmail: true,
            customerName: true,
            totalAmount: true,
            currency: true,
            stripeCheckoutId: true,
            artist: { select: { id: true, name: true, slug: true } },
            service: { select: { id: true, title: true, slug: true } },
          },
        });

        return res.status(200).json({ items });
      }

      /**
       * PUT /api/admin/bookings
       * Body: { id: string, action: 'cancel' }
       * Cancels a single PENDING booking — but only if *not paid* on Stripe.
       */
      case 'PUT': {
        const { id, action } = (req.body || {}) as { id?: string; action?: string };
        if (!id || action !== 'cancel') {
          return res.status(400).json({ error: 'id and action="cancel" required' });
        }

        const booking = await prisma.booking.findUnique({
          where: { id },
          select: { id: true, status: true, stripeCheckoutId: true },
        });
        if (!booking || booking.status !== 'PENDING') {
          return res.status(409).json({ error: 'Booking not found or not PENDING' });
        }

        if (await isCheckoutPaid(booking.stripeCheckoutId)) {
          // Safety: don’t cancel a paid booking even if webhook didn’t mark it yet
          return res.status(409).json({ error: 'This booking is already paid on Stripe' });
        }

        await prisma.booking.update({
          where: { id },
          data: { status: 'CANCELLED' },
        });

        return res.status(200).json({ ok: true, id });
      }

      /**
       * POST /api/admin/bookings
       * Body: { olderThanMinutes?: number }
       * Bulk-cancels PENDING bookings older than X minutes, skipping any that Stripe shows as paid.
       */
      case 'POST': {
        const olderThanMinutes = Number((req.body?.olderThanMinutes ?? 60));
        const threshold = minutesAgoDate(olderThanMinutes);

        const candidates = await prisma.booking.findMany({
          where: { status: 'PENDING', createdAt: { lt: threshold } },
          select: { id: true, stripeCheckoutId: true },
          take: 1000, // safety upper bound
        });

        // Check Stripe for each candidate with a Checkout session
        const checks = await Promise.all(
          candidates.map(c => isCheckoutPaid(c.stripeCheckoutId))
        );

        const toCancelIds = candidates
          .filter((c, idx) => !checks[idx]) // only unpaid
          .map(c => c.id);

        let count = 0;
        if (toCancelIds.length > 0) {
          const r = await prisma.booking.updateMany({
            where: { id: { in: toCancelIds } },
            data: { status: 'CANCELLED' },
          });
          count = r.count;
        }

        return res.status(200).json({
          ok: true,
          scanned: candidates.length,
          cancelled: count,
          skippedPaid: candidates.length - count,
          olderThanMinutes,
        });
      }

      default: {
        res.setHeader('Allow', 'GET, PUT, POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
      }
    }
  } catch (err: any) {
    console.error('/api/admin/bookings error', err?.message || err, err?.stack);
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}
