// /src/pages/api/admin/clients/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { requireAdmin } from '~/lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.query as { id: string };

  try {
    switch (req.method) {
      case 'GET': {
        const item = await prisma.user.findUnique({
          where: { id },
          select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
        });
        if (!item) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json({ item });
      }

      case 'PUT': {
        const { name, email } = req.body || {};
        const item = await prisma.user.update({
          where: { id },
          data: {
            ...(name !== undefined ? { name } : {}),
            ...(email !== undefined ? { email } : {}),
            role: 'CUSTOMER', // keep as customer
          },
          select: { id: true, name: true, email: true, updatedAt: true },
        });
        return res.status(200).json({ item });
      }

      case 'DELETE': {
        try {
          await prisma.user.delete({ where: { id } });
          return res.status(204).end();
        } catch (err: any) {
          // Foreign key constraint (bookings refer to this user)
          if (err?.code === 'P2003') {
            return res.status(409).json({
              error:
                'Cannot delete this customer because they have bookings. Remove or reassign those bookings first.',
            });
          }
          throw err;
        }
      }

      default:
        res.setHeader('Allow', 'GET, PUT, DELETE');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (err: any) {
    console.error('/api/admin/clients/[id] error', err?.message || err);
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Email already exists' });
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}
