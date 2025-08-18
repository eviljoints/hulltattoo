import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'node:fs';
import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

async function parseForm(req: NextApiRequest): Promise<{ files: File[] }> {
  const form = formidable({ multiples: true, maxFiles: 3, maxFileSize: 10 * 1024 * 1024 }); // 10MB each
  return new Promise((resolve, reject) => {
    form.parse(req, (err, _fields, files) => {
      if (err) return reject(err);
      const list = Array.isArray(files.files) ? (files.files as File[]) :
                   files.files ? [files.files as File] : [];
      resolve({ files: list });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { files } = await parseForm(req);
    if (!files.length) return res.status(400).json({ error: 'No files found. Use field name "files".' });

    const urls: string[] = [];
    for (const f of files.slice(0, 3)) {
      const arrayBuf = await fs.promises.readFile(f.filepath);
      const filename = (f.originalFilename || 'upload').replace(/[^\w.\-]/g, '_');
      const ext = (filename.includes('.') ? '' : '.jpg'); // ensure extension if missing
      const blob = await put(`${Date.now()}_${filename}${ext}`, arrayBuf, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: true,
        contentType: f.mimetype || 'application/octet-stream',
      });
      urls.push(blob.url);
    }
    return res.status(200).json({ ok: true, urls });
  } catch (e: any) {
    console.error('/api/upload error', e?.message || e);
    return res.status(500).json({ error: 'Upload failed', detail: e?.message });
  }
}
