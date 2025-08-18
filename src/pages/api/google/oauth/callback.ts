// /src/pages/api/google/oauth/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { saveTokensForArtist } from '~/lib/google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;
  const state = req.query.state as string; // contains artistId
  if (!code || !state) return res.status(400).send('Missing code/state');

  // Verify artist exists
  const artist = await prisma.artist.findUnique({ where: { id: state }, select: { id: true, name: true } });
  if (!artist) return res.status(400).send('Invalid artist');

  await saveTokensForArtist(artist.id, code);

  // Back to admin artists page
  const base = process.env.NEXT_PUBLIC_SITE_URL || '';
  res.redirect(`${base}/admin/artists`);
}
