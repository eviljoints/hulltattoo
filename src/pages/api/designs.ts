// pages/api/designs.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { artistName } = req.query
  const where = artistName
    ? { artistName: String(artistName) }
    : {}

  try {
    const designs = await prisma.tattooDesign.findMany({
      where,
      orderBy: { pageNumber: 'asc' }
    })
    res.status(200).json(designs)
  } catch (err: any) {
    console.error('GET /api/designs error:', err)
    res.status(500).json({ error: 'Fetch failed' })
  }
}
