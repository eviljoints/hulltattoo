// pages/api/admin/upload-design.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { IncomingForm, File as FormidableFile } from 'formidable'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Disable Next.js body parsing so formidable can handle multipart
export const config = { api: { bodyParser: false } }

type ResponseData = { ok: true; filename: string } | { ok: false; error: string }

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'designs')
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: os.tmpdir(),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    })
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  ensureDir(UPLOAD_DIR)

  let fields, files
  try {
    ;({ fields, files } = await parseForm(req))
  } catch (err: any) {
    console.error('Form parse error', err)
    return res.status(500).json({ ok: false, error: 'Upload failed' })
  }

  const uploaded = Array.isArray(files.file)
    ? files.file[0]
    : (files.file as FormidableFile | undefined)

  if (!uploaded) {
    return res.status(400).json({ ok: false, error: 'Missing file' })
  }

  // Determine base name: user-supplied or fallback to original
  const supplied = typeof fields.filename === 'string' ? fields.filename.trim() : ''
  const origName = uploaded.originalFilename || path.basename(uploaded.filepath)
  const fallbackBase = path.basename(origName, path.extname(origName))
  const baseName = supplied || fallbackBase

  // Optional: restrict to images only
  if (!uploaded.mimetype?.startsWith('image/')) {
    await fs.promises.unlink(uploaded.filepath)
    return res.status(400).json({ ok: false, error: 'Only image files allowed' })
  }

  // Sanitize and assemble final filename
  const safeBase = baseName.replace(/\s+/g, '-').replace(/[^\w\-]/g, '')
  const ext = path.extname(origName)
  const finalFilename = `${safeBase}${ext}`
  const destPath = path.join(UPLOAD_DIR, finalFilename)

  try {
    await fs.promises.rename(uploaded.filepath, destPath)
    return res.status(200).json({ ok: true, filename: finalFilename })
  } catch (err: any) {
    console.error('Rename error', err)
    if (fs.existsSync(uploaded.filepath)) {
      await fs.promises.unlink(uploaded.filepath)
    }
    return res.status(500).json({ ok: false, error: 'Failed to save file' })
  }
}
