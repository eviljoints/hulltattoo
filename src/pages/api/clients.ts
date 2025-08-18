// ./src/pages/api/clients.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';

// NOTE:
// - We interpret `clientId` to mean the User.id
// - We only return users with role = CUSTOMER
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const name    = (req.query.name as string | undefined)?.trim();
    const clientId = (req.query.clientId as string | undefined)?.trim();
    const email   = (req.query.email as string | undefined)?.trim();

    if (!name && !clientId && !email) {
      return res.status(400).json({ error: 'Provide at least one of: clientId, email, name' });
    }

    const where: any = { role: 'CUSTOMER' as const };

    // If id provided, use it directly
    if (clientId) {
      where.id = clientId;
    }

    // If email provided, add it (AND)
    if (email) {
      where.email = email;
    }

    // If name provided, add case-insensitive match (AND)
    if (name) {
      where.name = { equals: name, mode: 'insensitive' };
    }

    const user = await prisma.user.findFirst({
      where,
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true, role: true },
    });

    if (!user) return res.status(404).json({ error: 'Client not found' });

    return res.status(200).json({ item: user });
  } catch (err: any) {
    console.error('/api/clients error', err?.message || err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}
