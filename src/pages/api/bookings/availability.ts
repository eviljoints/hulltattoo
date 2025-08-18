// /src/pages/api/bookings/availability.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { getCalendarClientForArtist } from '~/lib/google';

/**
 * OPENING HOURS (Europe/London)
 * Mon-Fri: 09:30–17:30
 * Sat-Sun: 11:30–19:30
 */
const LONDON_TZ = 'Europe/London';
const OPENING_HOURS: Record<number, { start: string; end: string }> = {
  0: { start: '11:30', end: '19:30' }, // Sun
  1: { start: '09:30', end: '17:30' }, // Mon
  2: { start: '09:30', end: '17:30' }, // Tue
  3: { start: '09:30', end: '17:30' }, // Wed
  4: { start: '09:30', end: '17:30' }, // Thu
  5: { start: '09:30', end: '17:30' }, // Fri
  6: { start: '11:30', end: '19:30' }, // Sat
};

type Iso = string;
type Window = { start: Iso; end: Iso };

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Get "+01:00" / "+00:00" offset string for a date in a given tz (BST vs GMT). */
function tzOffsetIso(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(date);
  const off = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT';
  // Examples: "GMT", "GMT+1", "UTC+1"
  const m = off.match(/([+-]\d+)/);
  const hours = m ? parseInt(m[1], 10) : 0;
  const sign = hours >= 0 ? '+' : '-';
  const hh = String(Math.abs(hours)).padStart(2, '0');
  return `${sign}${hh}:00`;
}

/** Build a Date for YYYY-MM-DD at HH:mm in the given timezone (using offset for that day). */
function dateAtLocalTime(ymd: string, hm: string, tz: string): Date {
  const [Y, M, D] = ymd.split('-').map(Number);
  const [h, m] = hm.split(':').map(Number);
  const probe = new Date(Date.UTC(Y, (M - 1), D, 12)); // midday to get correct offset
  const off = tzOffsetIso(probe, tz);
  return new Date(`${ymd}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000${off}`);
}

function overlaps(a: Window, b: Window) {
  const as = +new Date(a.start);
  const ae = +new Date(a.end);
  const bs = +new Date(b.start);
  const be = +new Date(b.end);
  return !(ae <= bs || as >= be);
}

function clampToDay(win: Window, open: Window): Window | null {
  const s = Math.max(+new Date(win.start), +new Date(open.start));
  const e = Math.min(+new Date(win.end), +new Date(open.end));
  if (e <= s) return null;
  return { start: new Date(s).toISOString(), end: new Date(e).toISOString() };
}

function sortByStart(a: Window, b: Window) {
  return +new Date(a.start) - +new Date(b.start);
}

function mergeOverlaps(wins: Window[]): Window[] {
  if (wins.length <= 1) return wins.slice();
  const sorted = wins.slice().sort(sortByStart);
  const out: Window[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = out[out.length - 1];
    const cur = sorted[i];
    if (+new Date(cur.start) <= +new Date(prev.end)) {
      // merge
      prev.end = new Date(Math.max(+new Date(prev.end), +new Date(cur.end))).toISOString();
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

function addMinutes(iso: Iso, minutes: number) {
  return new Date(+new Date(iso) + minutes * 60000).toISOString();
}

/** Step through a day generating candidate appointment starts that fit inside opening hours. */
function generateCandidates(open: Window, stepMin: number, slotLenMin: number): Window[] {
  const out: Window[] = [];
  let start = open.start;
  const lastStart = addMinutes(open.end, -slotLenMin);
  while (+new Date(start) <= +new Date(lastStart)) {
    const end = addMinutes(start, slotLenMin);
    out.push({ start, end });
    start = addMinutes(start, stepMin);
  }
  return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const label = '[availability]';
  try {
    const { artistId, from, to, serviceId } = req.query as {
      artistId: string;
      from: string;
      to: string;
      serviceId?: string; // optional (client may not pass; we’ll compute with all services if missing)
    };

    if (!artistId || !from || !to) {
      console.error(label, 'Missing params', { artistId: !!artistId, from, to });
      return res.status(400).json({ error: 'artistId, from, to required' });
    }

    // Read the service (if provided) so we can compute slot lengths
    let service: { id: string; slug: string; durationMin: number; bufferBeforeMin: number | null; bufferAfterMin: number | null } | null = null;
    if (serviceId) {
      service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { id: true, slug: true, durationMin: true, bufferBeforeMin: true, bufferAfterMin: true },
      });
      if (!service) {
        console.error(label, 'Service not found', { serviceId });
        return res.status(404).json({ error: 'Service not found' });
      }
    }

    console.log(label, 'Params OK', {
      artistId,
      from,
      to,
      serviceSlug: service?.slug,
      tz: LONDON_TZ,
    });

    // Fetch artist to ensure exists
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      select: { id: true, name: true, calendarId: true, googleTokens: true },
    });
    if (!artist) {
      console.error(label, 'Artist not found', { artistId });
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Prepare busy windows from DB bookings
    const dbBusy = await prisma.booking.findMany({
      where: {
        artistId,
        // overlap with [from, to]
        start: { lt: new Date(to) },
        end: { gt: new Date(from) },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { start: true, end: true, id: true, status: true },
      orderBy: { start: 'asc' },
    });
    let busy: Window[] = dbBusy.map(b => ({ start: b.start.toISOString(), end: b.end.toISOString() }));
    console.log(label, `DB busy count=${dbBusy.length}`);

    // Merge Google Calendar busy if connected
    try {
      const g = await getCalendarClientForArtist(artistId);
      if (g) {
        const timeMin = new Date(from).toISOString();
        const timeMax = new Date(to).toISOString();
        console.log(label, 'Querying Google freebusy', { calendarId: g.calendarId, timeMin, timeMax });
        const fb = await g.calendar.freebusy.query({
          requestBody: { timeMin, timeMax, items: [{ id: g.calendarId }] },
        });
        const gBusy = fb.data.calendars?.[g.calendarId!]?.busy || [];
        console.log(label, `Google busy count=${gBusy.length}`);
        busy.push(
          ...gBusy
            .filter(b => b.start && b.end)
            .map(b => ({ start: new Date(b.start!).toISOString(), end: new Date(b.end!).toISOString() }))
        );
      } else {
        console.log(label, 'Google not linked, skipping calendar busy');
      }
    } catch (ge: any) {
      console.error(label, 'Google freebusy error', ge?.message || ge);
    }

    busy = mergeOverlaps(busy);

    // Walk days and compute opening windows, candidates, and day summaries
    const startDate = new Date(from);
    const endDate = new Date(to);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const STEP_MIN = 15; // candidates every 15 minutes
    const slotLenMin = (service?.durationMin || 60) // default duration if no service provided
      + (service?.bufferBeforeMin || 0)
      + (service?.bufferAfterMin || 0);

    const days: Record<string, { free: Window[]; busy: Window[] }> = {};
    const slotsBySlug: Record<string, Window[]> = service ? { [service.slug]: [] } : {};

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const ymd = toYMD(d);
      const dow = new Date(d).getDay();
      const hours = OPENING_HOURS[dow];
      if (!hours) continue;

      // Opening window in London for this day
      const open: Window = {
        start: dateAtLocalTime(ymd, hours.start, LONDON_TZ).toISOString(),
        end: dateAtLocalTime(ymd, hours.end, LONDON_TZ).toISOString(),
      };

      // Build BUSY windows for this day by intersecting with open, then merge
      const dayBusy = mergeOverlaps(
        busy
          .map(w => clampToDay(w, open))
          .filter((w): w is Window => !!w)
      );

      // Generate candidate free windows (slot length)
      const candidates = generateCandidates(open, STEP_MIN, slotLenMin);

      const free: Window[] = [];
      candidates.forEach(c => {
        // expand candidate by buffers around the appointment
        const buffBefore = service?.bufferBeforeMin || 0;
        const buffAfter = service?.bufferAfterMin || 0;
        const test: Window = {
          start: addMinutes(c.start, -buffBefore),
          end: addMinutes(c.end, buffAfter),
        };
        const hasOverlap = dayBusy.some(b => overlaps(test, b));
        if (!hasOverlap) {
          free.push(c);
          if (service) slotsBySlug[service.slug].push(c);
        }
      });

      days[ymd] = { free, busy: dayBusy };
    }

    console.log(label, 'Computed days', {
      dayCount: Object.keys(days).length,
      sample: Object.entries(days)[0]?.[1]?.free?.length ?? 0,
    });

    return res.status(200).json({ slots: slotsBySlug, days });
  } catch (e: any) {
    console.error('[availability] FATAL', e?.message || e, e?.stack);
    return res.status(500).json({
      error: 'Internal Server Error',
      detail: e?.message || String(e),
    });
  }
}
