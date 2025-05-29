// src/pages/api/admin/upload-design.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { IncomingForm, File as FormidableFile, Files } from 'formidable'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { put } from '@vercel/blob'

export const config = { api: { bodyParser: false } }

type Failure = { ok: false; error: string }
type Success = { ok: true; filename: string; url: string }
type Resp    = Failure | Success

// Now returns fields as a plain object so TS won't infer 'never'
function parseForm(req: NextApiRequest): Promise<{
  fields: Record<string, any>
  files:  Files
}> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir:     os.tmpdir(),
      keepExtensions: true,
      maxFileSize:   10 * 1024 * 1024, // 10MB
    })
    form.parse(req, (err, fields, files) =>
      err ? reject(err) : resolve({ fields: fields as Record<string, any>, files })
    )
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Resp>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  // 1. Parse the form
  let fields: Record<string, any>, files: Files
  try {
    ;({ fields, files } = await parseForm(req))
  } catch (err: any) {
    console.error('Form parse error', err)
    return res.status(400).json({ ok: false, error: err.message || 'Parsing failed' })
  }

  // 2. Grab the uploaded file (array vs single)
  const fileField = files.file
  if (!fileField) {
    return res.status(400).json({ ok: false, error: 'Missing file field' })
  }
  const fileArray = Array.isArray(fileField) ? fileField : [fileField]
  const uploadedFile: FormidableFile = fileArray[0]

  // 3. Validate it's an image
  if (!uploadedFile.mimetype?.startsWith('image/')) {
    fs.unlink(uploadedFile.filepath, () => {})
    return res.status(400).json({ ok: false, error: 'Only image files allowed' })
  }

  // 4. Build a safe filename
  const originalName    = uploadedFile.originalFilename || path.basename(uploadedFile.filepath)
  const ext             = path.extname(originalName)
  const rawFilename     = typeof fields.filename === 'string' ? fields.filename.trim() : ''
  const base            = rawFilename || path.basename(originalName, ext)
  const safeBase        = base.replace(/\s+/g, '-').replace(/[^\w\-]/g, '')
  const finalFilename   = `${safeBase}${ext}`

  // 5. Upload to Vercel Blob
  try {
    const token  = process.env.BLOB_READ_WRITE_TOKEN as string
    const stream = fs.createReadStream(uploadedFile.filepath)
    const { url } = await put(`designs/${finalFilename}`, stream, {
      access: 'public',
      token,
    })

    // clean up temp file
    fs.unlink(uploadedFile.filepath, () => {})

    return res.status(200).json({ ok: true, filename: finalFilename, url })
  } catch (err: any) {
    console.error('Blob upload error', err)
    return res.status(500).json({ ok: false, error: 'Blob upload failed' })
  }
}
