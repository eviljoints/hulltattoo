// components/MikesAvailability.tsx
import React, { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventInput, DatesSetArg } from '@fullcalendar/core'
import html2canvas from 'html2canvas'
import {
  startOfWeek,
  addWeeks,
  startOfMonth,
  addMonths,
  addDays,
  addHours,
  format as formatDate,
} from 'date-fns'

type BusySlot = { title: string; start: string; end: string }
type FreeSlot = { start: Date; end: Date }

const BUSINESS_WINDOW: Record<number, { start: string; end: string }> = {
  2: { start: '09:30', end: '15:00' }, // Tue
  3: { start: '09:30', end: '15:00' }, // Wed
  4: { start: '09:30', end: '15:00' }, // Thu
  5: { start: '09:30', end: '15:00' }, // Fri
  6: { start: '11:30', end: '17:30' }, // Sat
}

const VIEW_MAP = {
  Week:  'timeGridWeek',
  Month: 'dayGridMonth',
}

export default function MikesAvailability() {
  const [events, setEvents]           = useState<EventInput[]>([])
  const [viewType, setViewType]       = useState<'Week'|'Month'>('Week')
  const [selectedPeriod, setSelected] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [post, setPost]               = useState<string>('')
  const [generating, setGenerating]   = useState(false)

  const wrapperRef  = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<FullCalendar>(null)
  const weekMondayRef = useRef<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )

  // fetch booked events
  useEffect(() => {
    fetch('/api/calendar')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: BusySlot[]) => {
        setEvents(data.map(b => ({
          title: b.title,
          start: b.start,
          end:   b.end,
          backgroundColor: '#ff007f',
          borderColor:     '#ff007f',
          textColor:       '#000',
        })))
      })
      .catch(console.error)
  }, [])

  // build dropdown options
  const weekOptions = Array.from({ length: 4 }).map((_, i) => {
    const monday = startOfWeek(addWeeks(new Date(), i), { weekStartsOn: 1 })
    return { label: formatDate(monday, 'dd/MM/yyyy'), date: monday }
  })
  const monthOptions = Array.from({ length: 4 }).map((_, i) => {
    const m = startOfMonth(addMonths(new Date(), i))
    return { label: formatDate(m, 'MMMM yyyy'), date: m }
  })

  // reset period when toggling view
  useEffect(() => {
    setSelected(viewType === 'Week'
      ? weekOptions[0].date
      : monthOptions[0].date
    )
  }, [viewType])

  // sync calendar view & date
  useEffect(() => {
    const api = calendarRef.current?.getApi()
    if (api) {
      api.changeView(VIEW_MAP[viewType])
      api.gotoDate(selectedPeriod)
    }
    if (viewType === 'Week') {
      weekMondayRef.current = startOfWeek(selectedPeriod, { weekStartsOn: 1 })
    }
  }, [selectedPeriod, viewType])

  const handleDatesSet = (arg: DatesSetArg) => {
    if (viewType === 'Week') {
      weekMondayRef.current = startOfWeek(arg.start, { weekStartsOn: 1 })
    }
  }

  // screenshot
  const downloadImage = async () => {
    if (!wrapperRef.current) return
    const canvas = await html2canvas(wrapperRef.current, { backgroundColor: '#000' })
    const link   = document.createElement('a')
    link.download = `mike-availability-${formatDate(weekMondayRef.current, 'yyyy-MM-dd')}.png`
    link.href     = canvas.toDataURL('image/png')
    link.click()
  }

  // compute free windows per day, then slice into 1-hour blocks
  function computeHourlySlots(
    busy: BusySlot[],
    rangeStart: Date,
    rangeEnd: Date
  ): FreeSlot[] {
    // first build raw free windows
    const rawFree: FreeSlot[] = []
    let day = new Date(rangeStart)
    while (day < rangeEnd) {
      const dow = day.getDay()
      const win = BUSINESS_WINDOW[dow]
      if (win) {
        const [oh, om] = win.start.split(':').map(Number)
        const [ch, cm] = win.end.split(':').map(Number)
        let cursor  = new Date(day.getFullYear(), day.getMonth(), day.getDate(), oh, om)
        const closing= new Date(day.getFullYear(), day.getMonth(), day.getDate(), ch, cm)
        // today's busy slots
        const todays = busy
          .map(e => ({ start: new Date(e.start), end: new Date(e.end) }))
          .filter(e => e.start < closing && e.end > cursor)
          .sort((a,b)=>a.start.getTime()-b.start.getTime())
        todays.forEach(ev => {
          if (ev.start > cursor) rawFree.push({ start: cursor, end: ev.start })
          cursor = ev.end < closing ? ev.end : closing
        })
        if (cursor < closing) rawFree.push({ start: cursor, end: closing })
      }
      day = addDays(day, 1)
    }
    // now slice rawFree into full hour blocks
    const hours: FreeSlot[] = []
    for (const w of rawFree) {
      let slotStart = new Date(w.start)
      while (addHours(slotStart, 1) <= w.end) {
        hours.push({ start: new Date(slotStart), end: addHours(slotStart, 1) })
        slotStart = addHours(slotStart, 1)
      }
    }
    return hours
  }

  // generate post
  const handleGeneratePost = async () => {
    setGenerating(true)
    setPost('')

    // flatten to ISO
    const simpleBusy: BusySlot[] = events.map(e => ({
      title: e.title as string,
      start: new Date(e.start as string).toISOString(),
      end:   new Date(e.end   as string).toISOString(),
    }))

    const start = selectedPeriod
    const end   = viewType === 'Week'
      ? addWeeks(selectedPeriod, 1)
      : addMonths(selectedPeriod, 1)

    const hours = computeHourlySlots(simpleBusy, start, end)

    let payload: string
    if (hours.length === 0) {
      payload = `Mike is fully booked between ${formatDate(start,'dd/MM/yyyy')} and ${formatDate(end,'dd/MM/yyyy')}. Drop us a message to join the waitlist! 📩`
    } else {
      const bullets = hours.map(h =>
        `- ${formatDate(h.start,'dd/MM/yyyy HH:mm')} to ${formatDate(h.end,'HH:mm')}`
      ).join('\n')
      payload = `
Here are Mike’s available 1-hour slots between ${formatDate(start,'dd/MM/yyyy')} and ${formatDate(end,'dd/MM/yyyy')}:

${bullets}

Drop us a message to book your slot! 📩
      `.trim()
    }

    try {
      const res = await fetch('/api/generate-availability-post', {
        method:  'POST',
        headers: { 'Content-Type':'application/json' },
        body:    JSON.stringify({ prompt: payload }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || res.statusText)
      setPost(json.post)
    } catch (err: any) {
      setPost(`Error: ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div ref={wrapperRef} style={{ background:'#acf', color:'#000', padding:'1rem' }}>
      {/* controls */}
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
        <h2>Mike’s Availability</h2>
        <div style={{ display:'flex', gap:8 , background:'#acf', color:'#00ffff', padding:'1rem'}}>
          <select value={viewType} onChange={e=>setViewType(e.target.value as any)}>
            <option value="Week">Week</option>
            <option value="Month">Month</option>
          </select>
          <select
            value={selectedPeriod.toISOString()}
            onChange={e=>setSelected(new Date(e.target.value))}
          >
            {(viewType==='Week'? weekOptions : monthOptions).map(o=>(
              <option key={o.label} value={o.date.toISOString()}>
                {o.label}
              </option>
            ))}
          </select>
          <button onClick={downloadImage} style={{ background:'#ff007f', color:'#fff', border:'none', padding:'0.5rem', borderRadius:4 }}>
            Save as Image
          </button>
        </div>
      </header>

      {/* calendar */}
      <FullCalendar
        ref={calendarRef}
        plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
        initialView={VIEW_MAP[viewType]}
        headerToolbar={false}
        allDaySlot={false}
        slotDuration="01:00:00"
        slotMinTime="09:30:00"
        slotMaxTime="17:30:00"
        hiddenDays={[0,1]}
        businessHours={[
          { daysOfWeek:[2,3,4,5], startTime:'09:30', endTime:'15:00' },
          { daysOfWeek:[6],         startTime:'11:30', endTime:'17:30' },
        ]}
        height="auto"
        events={events}
        datesSet={handleDatesSet}
        eventDisplay="block"
        nowIndicator={false}
        slotLabelFormat={{ hour:'numeric', minute:'2-digit', hour12:false }}
        dayHeaderFormat={{ weekday:'short' }}
      />

      {/* Facebook post */}
      <div style={{ marginTop:'1rem' }}>
        <button
          onClick={handleGeneratePost}
          disabled={generating}
          style={{
            background: generating ? '#888' : '#00d4ff',
            color:      '#000d0c',
            border:     'none',
            padding:    '0.5rem 1rem',
            cursor:     generating ? 'wait' : 'pointer',
          }}
        >
          {generating ? 'Generating…' : 'Generate Facebook Post'}
        </button>
        {post && (
          <textarea
            readOnly
            value={post}
            rows={8}
            style={{ 
              background: '#00d4ff', width:'100%', marginTop:'0.5rem', padding:'0.5rem', fontFamily:'inherit' }}
          />
        )}
      </div>
    </div>
  )
}
