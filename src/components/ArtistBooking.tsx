// src/components/ArtistBooking.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Heading, Text, Select, SimpleGrid, Button, HStack,
  IconButton, Spinner, Divider, useToast, Badge
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

type Artist = { id: string; slug?: string; name: string; isActive?: boolean };
type Service = {
  id: string; title: string; slug: string; durationMin: number;
  priceGBP: number; depositGBP?: number | null;
  bufferBeforeMin?: number | null; bufferAfterMin?: number | null;
};
type Slot = { start: string; end: string };

const LONDON_TZ = 'Europe/London';
const GBP = (pence: number) => `£${(pence / 100).toFixed(2)}`;

async function safeJSON<T = any>(url: string): Promise<T | null> {
  try { const r = await fetch(url, { headers: { 'cache-control': 'no-cache' } }); if (!r.ok) return null; return r.json(); }
  catch { return null; }
}

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function iso(d: Date) { return d.toISOString(); }

export default function ArtistBooking({ artistSlug }: { artistSlug: string }) {
  const toast = useToast();
  const slotsRef = useRef<HTMLDivElement | null>(null);

  const [artist, setArtist] = useState<Artist | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // calendar window (move by month arrows)
  const [rangeStart, setRangeStart] = useState<Date>(startOfDay(new Date()));
  const rangeEnd = useMemo(() => addDays(rangeStart, 30), [rangeStart]); // 30-day window

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);

  // 1) Find artist by slug + fetch their services only
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const arts = await safeJSON<{ artists: Artist[] }>('/api/artists');
        const found = arts?.artists?.find(a => a.slug?.toLowerCase() === artistSlug.toLowerCase());
        if (!found) throw new Error('Artist not found');
        if (cancelled) return;
        setArtist(found);

        // only services linked to this artist
        const svcRes =
          await safeJSON<{ items: Service[] }>(`/api/services/for-artist?artistSlug=${encodeURIComponent(found.slug || '')}&active=1`)
          || await safeJSON<{ items: Service[] }>(`/api/services/for-artist?artistId=${encodeURIComponent(found.id)}&active=1`);

        const svcs = svcRes?.items || [];
        if (svcs.length === 0) {
          toast({ title: 'No services', description: 'This artist has no linked services yet.', status: 'info' });
        }
        if (cancelled) return;
        setServices(svcs);

        // auto-select first service -> auto-load availability
        if (svcs[0]?.id) setServiceId(svcs[0].id);
      } catch (e: any) {
        if (!cancelled) {
          toast({ title: 'Failed to load artist/services', description: e?.message || 'Please try again later', status: 'error' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [artistSlug, toast]);

  // 2) Auto load slots whenever artist/service/range changes
  useEffect(() => {
    if (!artist?.id || !serviceId) return;
    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      try {
        // determine service slug for filtering
        const svc = services.find(s => s.id === serviceId);
        if (!svc) return;
        const q = new URLSearchParams({
          artistId: artist.id,
          from: iso(rangeStart),
          to: iso(rangeEnd),
        });
        const r = await safeJSON<{ slots?: Record<string, Slot[]> }>(`/api/bookings/availability?${q.toString()}`);
        const list = r?.slots?.[svc.slug] || [];
        if (!cancelled) {
          setSlots(list);
          // scroll into view on first load after select
          if (slotsRef.current) slotsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (e: any) {
        if (!cancelled) {
          toast({ title: 'Failed to load availability', description: e?.message || 'Try again later', status: 'error' });
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();
    return () => { cancelled = true; };
  }, [artist?.id, serviceId, rangeStart, rangeEnd, services, toast]);

  // 3) Group slots by day for a calendar-like view
  const grouped = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const label = new Date(s.start).toLocaleDateString('en-GB', {
        timeZone: LONDON_TZ, weekday: 'short', day: '2-digit', month: 'short'
      });
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(s);
    }
    return Array.from(map.entries()); // [ [label, Slot[]], ... ]
  }, [slots]);

  async function checkout(slot: Slot) {
    try {
      const svc = services.find(s => s.id === serviceId);
      if (!svc) return;
      const email = prompt('Enter your email for confirmation'); if (!email) return;
      const name = prompt('Your name (optional)') || undefined;

      const r = await fetch('/api/bookings/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: artist?.id,
          serviceId,
          startISO: slot.start,
          customerEmail: email,
          customerName: name,
        }),
      }).then(r => r.json());

      if (r?.url) window.location.href = r.url;
      else toast({ title: 'Checkout error', description: r?.error || 'Something went wrong', status: 'error' });
    } catch (e: any) {
      toast({ title: 'Checkout error', description: e?.message || 'Something went wrong', status: 'error' });
    }
  }

  if (loading) {
    return (
      <Box p={6} className="glass-card">
        <HStack><Spinner /><Text>Loading…</Text></HStack>
      </Box>
    );
  }

  return (
    <Box className="glass-card" p={6}>
      <Heading size="lg" mb={1}>Book with {artist?.name}</Heading>
      <Text mb={4} opacity={0.85}>Choose a service to see live availability.</Text>

      <HStack spacing={3} mb={4}>
        <Select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          placeholder="Select a service"
          bg="black"
          color="white"
          borderColor="gray.600"
        >
          {services.map(s => (
            <option key={s.id} value={s.id}>
              {s.title} — {GBP(s.priceGBP)}
            </option>
          ))}
        </Select>

        {/* Month nav for the 30-day window */}
        <HStack>
          <IconButton aria-label="Previous month" icon={<ChevronLeftIcon />} onClick={() => setRangeStart(addDays(rangeStart, -30))} />
          <Badge colorScheme="pink">
            {rangeStart.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </Badge>
          <IconButton aria-label="Next month" icon={<ChevronRightIcon />} onClick={() => setRangeStart(addDays(rangeStart, 30))} />
        </HStack>
      </HStack>

      <Divider mb={4} />

      <Box ref={slotsRef}>
        {loadingSlots ? (
          <HStack><Spinner /><Text>Loading availability…</Text></HStack>
        ) : grouped.length === 0 ? (
          <Text>No available times in this range.</Text>
        ) : (
          <Box>
            {grouped.map(([label, daySlots]) => (
              <Box key={label} mb={4}>
                <Heading size="sm" mb={2}>{label}</Heading>
                <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} gap={2}>
                  {daySlots.map(s => (
                    <Button
                      key={s.start}
                      variant="outline"
                      onClick={() => checkout(s)}
                      title={`${new Date(s.start).toLocaleString('en-GB', { timeZone: LONDON_TZ })} – ${new Date(s.end).toLocaleString('en-GB', { timeZone: LONDON_TZ })}`}
                    >
                      {new Date(s.start).toLocaleTimeString('en-GB', { timeZone: LONDON_TZ, hour: '2-digit', minute: '2-digit' })}
                    </Button>
                  ))}
                </SimpleGrid>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
