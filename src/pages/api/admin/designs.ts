// src/pages/api/admin/designs.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ─── LIST ─────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const designs = await prisma.tattooDesign.findMany({
        orderBy: { pageNumber: 'asc' },
      })
      return res.status(200).json(designs)
    } catch (err: any) {
      console.error('GET /api/admin/designs error:', err)
      return res.status(500).json({ error: 'Fetch failed' })
    }
  }

  // ─── CREATE ────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const { name, price, artistName, imagePath, description } = req.body
      if (
        !name ||
        price === undefined ||
        !artistName ||
        !imagePath ||
        !description
      ) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // parse & floor to whole pounds
      const priceInt = Math.floor(Number(price))

      // determine next pageNumber
      const last = await prisma.tattooDesign.findFirst({
        orderBy: { pageNumber: 'desc' },
        select:  { pageNumber: true },
      })
      const pageNumber = last ? last.pageNumber + 1 : 1

      const design = await prisma.tattooDesign.create({
        data: {
          name,
          price:      new Prisma.Decimal(priceInt),
          artistName,
          imagePath,               // store your full Blob URL
          description,
          pageNumber,
        },
      })
      return res.status(201).json(design)
    } catch (err: any) {
      console.error('POST /api/admin/designs error:', err)
      return res.status(500).json({ error: err.message })
    }
  }

  // ─── DELETE ────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      // id can come in query or in body
      const rawId =
        typeof req.query.id === 'string'
          ? req.query.id
          : (req.body.id as string)
      const id = parseInt(rawId, 10)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Missing or invalid id' })
      }

      await prisma.tattooDesign.delete({ where: { id } })
      // NOTE: we do *not* delete the Blob file here; if you want to,
      // you can call Vercel Blob's delete API separately.

      return res.status(200).json({ success: true })
    } catch (err: any) {
      console.error('DELETE /api/admin/designs error:', err)
      return res.status(500).json({ error: err.message })
    }
  }

  // ─── METHOD NOT ALLOWED ────────────────────────────────────────────────
  res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
