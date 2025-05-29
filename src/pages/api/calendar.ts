// pages/api/calendar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import ICAL from 'ical.js'

type Booking = {
  title: string
  start: string   // ISO strings
  end: string
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Booking[] | { error: string }>
) {
  try {
    // 1) Fetch the public ICS feed server-side (no CORS)
    const icsRes = await fetch(
      'https://calendar.google.com/calendar/ical/laycock131%40gmail.com/public/basic.ics'
    )
    if (!icsRes.ok) throw new Error(`Google returned ${icsRes.status}`)
    const icsText = await icsRes.text()

    // 2) Parse via ical.js
    const jcal = ICAL.parse(icsText)
    const comp = new ICAL.Component(jcal)
    const vevents = comp.getAllSubcomponents('vevent')

    // 3) Map to simple JSON
    const events: Booking[] = vevents.map((ve) => {
      const evt = new ICAL.Event(ve)
      return {
        title: evt.summary || 'Booked',
        start: evt.startDate.toJSDate().toISOString(),
        end: evt.endDate.toJSDate().toISOString(),
      }
    })

    res.status(200).json(events)
  } catch (e: any) {
    console.error('API /calendar error:', e)
    res.status(500).json({ error: 'Failed to fetch calendar' })
  }
}
