// src/pages/mike.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Box, Text, Tabs, TabList, TabPanels, Tab, TabPanel, Grid, Link as ChakraLink,
  useMediaQuery, AspectRatio, HStack, VStack, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, Button, Checkbox, Select, Input, Textarea,
  SimpleGrid, useToast, Spinner, Badge, Divider, Tag, TagLabel, IconButton, Progress,
  ModalCloseButton
} from "@chakra-ui/react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import dynamic from "next/dynamic";
import Image from "next/image";
import Head from "next/head";
import Script from "next/script";
import styles from "./artists/MikePage.module.css";

// Dynamically load some components
const MotionBox = dynamic(() => import("../components/MotionBox"), { ssr: true });
const TextCard = dynamic(() => import("../components/TextCard"), { ssr: true });

/** ---------------------------
 *  Constants / Helpers
 * --------------------------- */
const ARTIST_CANDIDATE_SLUGS = ["eggtattooer", "mike", "egg"]; // preselect-only; no UI to change
const LONDON_TZ = "Europe/London";

type Slot = { start: string; end: string };
type DayInfo = { free: Slot[]; busy: Slot[] };

type Artist = { id: string; slug?: string; name?: string; displayName?: string; isActive?: boolean };
type ArtistService = {
  id: string;
  title: string;
  slug: string;
  priceGBP: number;
  basePriceGBP: number;
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

/** Upload with progress (XHR) to /api/upload; gracefully no-op if unavailable */
async function uploadImagesWithProgress(
  files: File[],
  onProgress: (pct: number) => void
): Promise<string[]> {
  if (!files.length) return [];
  return await new Promise<string[]>((resolve, reject) => {
    try {
      const fd = new FormData();
      files.slice(0, 3).forEach((f) => fd.append("files", f));
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          onProgress(pct);
        }
      };
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          try {
            const j = JSON.parse(xhr.responseText || "{}");
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(Array.isArray(j?.urls) ? j.urls : []);
            } else {
              reject(new Error(j?.error || "Upload failed"));
            }
          } catch {
            reject(new Error("Upload parse failed"));
          }
        }
      };
      xhr.open("POST", "/api/upload");
      xhr.send(fd);
    } catch (e) {
      // Fail open: continue without images
      resolve([]);
    }
  });
}

/** ---------------------------
 *  Booking Widget
 *  (preselected artist; you cannot change the artist)
 * --------------------------- */
const BookingWidget: React.FC = () => {
  const toast = useToast();

  // Artist (fixed) + services
  const [artist, setArtist] = useState<Artist | null>(null);
  const [servicesForArtist, setServicesForArtist] = useState<ArtistService[]>([]);
  const [serviceId, setServiceId] = useState("");

  // Month/day state
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const minMonth = useMemo(() => startOfMonth(new Date()), []);
  const maxMonth = useMemo(() => startOfMonth(addMonths(new Date(), 5)), []);
  const [monthLoading, setMonthLoading] = useState(false);
  const [days, setDays] = useState<Record<string, DayInfo>>({});
  const [selectedDay, setSelectedDay] = useState<string>(""); // YYYY-MM-DD

  // Modal/form state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedStartISO, setSelectedStartISO] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [placement, setPlacement] = useState("");
  const [brief, setBrief] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [quotePence, setQuotePence] = useState<number | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load the fixed artist by slug/name (no UI to change)
  useEffect(() => {
    (async () => {
      try {
        const a = await fetch("/api/admin/artists?active=1").then(r => r.json()).catch(() => null);
        const list: Artist[] = a?.items || a?.artists || [];
        const found =
          list.find(x => ARTIST_CANDIDATE_SLUGS.includes((x.slug || "").toLowerCase())) ||
          list.find(x => ARTIST_CANDIDATE_SLUGS.some(s => (x.name || x.displayName || "").toLowerCase().includes(s))) ||
          null;
        if (!found) throw new Error("Artist not found");
        setArtist(found);

        // Fetch services for this artist
        const qs = new URLSearchParams({ artistId: found.id, active: "1" });
        const j = await fetch(`/api/services/for-artist?${qs.toString()}`).then(r => r.json());
        const items: ArtistService[] = j.items || [];
        setServicesForArtist(items);
        if (items.length > 0) setServiceId(items[0].id);
      } catch (e: any) {
        toast({
          title: "Could not load artist/services",
          description: e?.message || "Endpoint unavailable",
          status: "error",
        });
      }
    })();
  }, [toast]);

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

  // Build calendar cells
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

  // Load month availability (explicit button, like original Book page)
  async function loadMonthAvailability() {
    if (!artist?.id || !serviceId) {
      toast({ title: "Pick a service first", status: "info" });
      return;
    }
    setMonthLoading(true);
    setSelectedDay("");
    setDays({});
    try {
      const from = startOfMonth(currentMonth);
      const to = endOfMonth(currentMonth);
      const qs = new URLSearchParams({
        artistId: artist.id,
        serviceId,
        from: from.toISOString(),
        to: to.toISOString(),
      });
      const resp = await fetch(`/api/bookings/availability?${qs.toString()}`);
      const text = await resp.text();
      if (!resp.ok) {
        let j: any = {};
        try { j = JSON.parse(text); } catch {}
        throw new Error(j?.detail || j?.error || resp.statusText);
      }
      const data = JSON.parse(text);
      setDays(data.days || {});
    } catch (e: any) {
      toast({ title: "Failed to load availability", description: e?.message, status: "error" });
      setDays({});
    } finally {
      setMonthLoading(false);
    }
  }

  async function openForm(startISO: string) {
    if (!artist?.id || !serviceId) return;
    setSelectedStartISO(startISO);
    setFormOpen(true);
    setQuotePence(null);
    setQuoting(true);
    try {
      const r = await fetch("/api/bookings/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId: artist.id, serviceId }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to quote");
      setQuotePence(j.pricePence);
    } catch (e: any) {
      toast({ title: "Could not load price", description: e?.message, status: "error" });
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

  async function payNow() {
    if (!artist?.id || !serviceId || !selectedStartISO) return;
    if (!email || !name) {
      toast({ title: "Please provide your name and email", status: "warning" });
      return;
    }
    let urls = imageUrls;
    if (images.length && imageUrls.length === 0) {
      try {
        setUploading(true);
        setUploadProgress(0);
        urls = await uploadImagesWithProgress(images, setUploadProgress);
        setImageUrls(urls);
      } catch (e: any) {
        toast({ title: "Image upload failed", description: e?.message, status: "error" });
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: artist.id,
          serviceId,
          startISO: selectedStartISO,
          customerEmail: email,
          customerName: name,
          placement,
          brief,
          imageUrls: urls,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Checkout failed");
      if (j.url) window.location.href = j.url;
    } catch (e: any) {
      toast({ title: "Checkout error", description: e?.message, status: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  const selectedDayBusy = selectedDay ? (days[selectedDay]?.busy || []) : [];

  if (!artist) {
    return (
      <Box p={6} border="1px solid rgba(255,0,127,0.3)" borderRadius="md">
        <HStack><Spinner /><Text>Loading booking tools…</Text></HStack>
      </Box>
    );
  }

  return (
    <Box
      p={4}
      border="1px solid rgba(255,0,127,0.35)"
      borderRadius="lg"
      boxShadow="0 0 20px rgba(255,0,127,0.35), 0 0 28px rgba(0,212,255,0.25)"
    >
      <Text as="h3" fontSize="2xl" mb={3} textShadow="0 0 6px #ff007f, 0 0 12px #00d4ff">
        Book with {artist.name || artist.displayName || "Eggtattooer"}
      </Text>

      {/* Service selection (artist locked) + user details */}
      <Grid gap={3} templateColumns={{ base: "1fr", md: "1fr 1fr" }}>
        <Box>
          <Text mb={1} fontWeight="semibold">Service</Text>
          <Select
            placeholder={servicesForArtist.length ? "Choose service" : "No services configured"}
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            isDisabled={servicesForArtist.length === 0}
            bg="black" color="white" borderColor="gray.600"
          >
            {servicesForArtist.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} — £{(s.priceGBP / 100).toFixed(2)}
              </option>
            ))}
          </Select>
        </Box>

        <Box>
          <Text mb={1} fontWeight="semibold">Email</Text>
          <Input type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            bg="white" color="black" />
        </Box>

        <Box>
          <Text mb={1} fontWeight="semibold">Your Name</Text>
          <Input placeholder="Your name" value={name}
            onChange={(e) => setName(e.target.value)}
            bg="white" color="black" />
        </Box>

        <Box>
          <Text mb={1} fontWeight="semibold">Placement (e.g. Left forearm)</Text>
          <Input placeholder="Where on the body?" value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            bg="white" color="black" />
        </Box>

        <Box gridColumn={{ base: "1", md: "1 / span 2" }}>
          <Text mb={1} fontWeight="semibold">Design Brief</Text>
          <Textarea placeholder="Describe the idea, size, references, colours, etc."
            value={brief} onChange={(e) => setBrief(e.target.value)}
            bg="white" color="black" rows={4} />
        </Box>

        <Box gridColumn={{ base: "1", md: "1 / span 2" }}>
          <Text mb={1} fontWeight="semibold">Reference Images (max 3)</Text>
          <Input type="file" accept="image/*" multiple onChange={handleChooseFile}
            bg="white" color="black" />
          {uploading && <Progress value={uploadProgress} size="sm" mt={2} aria-label="Upload progress" />}
          {imageUrls.length > 0 && (
            <HStack mt={3} spacing={3}>
              {imageUrls.map((u) => <Image key={u} src={u} alt="reference" width={80} height={80} style={{ borderRadius: 8, objectFit: "cover" }} />)}
            </HStack>
          )}
          {images.length > 0 && imageUrls.length === 0 && (
            <HStack mt={2} wrap="wrap" spacing={2}>
              {images.map((f, idx) => <Badge key={idx}>{f.name}</Badge>)}
            </HStack>
          )}
        </Box>
      </Grid>

      {/* Month navigation + fetch */}
      <HStack mt={4} justify="space-between">
        <HStack>
          <IconButton aria-label="Previous month" icon={<ChevronLeftIcon />} onClick={prevMonth} isDisabled={currentMonth <= minMonth} />
          <IconButton aria-label="Next month" icon={<ChevronRightIcon />} onClick={nextMonth} isDisabled={currentMonth >= maxMonth} />
          <Text fontWeight="bold">
            {currentMonth.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
          </Text>
        </HStack>
        <Button onClick={loadMonthAvailability} isDisabled={!serviceId || monthLoading}>
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
          {calendarDays.map((cell) => {
            const isSelected = selectedDay === cell.key;
            let colorScheme: any = 'gray';
            if (cell.freeCount > 0) colorScheme = 'green';
            else if (cell.busyCount > 0) colorScheme = 'red';
            const isPast = ymd(cell.date) < ymd(new Date());
            return (
              <Button
                key={cell.key}
                size="sm"
                variant={isSelected ? 'solid' : cell.freeCount ? 'outline' : cell.busyCount ? 'outline' : 'ghost'}
                colorScheme={colorScheme}
                onClick={() => { if (cell.freeCount || cell.busyCount) setSelectedDay(cell.key); }}
                isDisabled={cell.date.getMonth() !== currentMonth.getMonth() || isPast}
                height="40px"
                title={`${cell.freeCount} free / ${cell.busyCount} busy`}
              >
                {cell.date.getDate()}
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
        <Text as="h4" fontSize="lg" mb={2}>
          {selectedDay ? `Times on ${selectedDay}` : "Times"}
        </Text>
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
                        {new Date(b.start).toLocaleTimeString('en-GB', { timeZone: LONDON_TZ, hour: '2-digit', minute: '2-digit' })}
                        {" – "}
                        {new Date(b.end).toLocaleTimeString('en-GB', { timeZone: LONDON_TZ, hour: '2-digit', minute: '2-digit' })}
                      </TagLabel>
                    </Tag>
                  ))}
                </SimpleGrid>
              </>
            )}

            {/* Free appointment starts */}
            <Text mb={2} fontWeight="bold">Free</Text>
            {(days[selectedDay]?.free || []).length === 0 ? (
              <Text>No free slots for this day.</Text>
            ) : (
              <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap={3}>
                {(days[selectedDay]?.free || []).map(s => (
                  <Button key={s.start} onClick={() => openForm(s.start)} variant="outline" colorScheme="green">
                    {new Date(s.start).toLocaleString('en-GB', {
                      timeZone: LONDON_TZ,
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

      {/* Booking form modal (with quote + upload progress) */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Booking details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid gap={3}>
              <Box>
                <Text fontWeight="semibold" mb={1}>Name</Text>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </Box>
              <Box>
                <Text fontWeight="semibold" mb={1}>Email</Text>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </Box>
              <Box>
                <Text fontWeight="semibold" mb={1}>Where on your body?</Text>
                <Input value={placement} onChange={e => setPlacement(e.target.value)} placeholder="e.g. left forearm" />
              </Box>
              <Box>
                <Text fontWeight="semibold" mb={1}>Describe your tattoo idea</Text>
                <Textarea value={brief} onChange={e => setBrief(e.target.value)} placeholder="Tell us style, size, references, etc." rows={4} />
              </Box>
              <Box>
                <Text fontWeight="semibold" mb={1}>Reference images (up to 3)</Text>
                <Input type="file" accept="image/*" multiple onChange={handleChooseFile} />
                {uploading && <Progress value={uploadProgress} size="sm" mt={2} />}
                {imageUrls.length > 0 && (
                  <HStack mt={3} spacing={3}>
                    {imageUrls.map(u => <Image key={u} src={u} alt="reference" width={80} height={80} style={{ borderRadius: 8, objectFit: "cover" }} />)}
                  </HStack>
                )}
              </Box>
            </Grid>
            <Divider my={3} />
            <HStack justify="space-between">
              <Text>Appointment time:</Text>
              <Text fontWeight="bold">
                {selectedStartISO && new Date(selectedStartISO).toLocaleString('en-GB', {
                  timeZone: LONDON_TZ, weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </Text>
            </HStack>
            <HStack justify="space-between" mt={2}>
              <Text>Total price:</Text>
              <Text fontWeight="bold">
                {quoting ? "Loading..." : (quotePence != null ? `£${(quotePence / 100).toFixed(2)}` : "—")}
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
};

/** ---------------------------
 *  Page Content (visuals unchanged)
 * --------------------------- */

// Define galleries (keep your existing images)
const galleries = {
  realism: {
    description: `Realism tattooing is an art form that captures lifelike images with precise detail and shading.
      Mike specializes in bringing portraits, landscapes, and objects to life on skin, creating tattoos that
      are almost indistinguishable from photographs.`,
    images: ["realism1.webp","realism2.webp","realism3.webp","realism4.webp","realism5.webp","realism6.webp"],
  },
  bespokeRealism: {
    description: `Bespoke realism combines the precision of realism with personalized elements to create unique tattoos.
      Mike works closely with clients to incorporate individual stories and symbolism into hyper-realistic designs.`,
    images: ["bespoke1.webp","bespoke2.webp","bespoke3.webp","bespoke4.webp","bespoke5.webp","bespoke6.webp"],
  },
  neotrad: {
    description: `Neotraditional tattoos combine bold lines with rich color palettes, blending traditional tattoo aesthetics
      with modern artistic elements. Mike's neotrad work is known for its vibrant colors and detailed designs, breathing
      new life into classic motifs.`,
    images: ["neotrad1.webp","neotrad2.webp","neotrad3.webp","neotrad4.webp","neotrad5.webp","neotrad6.webp"],
  },
  coverUp: {
    description: `Cover-up tattoos are designed to transform and conceal existing tattoos with new designs.
      Mike specializes in creatively reimagining unwanted tattoos, turning them into stunning new pieces that clients can proudly display.`,
    images: ["coverup1.webp","coverup2.webp","coverup3.webp","coverup4.webp","coverup5.webp","coverup6.webp"],
  },
};

const MikePage: React.FC = () => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const acuityRef = useRef<HTMLDivElement>(null);

  // JSON-LD data
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Mike (Eggtattooer)",
      "jobTitle": "Tattoo Artist",
      "worksFor": { "@type": "Organization", "name": "Hull Tattoo Studio", "url": "https://www.hulltattoostudio.com" },
      "image": "https://www.hulltattoostudio.com/images/mike.webp",
      "url": "https://www.hulltattoostudio.com/mike",
      "description": "Mike is a friendly, down-to-earth tattoo artist at Hull Tattoo Studio with over 10 years of experience. He specializes in realism, bespoke realism, neotrad, and cover-up tattoos.",
      "sameAs": ["https://facebook.com/Hulltattoostudio", "https://instagram.com/egg_tattooer"]
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Hull Tattoo Studio",
      "description": "Hull Tattoo Studio offers professional tattoo services including tattoo coverups and tattoo apprenticeships in Hull. Visit us for custom tattoos and expert advice.",
      "image": "https://www.hulltattoostudio.com/images/og-image.webp",
      "url": "https://www.hulltattoostudio.com",
      "address": { "@type": "PostalAddress", "streetAddress": "255 Hedon", "addressLocality": "Hull", "postalCode": "HU9 1NQ", "addressCountry": "GB" },
      "telephone": "07940080790",
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:30", "closes": "17:00" },
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday","Sunday"], "opens": "11:30", "closes": "19:00" }
      ]
    },
    {
      "@context": "https://schema.org", "@type": "Service",
      "serviceType": "Tattoo Coverup",
      "provider": { "@type": "Organization", "name": "Hull Tattoo Studio", "url": "https://www.hulltattoostudio.com" },
      "description": "Expert tattoo coverup services that transform old or unwanted tattoos into stunning new designs at Hull Tattoo Studio."
    },
    {
      "@context": "https://schema.org", "@type": "Service",
      "serviceType": "Tattoo Apprenticeship",
      "provider": { "@type": "Organization", "name": "Hull Tattoo Studio", "url": "https://www.hulltattoostudio.com" },
      "description": "Comprehensive tattoo apprenticeship programs in Hull for aspiring tattoo artists, offered by Hull Tattoo Studio."
    }
  ];

  // Show disclaimer when booking block scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !disclaimerAccepted) setShowDisclaimerModal(true);
        });
      },
      { threshold: 0.5 }
    );
    if (acuityRef.current) observer.observe(acuityRef.current);
    return () => { if (acuityRef.current) observer.unobserve(acuityRef.current); };
  }, [disclaimerAccepted]);

  const PAGE_URL = "https://www.hulltattoostudio.com/mike";
  const OG_IMAGE = "https://www.hulltattoostudio.com/images/mike.webp";

  return (
    <>
      <Head>
        <title>Mike (Eggtattooer) | Tattoo Artist Hull | Realism, Bespoke, Neotrad & Cover-Ups</title>
        <meta name="description" content="Meet Mike (Eggtattooer), professional tattoo artist in Hull at Hull Tattoo Studio. Specialising in realism, bespoke realism, neotrad & expert cover-ups. Book online." />
        <meta name="keywords" content="tattoo artist hull, hull tattoo studio, mike eggtattooer, realism tattoos hull, bespoke realism hull, neotrad tattoos hull, cover up tattoo hull, tattoo apprenticeship hull, tattoo shops near me hull" />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content="Mike (Eggtattooer) | Tattoo Artist Hull" />
        <meta property="og:description" content="Realism, bespoke realism, neotrad & cover-ups at Hull Tattoo Studio." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:site_name" content="Hull Tattoo Studio" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mike (Eggtattooer) | Tattoo Artist Hull" />
        <meta name="twitter:description" content="Realism, bespoke realism, neotrad & cover-ups at Hull Tattoo Studio." />
        <meta name="twitter:image" content={OG_IMAGE} />
        <link rel="preconnect" href="https://app.acuityscheduling.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://embed.acuityscheduling.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/images/mike.webp" fetchPriority="high" />
        {/* ProfilePage JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              "name": "Mike (Eggtattooer) — Tattoo Artist in Hull",
              "about": { "@type": "Person", "name": "Mike (Eggtattooer)" },
              "url": PAGE_URL,
              "mainEntity": { "@type": "Person", "name": "Mike (Eggtattooer)", "url": PAGE_URL }
            })
          }}
        />
      </Head>

      <Script id="mike-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      {/* Global neon styles */}
      <style jsx global>{`
        :root {
          --neon-pink: #ff1e90;
          --neon-blue: #00e5ff;
          --neon-purple: #8a2be2;
          --panel: #0b0f17;
        }
        body { background:
          radial-gradient(1200px 800px at 10% -10%, rgba(255, 30, 144, 0.22), transparent 60%),
          radial-gradient(1000px 700px at 110% 20%, rgba(0, 229, 255, 0.20), transparent 60%),
          linear-gradient(180deg, #05050a 0%, #0b0f17 70%, #05050a 100%) !important; color: #e9f1ff; }
        :focus-visible { outline: 3px solid rgba(0, 229, 255, 0.6); outline-offset: 2px; }
      `}</style>

      <Box position="relative" bg="transparent" color="white" w="100%" p={8} px={{ base: 4, md: 8 }} minH="100vh">
        <Box className={styles.backgroundLines} />
        <Box
          bgGradient="radial(rgba(54, 39, 255, 0.6), rgba(128, 0, 128, 0.6), rgba(0,0,0,0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
          zIndex="1"
        >
          {/* Header */}
          <MotionBox initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} mb={16} as="section">
            <Text as="h1" fontSize={{ base: "3xl", md: "5xl" }} fontWeight="bold" textAlign="center"
              textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff" mb={4}>
              Mike (Eggtattooer)
            </Text>
            <Text as="h2" fontSize={{ base: "xl", md: "2xl" }} textAlign="center" mb={8} textShadow="0 0 5px #ff007f, 0 0 10px #00d4ff">
              Professional Tattoo Artist in Hull
            </Text>
            <Box mb={8} textAlign="center">
              <Image
                src="/images/mike.webp"
                alt="Portrait of Mike, a professional tattoo artist at Hull Tattoo Studio"
                width={200}
                height={200}
                priority
                style={{ borderRadius: "50%", boxShadow: "0 0 15px #ff007f, 0 0 25px #00d4ff", border: "4px solid #ff007f" }}
              />
            </Box>
            <TextCard
              title="About Mike"
              subtitle="Tattoo Artist with 10 Years of Experience"
              description={`Meet Mike, your down-to-earth, creative tattoo artist who’s been perfecting his craft for over a decade. Sponsored by Ink Drop Shop, Mike specializes in everything from jaw-dropping realism and bespoke designs to bold neotraditional pieces and seamless cover-ups. With a keen eye for detail and a talent for bringing your vision to life, he’s here to ensure you leave with a work of art that's as unique as you are.`}
              stripes={[ { left: "10%", width: "50px", color: "#ff007f" }, { left: "70%", width: "30px", color: "#00d4ff" } ]}
            />
          </MotionBox>

          {/* Galleries */}
          <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} mb={16} as="section">
            <Tabs variant="soft-rounded" colorScheme="pink">
              <TabList justifyContent="center" mb={8}>
                {Object.keys(galleries).map((key) => (
                  <Tab key={key} _selected={{ bg: "#ff007f", color: "white" }} fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>
                    {key === "bespokeRealism" ? "Bespoke Realism" : key === "coverUp" ? "Cover-up Tattoos" : key[0].toUpperCase() + key.slice(1)}
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {Object.entries(galleries).map(([key, { description, images }]) => (
                  <TabPanel key={key}>
                    <VStack spacing={4} mb={8}>
                      <Text fontSize={{ base: "lg", md: "xl" }} textAlign="center" fontWeight="medium" lineHeight="1.8" maxW="800px">
                        {description}
                      </Text>
                    </VStack>
                    <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={6}>
                      {images.map((img, index) => (
                        <AspectRatio ratio={1} key={index}>
                          <MotionBox
                            position="relative" borderRadius="md" overflow="hidden"
                            boxShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
                            whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={`/images/mike/${img}`}
                              alt={`${key.replace(/([A-Z])/g, " $1").trim()} tattoo ${index + 1} by Mike in Hull`}
                              layout="fill"
                              sizes="(max-width: 768px) 50vw, 33vw"
                              style={{ objectFit: "cover" }}
                              loading="lazy"
                            />
                          </MotionBox>
                        </AspectRatio>
                      ))}
                    </Grid>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </MotionBox>

          {/* Booking Block (Acuity replaced) */}
          <Box ref={acuityRef} mb={16} as="section">
            {disclaimerAccepted ? (
              <BookingWidget />
            ) : (
              <Box p={4} textAlign="center">
                <Text fontSize="lg" fontWeight="medium" mb={2}>
                  Please accept the disclaimer to access scheduling.
                </Text>
              </Box>
            )}
          </Box>

          {/* Social */}
          <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }} mb={16} as="section">
            <Text as="h2" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" textAlign="center" mb={8}
              textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff">
              Connect with Mike
            </Text>
            <HStack spacing={6} justify="center">
              <ChakraLink href="https://facebook.com/Hulltattoostudio" isExternal aria-label="Mike's Facebook Profile"
                _hover={{ transform: "scale(1.1)", color: "#ff007f" }} transition="all 0.3s ease">
                <FaFacebook size={40} color="#00d4ff" />
              </ChakraLink>
              <ChakraLink href="https://instagram.com/egg_tattooer" isExternal aria-label="Mike's Instagram Profile"
                _hover={{ transform: "scale(1.1)", color: "#ff007f" }} transition="all 0.3s ease">
                <FaInstagram size={40} color="#ff007f" />
              </ChakraLink>
            </HStack>
          </MotionBox>
        </Box>
      </Box>

      {/* Disclaimer Modal */}
      <Modal isOpen={showDisclaimerModal} onClose={() => {}} isCentered closeOnOverlayClick={false} motionPreset="slideInBottom">
        <ModalOverlay />
        <ModalContent bg="black" color="white" border="2px solid #ff007f"
          boxShadow="0 0 20px #ff007f, 0 0 30px #00d4ff">
          <ModalHeader textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff">Booking Disclaimer</ModalHeader>
          <ModalBody>
            <Text mb={4}>
              Please note: You must contact the artist prior to booking to ensure that you are booking the correct amount of time.
              If you book a time slot that is too short, you may be charged extra on the day.
            </Text>
            <Checkbox isChecked={checkboxChecked} onChange={(e) => setCheckboxChecked(e.target.checked)}>
              I have contacted the artist prior to booking.
            </Checkbox>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="pink"
              onClick={() => {
                if (checkboxChecked) {
                  setDisclaimerAccepted(true);
                  setShowDisclaimerModal(false);
                }
              }}
              disabled={!checkboxChecked}
            >
              Continue to Booking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// ISR for SEO/perf
export function getStaticProps() {
  return { props: {}, revalidate: 3600 };
}

export default MikePage;
