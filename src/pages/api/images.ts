// pages/api/admin/images.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { list, put, del } from '@vercel/blob'

type FileMeta        = { name: string; url: string }
type ErrorResp       = { error: string }
type SuccessDelete   = { success: true }
type RenameRequest   = { oldName: string; newName: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FileMeta[] | FileMeta | SuccessDelete | ErrorResp>
) {
  const token = process.env.BLOB_READ_WRITE_TOKEN as string

  try {
    // ─── LIST ─────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const { blobs } = await list({ token })
      const designs = blobs
        .filter(b => b.pathname.startsWith('designs/'))
        .map(b => ({
          name: b.pathname.replace(/^designs\//, ''),
          url:  b.url,
        }))
      return res.status(200).json(designs)
    }

    // ─── RENAME ────────────────────────────────────────────────────────────
    if (req.method === 'PATCH') {
      const { oldName, newName } = req.body as RenameRequest
      if (!oldName || !newName) {
        return res.status(400).json({ error: 'Missing oldName or newName' })
      }

      // locate the blob
      const { blobs } = await list({ token })
      const src = blobs.find(b => b.pathname === `designs/${oldName}`)
      if (!src) {
        return res.status(404).json({ error: 'Source file not found' })
      }

      // fetch its data
      const fetchRes = await fetch(src.url)
      if (!fetchRes.ok) {
        throw new Error(`Failed to fetch blob: ${fetchRes.status}`)
      }
      const buffer = Buffer.from(await fetchRes.arrayBuffer())

      // write it under the new name
      await put(`designs/${newName}`, buffer, { access: 'public', token })

      // delete the old blob
      await del(`designs/${oldName}`, { token })

      // respond with new metadata
      return res.status(200).json({
        name: newName,
        url:  src.url.replace(oldName, newName),
      })
    }

    // ─── DELETE ────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const name = typeof req.query.name === 'string' ? req.query.name : undefined
      if (!name) {
        return res.status(400).json({ error: 'Missing name query parameter' })
      }
      await del(`designs/${name}`, { token })
      return res.status(200).json({ success: true })
    }

    // ─── FALLBACK ─────────────────────────────────────────────────────────
    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  } catch (err: any) {
    console.error('API /admin/images error:', err)
    return res.status(500).json({ error: err.message || 'Server error' })
  }
}
