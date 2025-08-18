// ./src/pages/api/clients/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email is required' });

    // Reuse by email if exists, and ensure role = CUSTOMER
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    if (existing) {
      if (existing.role !== 'CUSTOMER') {
        await prisma.user.update({ where: { id: existing.id }, data: { role: 'CUSTOMER' } });
      }
      return res.status(200).json({
        created: false,
        item: {
          id: existing.id,
          clientId: existing.id, // compatibility alias
          name: existing.name,
          email: existing.email,
          role: 'CUSTOMER',
          createdAt: existing.createdAt,
          updatedAt: existing.updatedAt,
        },
      });
    }

    // Create new customer
    const user = await prisma.user.create({
      data: { name: name || null, email, role: 'CUSTOMER' },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    return res.status(201).json({
      created: true,
      item: {
        id: user.id,
        clientId: user.id, // expose as clientId if your frontend expects that name
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err: any) {
    // Unique email violation, etc.
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('/api/clients/register error', err?.message || err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
  }
}
