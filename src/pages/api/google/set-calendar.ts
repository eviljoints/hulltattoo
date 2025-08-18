// /src/pages/api/google/set-calendar.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '~/lib/adminAuth';
import { prisma } from '~/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdmin(req, res))) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { artistId, calendarId } = req.body || {};
  if (!artistId || !calendarId) return res.status(400).json({ error: 'artistId and calendarId required' });

  await prisma.artist.update({ where: { id: artistId }, data: { calendarId } });
  res.status(200).json({ ok: true });
}
