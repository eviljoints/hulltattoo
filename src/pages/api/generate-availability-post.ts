// pages/api/generate-availability-post.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ post: string } | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }

  const { prompt } = req.body as { prompt?: string }
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' })
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You write friendly, accurate Facebook posts for a tattoo studio.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const post = response.choices?.[0]?.message?.content?.trim() || ''
    return res.status(200).json({ post })
  } catch (err: any) {
    console.error('generate-availability-post error:', err)
    return res.status(500).json({ error: 'Generation failed' })
  }
}
