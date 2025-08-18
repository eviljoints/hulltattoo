// /src/pages/api/google/calendar-list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '~/lib/adminAuth';
import { getCalendarClientForArtist } from '~/lib/google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdmin(req, res))) return;
  const artistId = req.query.artistId as string;
  if (!artistId) return res.status(400).json({ error: 'artistId required' });

  const client = await getCalendarClientForArtist(artistId);
  if (!client) return res.status(200).json({ items: [] });

  const list = await client.calendar.calendarList.list({ maxResults: 50 });
  res.status(200).json({ items: list.data.items || [] });
}
