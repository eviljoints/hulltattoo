// pages/api/admin/designs.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()
const designsDir = path.join(process.cwd(), 'public', 'designs')

// simple slugify helper
function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\.]+/g, '')
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CREATE
  if (req.method === 'POST') {
    try {
      const { name, price, artistName, imagePath, description } = req.body
      if (!name || !price || !artistName || !imagePath || !description) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // parse & floor to whole pounds
      const priceInt = Math.floor(Number(price))

      // rename file: slugify name + preserve ext
      const ext = path.extname(imagePath)
      const safeName = slugify(name)
      const newFilename = `${safeName}${ext}`
      const oldPath = path.join(designsDir, imagePath)
      const newPath = path.join(designsDir, newFilename)
      if (oldPath !== newPath) {
        await fs.rename(oldPath, newPath).catch(() => {})
      }

      // next pageNumber = max + 1
      const last = await prisma.tattooDesign.findFirst({
        orderBy: { pageNumber: 'desc' },
        select:  { pageNumber: true }
      })
      const pageNumber = last ? last.pageNumber + 1 : 1

      const design = await prisma.tattooDesign.create({
        data: {
          name,
          price:      new Prisma.Decimal(priceInt),
          artistName,
          imagePath:  newFilename,
          description,
          pageNumber
        }
      })
      return res.status(200).json(design)
    } catch (err: any) {
      console.error('POST /api/admin/designs error:', err)
      return res.status(500).json({ error: err.message })
    }
  }

  // DELETE
  if (req.method === 'DELETE') {
    try {
      const rawId =
        typeof req.query.id === 'string'
          ? req.query.id
          : (req.body.id as string)
      const id = parseInt(rawId, 10)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Missing or invalid id' })
      }

      const design = await prisma.tattooDesign.findUnique({ where: { id } })
      if (!design) {
        return res.status(404).json({ error: 'Design not found' })
      }

      // remove from DB + disk
      await prisma.tattooDesign.delete({ where: { id } })
      await fs.unlink(path.join(designsDir, design.imagePath)).catch(() => {})

      return res.status(200).json({ success: true })
    } catch (err: any) {
      console.error('DELETE /api/admin/designs error:', err)
      return res.status(500).json({ error: err.message })
    }
  }

  // LIST
  if (req.method === 'GET') {
    try {
      const designs = await prisma.tattooDesign.findMany({
        orderBy: { pageNumber: 'asc' }
      })
      return res.status(200).json(designs)
    } catch (err: any) {
      console.error('GET /api/admin/designs error:', err)
      return res.status(500).json({ error: 'Fetch failed' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
  res.status(405).end('Method Not Allowed')
}
