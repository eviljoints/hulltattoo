// pages/api/Harley-calendar.ts
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
      'https://calendar.google.com/calendar/ical/5a61bcf24cca0df618bec71c01ac6b9f4ca93276f07e3615c8423f8fc7658392%40group.calendar.google.com/private-04e4297c219b09b582e27a8397cfa876/basic.ics'
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
    console.error('API /Harley-calendar error:', e)
    res.status(500).json({ error: 'Failed to fetch calendar' })
  }
}
