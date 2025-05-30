// pages/api/admin/generate-description.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI()

type Success = { generatedName: string; description: string }
type Failure = { error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Success | Failure>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { rawName, prompt, imageUrl } = req.body as {
    rawName?: string
    prompt?: string
    imageUrl?: string
  }

  if (!rawName || !prompt) {
    return res
      .status(400)
      .json({ error: 'Missing `rawName` or `prompt`' })
  }

  try {
    const system = `
You are a creative, tongue-in-cheek marketing copywriter for a tattoo studio.
If an image is provided, use it to inspire your copy; otherwise rely on text only.
Output *only* valid JSON:
{
  "generatedName": "...",
  "description": "..."
}
End the description with "DM to book", include 3–5 hashtags, and add our address: 255 Hedon Road, HU9 1NQ.
    `.trim()

    // build the user prompt
    let userContent = `Raw title: "${rawName}"\nPrompt: "${prompt}"`

    // if we have a blob URL, pass it as a markdown image link
    if (imageUrl) {
      userContent += `\n\n![tattoo-design](${imageUrl})`
    }

    // choose a vision-capable model when there's an image
    const model = imageUrl ? 'gpt-4o-mini' : 'gpt-3.5-turbo'

    const chat = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: userContent },
      ],
      temperature: 0.8,
      max_tokens: 400,
    })

    const raw = chat.choices[0]?.message?.content || ''
    const m   = raw.match(/\{[\s\S]*\}/)

    let generatedName = rawName
    let description   = raw.trim()

    if (m) {
      try {
        const p = JSON.parse(m[0])
        if (p.generatedName) generatedName = p.generatedName
        if (p.description)   description   = p.description
      } catch {
        // ignore parse errors
      }
    }

    return res.status(200).json({ generatedName, description })
  } catch (err: any) {
    console.error('generate-description error:', err)
    return res
      .status(500)
      .json({ error: err.message || 'Failed to generate description' })
  }
}
