// /src/pages/api/admin/clients.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { requireAdmin } from '~/lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdmin(req, res))) return;

  try {
    switch (req.method) {
      case 'GET': {
        const q = (req.query.q as string | undefined)?.trim();
        const items = await prisma.user.findMany({
          where: {
            role: 'CUSTOMER',
            ...(q
              ? {
                  OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                  ],
                }
              : {}),
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return res.status(200).json({ items });
      }

      case 'POST': {
        const { name, email } = req.body || {};
        if (!email) return res.status(400).json({ error: 'email is required' });

        const item = await prisma.user.create({
          data: {
            name: name || null,
            email,
            role: 'CUSTOMER',
          },
          select: { id: true, name: true, email: true, createdAt: true },
        });
        return res.status(201).json({ item });
      }

      default:
        res.setHeader('Allow', 'GET, POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (err: any) {
    console.error('/api/admin/clients error', err?.message || err);
    // Unique email
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}
