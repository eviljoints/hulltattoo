// pages/api/design-images.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string[] | { error: string }>
) {
  const designsDir = path.join(process.cwd(), 'public', 'designs')
  try {
    const files = await fs.readdir(designsDir)
    const images = files.filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f))
    res.status(200).json(images)
  } catch (err: any) {
    console.error('/api/design-images error', err)
    res.status(500).json({ error: 'Failed to load image list' })
  }
}
