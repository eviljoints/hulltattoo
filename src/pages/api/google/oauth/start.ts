// /src/pages/api/google/oauth/start.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '~/lib/adminAuth';
import { getAuthUrl } from '~/lib/google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only admins can kick off the link flow
  if (!(await requireAdmin(req, res))) return;

  const artistId = req.query.artistId as string;
  if (!artistId) return res.status(400).json({ error: 'artistId required' });

  // state = artistId (you can extend this with a nonce if you like)
  const authUrl = getAuthUrl(artistId);
  res.redirect(authUrl);
}
