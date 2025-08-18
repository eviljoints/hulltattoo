// /src/pages/api/admin/services.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { requireAdmin } from '~/lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const isGet = req.method === 'GET';
    const onlyActive = req.query.active === '1' || req.query.active === 'true';

    if (isGet && onlyActive) {
      // PUBLIC: return active services for booking page (limited fields)
      const items = await prisma.service.findMany({
        where: { active: true },
        orderBy: { title: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          durationMin: true,
          priceGBP: true,
          depositGBP: true,
          depositPct: true,
          bufferBeforeMin: true,
          bufferAfterMin: true,
          active: true,
        },
      });
      return res.status(200).json({ items });
    }

    // Admin for all other cases
    if (!(await requireAdmin(req, res))) return;

    if (req.method === 'GET') {
      const items = await prisma.service.findMany({
        where: onlyActive ? { active: true } : undefined,
        orderBy: { title: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          durationMin: true,
          priceGBP: true,
          depositGBP: true,
          depositPct: true,
          bufferBeforeMin: true,
          bufferAfterMin: true,
          active: true,
        },
      });
      return res.status(200).json({ items });
    }

    if (req.method === 'POST') {
      const {
        title, slug, description,
        durationMin, priceGBP, depositGBP, depositPct,
        bufferBeforeMin, bufferAfterMin, active,
      } = req.body || {};

      if (!title || !slug) {
        return res.status(400).json({ error: 'title and slug are required' });
      }

      const item = await prisma.service.create({
        data: {
          title,
          slug,
          description: description ?? null,
          durationMin: Number(durationMin) || 60,
          priceGBP: Number(priceGBP) || 0,
          depositGBP: depositGBP == null ? null : Number(depositGBP),
          depositPct: depositPct == null ? null : Number(depositPct),
          bufferBeforeMin: bufferBeforeMin == null ? 0 : Number(bufferBeforeMin),
          bufferAfterMin: bufferAfterMin == null ? 0 : Number(bufferAfterMin),
          active: typeof active === 'boolean' ? active : true,
        },
      });
      return res.status(201).json({ item });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('/api/admin/services error', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
    }
  }
}
