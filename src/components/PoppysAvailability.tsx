// components/PoppysAvailability.tsx
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

// Mirror Mike's availability for Poppy
export default function PoppysAvailability() {
  const [events, setEvents]         = useState<EventInput[]>([])
  const [viewType, setViewType]     = useState<'Week'|'Month'>('Week')
  const [selectedPeriod, setPeriod] = useState<Date>(startOfWeek(new Date(), { weekStartsOn:1 }))
  const [post, setPost]             = useState<string>('')
  const [generating, setGenerating] = useState(false)

  const wrapperRef    = useRef<HTMLDivElement>(null)
  const calendarRef   = useRef<FullCalendar>(null)
  const weekMondayRef = useRef<Date>(startOfWeek(new Date(), { weekStartsOn:1 }))

  // fetch Poppy's bookings
  useEffect(() => {
    fetch('/api/poppy-calendar')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: {title:string;start:string;end:string}[]) => {
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

  // build dropdowns
  const weekOptions = Array.from({ length: 4 }).map((_,i) => ({
    label: formatDate(startOfWeek(addWeeks(new Date(),i), {weekStartsOn:1}), 'dd/MM/yyyy'),
    date:  startOfWeek(addWeeks(new Date(),i), {weekStartsOn:1})
  }))
  const monthOptions = Array.from({ length: 4 }).map((_,i) => ({
    label: formatDate(startOfMonth(addMonths(new Date(),i)), 'MMMM yyyy'),
    date:  startOfMonth(addMonths(new Date(),i))
  }))

  // reset on viewType change
  useEffect(() => {
    setPeriod(viewType==='Week' ? weekOptions[0].date : monthOptions[0].date)
  }, [viewType])

  // sync calendar
  useEffect(() => {
    const api = calendarRef.current?.getApi()
    if(api) {
      api.changeView(viewType==='Week' ? 'timeGridWeek' : 'dayGridMonth')
      api.gotoDate(selectedPeriod)
    }
    if(viewType==='Week') {
      weekMondayRef.current = startOfWeek(selectedPeriod, {weekStartsOn:1})
    }
  }, [selectedPeriod, viewType])

  const handleDatesSet = (arg: DatesSetArg) => {
    if(viewType==='Week') weekMondayRef.current = startOfWeek(arg.start, {weekStartsOn:1})
  }

  const downloadImage = async () => {
    if(!wrapperRef.current) return
    const canvas = await html2canvas(wrapperRef.current, { backgroundColor: '#000' })
    const link   = document.createElement('a')
    link.download = `poppy-availability-${formatDate(weekMondayRef.current,'yyyy-MM-dd')}.png`
    link.href     = canvas.toDataURL('image/png')
    link.click()
  }

  // compute free slots same as Mike
  function computeHourlySlots(busy:{title:string;start:string;end:string}[], start:Date, end:Date) {
    type Slot = {start:Date,end:Date}
    const rawFree: Slot[] = []
    let day = new Date(start)
    while(day < end) {
      const dow = day.getDay()
      const win = BUSINESS_WINDOW[dow]
      if(win) {
        const [oh,om] = win.start.split(':').map(Number)
        const [ch,cm] = win.end.split(':').map(Number)
        let cursor = new Date(day.getFullYear(),day.getMonth(),day.getDate(),oh,om)
        const closing = new Date(day.getFullYear(),day.getMonth(),day.getDate(),ch,cm)
        const todays = busy.map(e=>({start:new Date(e.start),end:new Date(e.end)}))
                            .filter(e=>e.start<closing&&e.end>cursor)
                            .sort((a,b)=>a.start.getTime()-b.start.getTime())
        todays.forEach(ev=>{
          if(ev.start>cursor) rawFree.push({start:cursor,end:ev.start})
          cursor = ev.end<closing?ev.end:closing
        })
        if(cursor<closing) rawFree.push({start:cursor,end:closing})
      }
      day = addDays(day,1)
    }
    const slots: Slot[] = []
    for(const w of rawFree) {
      let slotStart = new Date(w.start)
      while(addHours(slotStart,1)<=w.end) {
        slots.push({start:new Date(slotStart), end:addHours(slotStart,1)})
        slotStart = addHours(slotStart,1)
      }
    }
    return slots
  }

  const handleGeneratePost = async () => {
    setGenerating(true); setPost('')
    const simpleBusy = events.map(e=>({title:e.title as string,start:new Date(e.start as string).toISOString(),end:new Date(e.end as string).toISOString()}))
    const start = selectedPeriod
    const end   = viewType==='Week'? addWeeks(selectedPeriod,1): addMonths(selectedPeriod,1)
    const hours = computeHourlySlots(simpleBusy, start, end)
    let payload:string
    if(hours.length===0) payload = `Poppy is fully booked between ${formatDate(start,'dd/MM/yyyy')} and ${formatDate(end,'dd/MM/yyyy')}. Drop us a message to join the waitlist! 📩`
    else {
      const bullets = hours.map(h=>`- ${formatDate(h.start,'dd/MM/yyyy HH:mm')} to ${formatDate(h.end,'HH:mm')}`).join('\n')
      payload = `Here are Poppy’s available 1-hour slots between ${formatDate(start,'dd/MM/yyyy')} and ${formatDate(end,'dd/MM/yyyy')}:\n\n${bullets}\n\nDrop us a message to book your slot! 📩`
    }
    try {
      const res = await fetch('/api/generate-availability-post', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:payload})})
      const json=await res.json()
      if(!res.ok) throw new Error(json.error||res.statusText)
      setPost(json.post)
    } catch(err:any) {
      setPost(`Error: ${err.message}`)
    } finally { setGenerating(false) }
  }

  return (
    <div ref={wrapperRef} style={{background:'#000',color:'#fff',padding:'1rem'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <h2>Poppy’s Availability</h2>
        <div style={{display:'flex',gap:8}}>
          <select value={viewType} onChange={e=>setViewType(e.target.value as any)}>
            <option value='Week'>Week</option>
            <option value='Month'>Month</option>
          </select>
          <select value={selectedPeriod.toISOString()} onChange={e=>setPeriod(new Date(e.target.value))}>
            {(viewType==='Week'?weekOptions:monthOptions).map(o=><option key={o.label} value={o.date.toISOString()}>{o.label}</option>)}
          </select>
          <button onClick={downloadImage} style={{background:'#ff007f',color:'#fff',border:'none',padding:'0.5rem 1rem',borderRadius:4}}>Save as Image</button>
        </div>
      </header>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin]}
        initialView={viewType==='Week'?'timeGridWeek':'dayGridMonth'}
        headerToolbar={false}
        allDaySlot={false}
        slotDuration="01:00:00"
        slotMinTime="09:30:00"
        slotMaxTime="17:30:00"
        hiddenDays={[0,1]}
        businessHours={[{daysOfWeek:[2,3,4,5],startTime:'09:30',endTime:'15:00'},{daysOfWeek:[6],startTime:'11:30',endTime:'17:30'}]}
        height="auto"
        events={events}
        datesSet={handleDatesSet}
        eventDisplay="block"
        nowIndicator={false}
        slotLabelFormat={{hour:'numeric',minute:'2-digit',hour12:false}}
        dayHeaderFormat={{weekday:'short'}}
      />

      <div style={{marginTop:'1rem'}}>
        <button onClick={handleGeneratePost} disabled={generating} style={{background:generating?'#888':'#00d4ff',color:'#000',border:'none',padding:'0.5rem 1rem',cursor:generating?'wait':'pointer'}}>
          {generating?'Generating…':'Generate Facebook Post'}
        </button>
        {post && <textarea readOnly value={post} rows={8} style={{background:'#00d4ff',width:'100%',marginTop:'0.5rem',padding:'0.5rem',fontFamily:'inherit'}} />}
      </div>
    </div>
  )
}

// reuse business window from Mike
const BUSINESS_WINDOW: Record<number,{start:string,end:string}> = {
  2:{start:'09:30',end:'15:00'},
  3:{start:'09:30',end:'15:00'},
  4:{start:'09:30',end:'15:00'},
  5:{start:'09:30',end:'15:00'},
  6:{start:'11:30',end:'17:30'},
}
