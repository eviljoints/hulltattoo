import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import {
  Box, Select, Button, Heading, Text, SimpleGrid, HStack, IconButton, Spinner,
  useToast, Divider, Tag, TagLabel, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Textarea,
  Image, Progress
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

type Slot = { start: string; end: string };
type DayInfo = { free: Slot[]; busy: Slot[] };

type Artist = { id: string; name?: string; displayName?: string };
type ArtistService = {
  id: string;                 // service id
  title: string;
  slug: string;
  priceGBP: number;           // effective price (override if present)
  basePriceGBP: number;       // base price
  overridePriceGBP: number | null;
  durationMin: number;
  depositGBP?: number | null;
  bufferBeforeMin?: number | null;
  bufferAfterMin?: number | null;
};

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date)   { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999); }
function addMonths(d: Date, m: number) { return new Date(d.getFullYear(), d.getMonth() + m, 1); }
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Book() {
  const toast = useToast();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistId, setArtistId] = useState('');
  const [servicesForArtist, setServicesForArtist] = useState<ArtistService[]>([]);
  const [serviceId, setServiceId] = useState('');

  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [monthLoading, setMonthLoading] = useState(false);
  const [days, setDays] = useState<Record<string, DayInfo>>({});
  const [selectedDay, setSelectedDay] = useState<string>(''); // YYYY-MM-DD

  // Modal/form state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedStartISO, setSelectedStartISO] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [placement, setPlacement] = useState('');
  const [brief, setBrief] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [quotePence, setQuotePence] = useState<number | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const minMonth = useMemo(() => startOfMonth(new Date()), []);
  const maxMonth = useMemo(() => startOfMonth(addMonths(new Date(), 5)), []);

  // Load artists (public, active list)
  useEffect(() => {
    (async () => {
      try {
        const a = await fetch('/api/admin/artists?active=1')
          .then(r => r.json())
          .catch(() => ({ items: [] }));
        setArtists(a.items || []);
      } catch {
        setArtists([]);
      }
    })();
  }, []);

  // When artist changes, fetch ONLY that artist's services
  useEffect(() => {
    setServicesForArtist([]);
    setServiceId('');
    setSelectedDay('');
    setDays({});
    if (!artistId) return;

    (async () => {
      try {
        const qs = new URLSearchParams({ artistId, active: '1' });
        const j = await fetch(`/api/services/for-artist?${qs.toString()}`).then(r => r.json());
        const items: ArtistService[] = j.items || [];
        setServicesForArtist(items);
        if (items.length > 0) setServiceId(items[0].id);
      } catch (e: any) {
        setServicesForArtist([]);
        toast({
          title: 'Could not load services for artist',
          description: e?.message || 'Endpoint unavailable',
          status: 'warning',
        });
      }
    })();
  }, [artistId, toast]);

  function nextMonth() {
    const next = addMonths(currentMonth, 1);
    if (next > maxMonth) return;
    setCurrentMonth(next);
  }
  function prevMonth() {
    const prev = addMonths(currentMonth, -1);
    if (prev < minMonth) return;
    setCurrentMonth(prev);
  }

  const calendarDays = useMemo(() => {
    const first = startOfMonth(currentMonth);
    const startOffset = first.getDay(); // 0=Sun..6=Sat
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - startOffset);

    const cells: { key: string; date: Date; inMonth: boolean; freeCount: number; busyCount: number }[] = [];
    for (let i = 0; i < 42; i++) {
      const dt = new Date(gridStart);
      dt.setDate(gridStart.getDate() + i);
      const key = ymd(dt);
      const info = days[key];
      cells.push({
        key,
        date: dt,
        inMonth: dt.getMonth() === currentMonth.getMonth(),
        freeCount: info?.free?.length || 0,
        busyCount: info?.busy?.length || 0,
      });
    }
    return cells;
  }, [currentMonth, days]);

  async function loadMonthAvailability() {
    if (!artistId || !serviceId) {
      toast({ title: 'Pick an artist and a service first', status: 'info' });
      return;
    }
    setMonthLoading(true);
    setSelectedDay('');
    setDays({});
    try {
      const from = startOfMonth(currentMonth);
      const to = endOfMonth(currentMonth);
      const qs = new URLSearchParams({
        artistId, serviceId,
        from: from.toISOString(), to: to.toISOString()
      });
      const resp = await fetch(`/api/bookings/availability?${qs.toString()}`);
      const text = await resp.text();
      if (!resp.ok) { let j:any={}; try{j=JSON.parse(text)}catch{}; throw new Error(j?.detail || j?.error || resp.statusText); }
      const data = JSON.parse(text);
      setDays(data.days || {});
    } catch (e: any) {
      toast({ title: 'Failed to load availability', description: e?.message, status: 'error' });
      setDays({});
    } finally {
      setMonthLoading(false);
    }
  }

  async function openForm(startISO: string) {
    if (!artistId || !serviceId) return;
    setSelectedStartISO(startISO);
    setFormOpen(true);
    setQuotePence(null);
    setQuoting(true);
    try {
      const r = await fetch('/api/bookings/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId, serviceId })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Failed to quote');
      setQuotePence(j.pricePence);
    } catch (e: any) {
      toast({ title: 'Could not load price', description: e?.message, status: 'error' });
      setFormOpen(false);
    } finally {
      setQuoting(false);
    }
  }

  function handleChooseFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setImages(files);
    setImageUrls([]);
  }

  async function uploadImages() {
    if (!images.length) return [];
    setUploading(true);
    setUploadProgress(0);
    try {
      const fd = new FormData();
      images.forEach(f => fd.append('files', f));
      const xhr = new XMLHttpRequest();
      const p = new Promise<{ ok: boolean; urls?: string[]; error?: string }>((resolve, reject) => {
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        };
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            try {
              const j = JSON.parse(xhr.responseText || '{}');
              if (xhr.status >= 200 && xhr.status < 300) resolve(j);
              else reject(new Error(j?.error || 'Upload failed'));
            } catch {
              reject(new Error('Upload parse failed'));
            }
          }
        };
        xhr.open('POST', '/api/upload');
        xhr.send(fd);
      });
      const r = await p;
      const urls = r.urls || [];
      setImageUrls(urls);
      return urls;
    } finally {
      setUploading(false);
    }
  }

  async function payNow() {
    if (!artistId || !serviceId || !selectedStartISO) return;
    if (!email || !name) {
      toast({ title: 'Please provide your name and email', status: 'warning' });
      return;
    }
    let urls = imageUrls;
    if (images.length && imageUrls.length === 0) {
      try {
        urls = await uploadImages();
      } catch (e: any) {
        toast({ title: 'Image upload failed', description: e?.message, status: 'error' });
        return;
      }
    }
    setSubmitting(true);
    try {
      const r = await fetch('/api/bookings/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId, serviceId, startISO: selectedStartISO,
          customerEmail: email, customerName: name,
          placement, brief, imageUrls: urls
        })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Checkout failed');
      if (j.url) window.location.href = j.url;
    } catch (e: any) {
      toast({ title: 'Checkout error', description: e?.message, status: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  // Reset day selection when these change
  useEffect(() => { setSelectedDay(''); setDays({}); }, [artistId, serviceId, currentMonth]);

  const selectedDayBusy = selectedDay ? (days[selectedDay]?.busy || []) : [];

  return (
    <Box className="glass-card" p={6} maxW="1100px" mx="auto" my={8}>
      <Head>
        <title>Book an Appointment – Hull Tattoo Studio</title>
        <meta name="description" content="Check availability and book with our artists." />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/book`} />
      </Head>

      <Heading mb={4}>Book an Appointment</Heading>

      {/* Pick artist & service (service list comes from the *selected artist* only) */}
      <Box display="grid" gap={4} gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}>
        <Box>
          <Text mb={2}>Artist</Text>
          <Select
            placeholder="Choose artist"
            value={artistId}
            onChange={e => setArtistId(e.target.value)}
          >
            {artists.map(a => (
              <option key={a.id} value={a.id}>
                {a.name ?? a.displayName}
              </option>
            ))}
          </Select>
        </Box>
        <Box>
          <Text mb={2}>Service</Text>
          <Select
            placeholder={artistId ? 'Choose service' : 'Pick an artist first'}
            value={serviceId}
            onChange={e => setServiceId(e.target.value)}
            isDisabled={!artistId || servicesForArtist.length === 0}
          >
            {servicesForArtist.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} — £{(s.priceGBP / 100).toFixed(2)}
              </option>
            ))}
          </Select>
          {artistId && servicesForArtist.length === 0 && (
            <Text mt={2} fontSize="sm" opacity={0.8}>
              No services are configured for this artist yet.
            </Text>
          )}
        </Box>
      </Box>

      {/* Month navigation + fetch */}
      <HStack mt={4} justify="space-between">
        <HStack>
          <IconButton aria-label="Previous month" icon={<ChevronLeftIcon />} onClick={prevMonth} isDisabled={currentMonth <= minMonth} />
          <IconButton aria-label="Next month" icon={<ChevronRightIcon />} onClick={nextMonth} isDisabled={currentMonth >= maxMonth} />
          <Text fontWeight="bold">
            {currentMonth.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
          </Text>
        </HStack>
        <Button onClick={loadMonthAvailability} isDisabled={!artistId || !serviceId || monthLoading}>
          {monthLoading ? <Spinner size="sm" mr={2} /> : null}
          Show availability
        </Button>
      </HStack>

      {/* Calendar grid */}
      <Box mt={4} border="1px solid rgba(255,255,255,0.12)" borderRadius="md" p={3}>
        <SimpleGrid columns={7} spacing={2} mb={2}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <Text key={d} textAlign="center" opacity={0.8} fontSize="sm">{d}</Text>
          ))}
        </SimpleGrid>
        <SimpleGrid columns={7} spacing={2}>
          {Array.from({ length: 42 }).map((_, i) => {
            const first = startOfMonth(currentMonth);
            const startOffset = first.getDay();
            const gridStart = new Date(first);
            gridStart.setDate(first.getDate() - startOffset);
            const dt = new Date(gridStart);
            dt.setDate(gridStart.getDate() + i);
            const key = ymd(dt);
            const info = days[key];
            const freeCount = info?.free?.length || 0;
            const busyCount = info?.busy?.length || 0;
            const isSelected = selectedDay === key;
            let colorScheme: any = 'gray';
            if (freeCount > 0) colorScheme = 'green';
            else if (busyCount > 0) colorScheme = 'red';
            const isPast = ymd(dt) < ymd(new Date());
            return (
              <Button
                key={key}
                size="sm"
                variant={isSelected ? 'solid' : freeCount ? 'outline' : busyCount ? 'outline' : 'ghost'}
                colorScheme={colorScheme}
                onClick={() => { if (freeCount || busyCount) setSelectedDay(key); }}
                isDisabled={dt.getMonth() !== currentMonth.getMonth() || isPast}
                height="40px"
                title={`${freeCount} free / ${busyCount} busy`}
              >
                {dt.getDate()}
              </Button>
            );
          })}
        </SimpleGrid>
        {!monthLoading && Object.keys(days).length === 0 && (
          <Text mt={3} opacity={0.8}>No availability loaded for this month yet. Click “Show availability”.</Text>
        )}
      </Box>

      {/* Selected day details */}
      <Box mt={6}>
        <Heading size="md" mb={2}>
          {selectedDay ? `Times on ${selectedDay}` : 'Times'}
        </Heading>
        <Divider mb={3} />

        {selectedDay && (
          <>
            {/* Busy blocks */}
            {selectedDayBusy.length > 0 && (
              <>
                <Text mb={2} fontWeight="bold">Busy</Text>
                <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap={2} mb={4}>
                  {selectedDayBusy.map((b, i) => (
                    <Tag key={i} size="lg" colorScheme="red" variant="subtle">
                      <TagLabel>
                        {new Date(b.start).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' })}
                        {' – '}
                        {new Date(b.end).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' })}
                      </TagLabel>
                    </Tag>
                  ))}
                </SimpleGrid>
              </>
            )}

            {/* Free appointment starts */}
            <Text mb={2} fontWeight="bold">Free</Text>
            { (days[selectedDay]?.free || []).length === 0 ? (
              <Text>No free slots for this day.</Text>
            ) : (
              <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap={3}>
                {(days[selectedDay]?.free || []).map(s => (
                  <Button key={s.start} onClick={() => openForm(s.start)} variant="outline" colorScheme="green">
                    {new Date(s.start).toLocaleString('en-GB', {
                      timeZone: 'Europe/London',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Button>
                ))}
              </SimpleGrid>
            )}
          </>
        )}
      </Box>

      {/* Booking form modal */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Booking details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired mb={3}>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Where on your body?</FormLabel>
              <Input value={placement} onChange={e => setPlacement(e.target.value)} placeholder="e.g. left forearm" />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Describe your tattoo idea</FormLabel>
              <Textarea value={brief} onChange={e => setBrief(e.target.value)} placeholder="Tell us style, size, references, etc." rows={4} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Reference images (up to 3)</FormLabel>
              <Input type="file" accept="image/*" multiple onChange={e => {
                const files = Array.from(e.target.files || []).slice(0, 3);
                setImages(files);
                setImageUrls([]);
              }} />
              {uploading && <Progress value={uploadProgress} size="sm" mt={2} />}
              {imageUrls.length > 0 && (
                <HStack mt={3} spacing={3}>
                  {imageUrls.map(u => <Image key={u} src={u} alt="reference" boxSize="80px" objectFit="cover" borderRadius="md" />)}
                </HStack>
              )}
            </FormControl>
            <Divider my={3} />
            <HStack justify="space-between">
              <Text>Appointment time:</Text>
              <Text fontWeight="bold">
                {selectedStartISO && new Date(selectedStartISO).toLocaleString('en-GB', { timeZone: 'Europe/London', weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </HStack>
            <HStack justify="space-between" mt={2}>
              <Text>Total price:</Text>
              <Text fontWeight="bold">
                {quoting ? 'Loading...' : (quotePence != null ? `£${(quotePence/100).toFixed(2)}` : '—')}
              </Text>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={payNow}
              isLoading={submitting}
              isDisabled={!name || !email || quoting || quotePence == null}
            >
              Pay & book
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
