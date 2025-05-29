import type { NextApiRequest, NextApiResponse } from 'next'
import { list } from '@vercel/blob'

type FileMeta = { name:string; url:string }

export default async function handler(_:NextApiRequest,res:NextApiResponse<FileMeta[]|{error:string}>) {
  try {
    const token  = process.env.BLOB_READ_WRITE_TOKEN as string
    const { blobs } = await list({ token })

    const designs = blobs
      .filter(b => b.pathname.startsWith('designs/'))
      .map(b => ({
        name: b.pathname.replace(/^designs\//,''),
        url : b.url,
      }))

    res.status(200).json(designs)
  } catch(err:any) {
    console.error(err)
    res.status(500).json({ error:'List failed' })
  }
}
