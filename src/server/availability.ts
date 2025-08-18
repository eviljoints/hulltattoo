// src/server/availability.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/prisma';
import { getCalendarClientForArtist } from '~/lib/google';

type Slot = { start: string; end: string };
type SlotsByService = Record<string, Slot[]>;
const LONDON_TZ = 'Europe/London';
const STEP_MIN = 15; // start times every 15 minutes

// --- helpers ---
function minutesSinceMidnight(d: Date) { return d.getHours() * 60 + d.getMinutes(); }
function dateAtMinutes(day: Date, minutes: number) {
  const z = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0));
  // use local minutes for Europe/London by constructing from yyyy-mm-dd then adding minutes in local tz
  const local = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
  local.setMinutes(minutes);
  return local;
}
function addMin(d: Date, m: number) { return new Date(d.getTime() + m * 60000); }
function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

type Window = [number, number]; // [startMin, endMin)
function mergeWindows(windows: Window[]): Window[] {
  if (!windows.length) return [];
  const sorted = [...windows].sort((a, b) => a[0] - b[0]);
  const out: Window[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const last = out[out.length - 1];
    if (cur[0] <= last[1]) {
      last[1] = Math.max(last[1], cur[1]); // merge overlap
    } else {
      out.push([cur[0], cur[1]]);
    }
  }
  return out;
}
function subtractWindow(source: Window[], cut: Window): Window[] {
  const [cs, ce] = cut;
  const out: Window[] = [];
  for (const [s, e] of source) {
    if (ce <= s || cs >= e) {
      out.push([s, e]); // no overlap
      continue;
    }
    // left fragment
    if (cs > s) out.push([s, Math.max(s, Math.min(cs, e))]);
    // right fragment
    if (ce < e) out.push([Math.min(ce, e), e]);
  }
  return out;
}

// fallback opening hours if no templates exist
function fallbackWindowsForWeekday(weekday: number): Window[] {
  // 0=Sun..6=Sat
  if (weekday === 0 || weekday === 6) {
    // Sat/Sun 11:30–19:30
    return [[11 * 60 + 30, 19 * 60 + 30]];
  }
  // Mon–Fri 09:30–17:30
  return [[9 * 60 + 30, 17 * 60 + 30]];
}

// --- core: local slot builder (no Google yet) ---
async function buildLocalAvailability(opts: { artistId: string; fromISO: string; toISO: string }) {
  const { artistId, fromISO, toISO } = opts;

  const from = new Date(fromISO);
  const to = new Date(toISO);
  if (!(from instanceof Date) || isNaN(from.getTime()) || !(to instanceof Date) || isNaN(to.getTime())) {
    throw new Error('Invalid from/to dates');
  }
  if (to <= from) throw new Error('to must be after from');

  // Load everything we need up-front
  const [templates, overrides, services, bookings] = await Promise.all([
    prisma.availabilityTemplate.findMany({ where: { artistId } }),
    prisma.availabilityOverride.findMany({
      where: {
        artistId,
        date: { gte: new Date(from.toDateString()), lte: new Date(to.toDateString()) },
      },
    }),
    prisma.service.findMany({
      where: { active: true },
      select: {
        id: true, slug: true, title: true,
        durationMin: true,
        bufferBeforeMin: true, bufferAfterMin: true,
        active: true,
      },
      orderBy: { title: 'asc' },
    }),
    prisma.booking.findMany({
      where: {
        artistId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        start: { lt: to },
        end: { gt: from },
      },
      select: { start: true, end: true },
    }),
  ]);

  // Pre-index templates by weekday
  const byWeekday = new Map<number, Window[]>();
  for (const t of templates) {
    const list = byWeekday.get(t.weekday) || [];
    list.push([t.startMin, t.endMin]);
    byWeekday.set(t.weekday, list);
  }
  for (const k of byWeekday.keys()) {
    byWeekday.set(k, mergeWindows(byWeekday.get(k)!));
  }

  // Pre-index overrides by local date key "YYYY-MM-DD"
  const ovByDay = new Map<string, typeof overrides>();
  for (const o of overrides) {
    const d = new Date(o.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const list = ovByDay.get(key) || [];
    list.push(o);
    ovByDay.set(key, list);
  }

  // Busy blocks from our own bookings (in minutes since midnight for the day)
  function dayBusyWindows(day: Date): Window[] {
    const startOfDay = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
    const endOfDay = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
    const out: Window[] = [];
    for (const b of bookings) {
      if (b.end <= startOfDay || b.start >= endOfDay) continue;
      const sMin = clamp(minutesSinceMidnight(b.start), 0, 24 * 60);
      const eMin = clamp(minutesSinceMidnight(b.end), 0, 24 * 60);
      out.push([sMin, eMin]);
    }
    return mergeWindows(out);
  }

  // Build result map
  const result: { slots: SlotsByService } = { slots: {} };
  const oneDay = 24 * 3600 * 1000;

  for (let t = from.getTime(); t <= to.getTime(); t += oneDay) {
    const day = new Date(t);
    const weekday = day.getDay();

    // Base windows: templates or fallback
    let windows: Window[] = (byWeekday.get(weekday) || fallbackWindowsForWeekday(weekday)).map(w => [...w] as Window);

    // Apply overrides for this date
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const ovs = ovByDay.get(key) || [];
    for (const o of ovs) {
      const range: Window | null =
        typeof o.startMin === 'number' && typeof o.endMin === 'number'
          ? [o.startMin, o.endMin]
          : null;

      if (o.type === 'CLOSED') {
        windows = [];
      } else if (o.type === 'OPEN') {
        windows = range ? mergeWindows([...(windows || []), range]) : windows;
      } else if (o.type === 'EXTEND') {
        windows = range ? mergeWindows([...(windows || []), range]) : windows;
      } else if (o.type === 'REDUCE') {
        windows = range ? windows.reduce((acc, w) => subtractWindow([w], range).length ? acc.concat(subtractWindow([w], range)) : acc, [] as Window[]) : windows;
      }
    }
    windows = mergeWindows(windows);
    if (!windows.length) continue;

    // Artist’s own busy blocks for this day
    const busy = dayBusyWindows(day);

    // For each active service, generate candidate slots for the day
    for (const svc of services) {
      if (!svc.active) continue;

      const dur = Number(svc.durationMin || 60);
      const bufBefore = Number(svc.bufferBeforeMin || 0);
      const bufAfter = Number(svc.bufferAfterMin || 0);

      // Trim windows so that [start, start+dur] fits within base window when including buffers.
      // i.e. allowed start range within [winStart+bufBefore, winEnd - (bufAfter + dur)]
      for (const [winS, winE] of windows) {
        const firstStart = winS + bufBefore;
        const lastStart = winE - (bufAfter + dur);
        if (lastStart < firstStart) continue;

        for (let startMin = firstStart; startMin <= lastStart; startMin += STEP_MIN) {
          const endMin = startMin + dur;

          // Reject if overlaps any internal busy block
          const overlapsBusy = busy.some(([bs, be]) => !(endMin <= bs || startMin >= be));
          if (overlapsBusy) continue;

          // Convert to datetimes
          const start = dateAtMinutes(day, startMin);
          const end = dateAtMinutes(day, endMin);

          // Constrain to global window from/to (defensive)
          if (start < from || end > to) continue;

          const list = (result.slots[svc.slug] = result.slots[svc.slug] || []);
          list.push({ start: start.toISOString(), end: end.toISOString() });
        }
      }
    }
  }

  return result;
}

// ---------------- API handler (adds Google overlay) ----------------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { artistId, from, to } = req.query as { artistId: string; from: string; to: string };
    if (!artistId || !from || !to) {
      return res.status(400).json({ error: 'artistId, from, to required' });
    }

    // 1) Build local candidate slots per service
    const result = await buildLocalAvailability({ artistId, fromISO: from, toISO: to });

    // 2) Overlay Google Calendar busy, if connected
    const g = await getCalendarClientForArtist(artistId);
    if (g) {
      const timeMin = new Date(from).toISOString();
      const timeMax = new Date(to).toISOString();

      const fb = await g.calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          items: [{ id: g.calendarId }],
        },
      });

      const busy = fb.data.calendars?.[g.calendarId!]?.busy || []; // [{start,end}]
      if (busy.length) {
        for (const slug of Object.keys(result.slots)) {
          result.slots[slug] = (result.slots[slug] || []).filter((slot) => {
            const s = new Date(slot.start).getTime();
            const e = new Date(slot.end).getTime();
            return !busy.some((b) => {
              const bs = new Date(b.start!).getTime();
              const be = new Date(b.end!).getTime();
              return !(e <= bs || s >= be); // overlap?
            });
          });
        }
      }
    }

    // 3) Return final slots
    return res.status(200).json(result);
  } catch (e: any) {
    console.error('/api/bookings/availability error:', e?.message || e);
    return res.status(500).json({ error: e?.message || 'Internal Server Error' });
  }
}
