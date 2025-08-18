import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { requireAdmin } from '~/lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdmin(req, res))) return;
  const { id } = req.query as { id: string };

  try {
    if (req.method === 'GET') {
      const item = await prisma.service.findUnique({ where: { id } });
      if (!item) return res.status(404).json({ error: 'Not found' });
      return res.json({ item });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const data = req.body || {};
      const item = await prisma.service.update({ where: { id }, data });
      return res.json({ item });
    }

    if (req.method === 'DELETE') {
      await prisma.service.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET, PUT, PATCH, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
