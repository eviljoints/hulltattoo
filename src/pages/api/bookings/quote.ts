import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { artistId, serviceId } = (req.method === 'POST' ? req.body : req.query) as any;
    if (!artistId || !serviceId) return res.status(400).json({ error: 'artistId and serviceId required' });

    const svc = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true, title: true, slug: true, active: true,
        priceGBP: true, durationMin: true, bufferBeforeMin: true, bufferAfterMin: true
      }
    });
    if (!svc || !svc.active) return res.status(404).json({ error: 'Service not found or inactive' });

    // Per-artist override via ServiceOnArtist
    let unitAmount = Number(svc.priceGBP || 0);
    const soa = await prisma.serviceOnArtist.findUnique({
      where: { artistId_serviceId: { artistId, serviceId } },
      select: { priceGBP: true, active: true },
    }).catch(() => null);

    if (soa && soa.active && soa.priceGBP != null) {
      unitAmount = Number(soa.priceGBP);
    }

    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({ error: 'Invalid price configuration' });
    }

    return res.status(200).json({
      ok: true,
      service: { id: svc.id, title: svc.title, slug: svc.slug },
      pricePence: unitAmount,
      durationMin: Number(svc.durationMin || 60),
      bufferBeforeMin: Number(svc.bufferBeforeMin || 0),
      bufferAfterMin: Number(svc.bufferAfterMin || 0),
    });
  } catch (e: any) {
    console.error('/api/bookings/quote error', e?.message || e);
    return res.status(500).json({ error: 'Internal Server Error', detail: e?.message });
  }
}
