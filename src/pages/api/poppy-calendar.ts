// pages/api/poppy-calendar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import ICAL from 'ical.js'

type Booking = {
  title: string
  start: string  // ISO timestamp
  end: string    // ISO timestamp
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Booking[] | { error: string }>
) {
  try {
    const icsRes = await fetch(
      'https://calendar.google.com/calendar/ical/dd7a6a79f797b04aaaf576d0294c4fad3f329e68a1cd7ba7228a0638f582084b%40group.calendar.google.com/private-c00ddb615048b4497f181c17fcf97a68/basic.ics'
    )
    if (!icsRes.ok) throw new Error(`Google returned ${icsRes.status}`)
    const icsText = await icsRes.text()

    const jcal    = ICAL.parse(icsText)
    const comp    = new ICAL.Component(jcal)
    const vevents = comp.getAllSubcomponents('vevent')

    const events: Booking[] = vevents.map((ve) => {
      const evt = new ICAL.Event(ve)
      return {
        title: evt.summary || 'Booked',
        start: evt.startDate.toJSDate().toISOString(),
        end:   evt.endDate.toJSDate().toISOString(),
      }
    })

    res.status(200).json(events)
  } catch (e: any) {
    console.error('API /poppy-calendar error:', e)
    res.status(500).json({ error: 'Failed to fetch calendar' })
  }
}
