// /src/pages/api/admin/artists.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { requireAdmin } from '~/lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const isGet = req.method === 'GET';
    const onlyActive = req.query.active === '1' || req.query.active === 'true';

    if (isGet && onlyActive) {
      // PUBLIC: return active artists for booking page (limited fields)
      const items = await prisma.artist.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          roleTitle: true,
          image: true,
          instagram: true,
          facebook: true,
          isActive: true,
        },
      });
      return res.status(200).json({ items });
    }

    // All other routes require admin auth (await and early-return on 401)
    if (!(await requireAdmin(req, res))) return;

    if (req.method === 'GET') {
      const items = await prisma.artist.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          roleTitle: true,
          image: true,
          instagram: true,
          facebook: true,
          isActive: true,
        },
      });
      return res.status(200).json({ items });
    }

    if (req.method === 'POST') {
      const { name, slug, roleTitle, image, instagram, facebook, isActive } = req.body || {};
      if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });

      const item = await prisma.artist.create({
        data: {
          name,
          slug,
          roleTitle: roleTitle ?? null,
          image: image ?? null,
          instagram: instagram ?? null,
          facebook: facebook ?? null,
          isActive: typeof isActive === 'boolean' ? isActive : true,
        },
      });
      return res.status(201).json({ item });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('/api/admin/artists error', e);
    if (!res.headersSent) {
      return res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
  }
}
