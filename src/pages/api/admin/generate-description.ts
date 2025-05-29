import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI()  // reads OPENAI_API_KEY from env

type Success = { generatedName: string; description: string }
type Failure = { error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Success | Failure>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }

  const { rawName, prompt } = req.body as { rawName?: string; prompt?: string }
  if (!rawName || !prompt) {
    return res.status(400).json({ error: 'Missing `rawName` or `prompt`' })
  }

  try {
    const system = `
You are a creative marketing copywriter for a tattoo studio.
Take the user’s raw tattoo name and their short prompt, and output JSON:
{
  "generatedName": "...",
  "description": "..."
}
End the description with "DM to book" and include 3–5 hashtags.
    `.trim()

    const user = `
Raw name: "${rawName}"
Prompt: "${prompt}"
    `.trim()

    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.8,
      max_tokens: 300,
    })

    const raw = chat.choices[0]?.message?.content || ''

    // 1) locate the JSON object in the returned text
    const m = raw.match(/\{[\s\S]*\}/)
    let generatedName = rawName
    let description   = raw.trim()

    if (m) {
      try {
        const parsed = JSON.parse(m[0])
        if (parsed.generatedName) generatedName = parsed.generatedName
        if (parsed.description)   description   = parsed.description
      } catch {
        // if JSON.parse fails, we'll fall back to rawName & full raw text
      }
    }

    return res.status(200).json({ generatedName, description })
  } catch (err: any) {
    console.error('generate-description error:', err)
    return res.status(500).json({ error: 'Failed to generate description' })
  }
}
