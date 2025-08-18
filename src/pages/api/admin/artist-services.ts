// /src/pages/api/admin/artist-services.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { requireAdmin } from '~/lib/adminAuth';

/**
 * GET ?artistId=... → list mappings for that artist
 * PUT body: { artistId, serviceId, priceGBP?, active? } → upsert mapping
 * DELETE body: { id } → delete mapping
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === 'GET') {
      const { artistId } = req.query as { artistId?: string };
      if (!artistId) return res.status(400).json({ error: 'artistId required' });

      const items = await prisma.serviceOnArtist.findMany({
        where: { artistId },
        include: { service: true }
      });
      return res.json({ items });
    }

    if (req.method === 'PUT') {
      const { artistId, serviceId, priceGBP, active } = req.body || {};
      if (!artistId || !serviceId) return res.status(400).json({ error: 'artistId and serviceId required' });

      const item = await prisma.serviceOnArtist.upsert({
        where: { artistId_serviceId: { artistId, serviceId } },
        update: {
          priceGBP: priceGBP == null ? null : Number(priceGBP),
          active: typeof active === 'boolean' ? active : undefined
        },
        create: {
          artistId,
          serviceId,
          priceGBP: priceGBP == null ? null : Number(priceGBP),
          active: typeof active === 'boolean' ? active : true
        }
      });

      return res.json({ item });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await prisma.serviceOnArtist.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e:any) {
    return res.status(500).json({ error: e.message });
  }
}
