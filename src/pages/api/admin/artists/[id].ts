// ./src/pages/api/admin/artists/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { requireAdmin } from '~/lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  const { id } = req.query as { id: string };

  try {
    if (req.method === 'GET') {
      const item = await prisma.artist.findUnique({ where: { id } });
      if (!item) return res.status(404).json({ error: 'Not found' });
      return res.json({ item });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const data = req.body || {};
      const item = await prisma.artist.update({ where: { id }, data });
      return res.json({ item });
    }

    if (req.method === 'DELETE') {
      await prisma.artist.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET, PUT, PATCH, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e:any) {
    return res.status(500).json({ error: e.message });
  }
}
