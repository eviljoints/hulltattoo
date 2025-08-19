// ./src/pages/jen.tsx

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  VStack,
  Link as ChakraLink,
  useMediaQuery,
  AspectRatio,
  HStack,
  // Added for booking widget:
  SimpleGrid,
  useToast,
  Spinner,
  Badge,
  Divider,
  Tag,
  TagLabel,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Checkbox,
  Select,
  Input,
  Textarea,
  Button,
  Progress,
} from "@chakra-ui/react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import MotionBox from "../components/MotionBox";
import Image from "next/image";
import Head from "next/head";
import styles from "./artists/MikePage.module.css"; // keep same background class for visual parity
import TextCard from "~/components/TextCard";

/** ----------------------------------------------------------------
 * Booking + Calendar (artist locked to Jen)
 * ---------------------------------------------------------------- */
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

const JEN_SLUGS = ["jen", "theplanetthief", "planetthief", "planet thief"];

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date)   { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999); }
function addMonths(d: Date, m: number) { return new Date(d.getFullYear(), d.getMonth() + m, 1); }
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const LONDON_TZ = "Europe/London";

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
        if (evt.lengthComputable) onProgress(Math.round((evt.loaded / evt.total) * 100));
      };
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          try {
            const j = JSON.parse(xhr.responseText || "{}");
            if (xhr.status >= 200 && xhr.status < 300) resolve(Array.isArray(j?.urls) ? j.urls : []);
            else reject(new Error(j?.error || "Upload failed"));
          } catch {
            reject(new Error("Upload parse failed"));
          }
        }
      };
      xhr.open("POST", "/api/upload");
      xhr.send(fd);
    } catch {
      resolve([]); // fail open
    }
  });
}

const BookingWidget: React.FC = () => {
  const toast = useToast();

  // Artist (locked to Jen) + services
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

  // Load Jen + services (no artist selector)
  useEffect(() => {
    (async () => {
      try {
        const a = await fetch("/api/admin/artists?active=1").then((r) => r.json()).catch(() => null);
        const list: Artist[] = a?.items || a?.artists || [];
        const found =
          list.find(x => JEN_SLUGS.includes((x.slug || "").toLowerCase())) ||
          list.find(x => JEN_SLUGS.some(s => (x.name || x.displayName || "").toLowerCase().includes(s))) ||
          null;
        if (!found) throw new Error("Artist not found");
        setArtist(found);

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

  // Build grid cells
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

  // Explicit month load (like your /book page)
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
        Book with {artist.name || artist.displayName || "Jen"}
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
              {imageUrls.map((u) => (
                <Image key={u} src={u} alt="reference" width={80} height={80} style={{ borderRadius: 8, objectFit: "cover" }} />
              ))}
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
            {currentMonth.toLocaleString("en-GB", { month: "long", year: "numeric" })}
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
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <Text key={d} textAlign="center" opacity={0.8} fontSize="sm">{d}</Text>
          ))}
        </SimpleGrid>
        <SimpleGrid columns={7} spacing={2}>
          {calendarDays.map((cell) => {
            const isSelected = selectedDay === cell.key;
            let colorScheme: any = "gray";
            if (cell.freeCount > 0) colorScheme = "green";
            else if (cell.busyCount > 0) colorScheme = "red";
            const isPast = ymd(cell.date) < ymd(new Date());
            return (
              <Button
                key={cell.key}
                size="sm"
                variant={isSelected ? "solid" : cell.freeCount ? "outline" : cell.busyCount ? "outline" : "ghost"}
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
            { (days[selectedDay]?.busy || []).length > 0 && (
              <>
                <Text mb={2} fontWeight="bold">Busy</Text>
                <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap={2} mb={4}>
                  { (days[selectedDay]?.busy || []).map((b, i) => (
                    <Tag key={i} size="lg" colorScheme="red" variant="subtle">
                      <TagLabel>
                        {new Date(b.start).toLocaleTimeString("en-GB", { timeZone: LONDON_TZ, hour: "2-digit", minute: "2-digit" })}
                        {" – "}
                        {new Date(b.end).toLocaleTimeString("en-GB", { timeZone: LONDON_TZ, hour: "2-digit", minute: "2-digit" })}
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
                {(days[selectedDay]?.free || []).map((s) => (
                  <Button
                    key={s.start}
                    onClick={() => openForm(s.start)}
                    variant="outline"
                    colorScheme="green"
                  >
                    {new Date(s.start).toLocaleString("en-GB", {
                      timeZone: LONDON_TZ,
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Button>
                ))}
              </SimpleGrid>
            )}
          </>
        )}
      </Box>

      {/* Booking form modal */}
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
                    {imageUrls.map(u => (
                      <Image key={u} src={u} alt="reference" width={80} height={80} style={{ borderRadius: 8, objectFit: "cover" }} />
                    ))}
                  </HStack>
                )}
              </Box>
            </Grid>
            <Divider my={3} />
            <HStack justify="space-between">
              <Text>Appointment time:</Text>
              <Text fontWeight="bold">
                {selectedStartISO && new Date(selectedStartISO).toLocaleString("en-GB", {
                  timeZone: LONDON_TZ, weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
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

/** ----------------------------------------------------------------
 * Jen gallery (keep your assets under /public/images/jen/)
 * ---------------------------------------------------------------- */
const gallery = {
  neoTraditionalColour: {
    description:
      "Jen is developing her craft in full-colour Neo Traditional — bold lines, rich palettes, and illustrative forms. She’s building a portfolio with vibrant pieces and is available for small to medium designs while she trains.",
    images: [
      "jen1.webp",
      "jen2.webp",
      "jen3.webp",
      "jen4.webp",
      "jen5.webp",
      "jen6.webp",
    ],
  },
};

// --- JSON-LD Person for Jen ---
const structuredData = {
  "@context": "http://schema.org",
  "@type": "Person",
  name: "Jen",
  jobTitle: "Apprentice Tattoo Artist (Full Colour Neo Traditional)",
  worksFor: {
    "@type": "Organization",
    name: "Hull Tattoo Studio",
    url: "https://www.hulltattoostudio.com",
  },
  image: "https://www.hulltattoostudio.com/images/jen.webp",
  url: "https://www.hulltattoostudio.com/jen",
  description:
    "Jen is an apprentice tattoo artist at Hull Tattoo Studio focusing on full-colour Neo Traditional work. She’s developing a vibrant portfolio and is available for select projects.",
};

const JenPage: React.FC = () => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  const motionProps = isLargerThan768
    ? {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 },
      };

  return (
    <>
      <Head>
        <title>Jen - Apprentice Neo Traditional (Full Colour) | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="Meet Jen, an apprentice at Hull Tattoo Studio focusing on full-colour Neo Traditional tattoos. Bold lines, rich palettes, and illustrative styles."
        />
        <meta
          name="keywords"
          content="Jen, Apprentice Tattoo Artist, Hull Tattoo Studio, Neo Traditional Tattoos, Full Colour Tattoos, Illustrative Tattoos, Hull"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Social / OG */}
        <meta property="og:title" content="Jen - Apprentice Neo Traditional (Full Colour) | Hull Tattoo Studio" />
        <meta
          property="og:description"
          content="Jen is developing her craft in full-colour Neo Traditional at Hull Tattoo Studio. Explore her growing portfolio."
        />
        <meta property="og:image" content="/images/jen/jen.webp" />
        <meta property="og:url" content="https://www.hulltattoostudio.com/jen" />
        <meta property="og:type" content="profile" />
        {/* Canonical + hreflang */}
        <link rel="canonical" href="https://www.hulltattoostudio.com/jen" />
        <link rel="alternate" hrefLang="en-gb" href="https://www.hulltattoostudio.com/jen" />
        <link rel="alternate" hrefLang="x-default" href="https://www.hulltattoostudio.com/jen" />
        {/* Perf: preload images (keep existing and add portrait used below) */}
        <link rel="preload" href="/images/jen.webp" as="image" />
        <link rel="preload" href="/images/jen/display.webp" as="image" />
        {/* Structured Data (Person) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {/* LocalBusiness JSON-LD with required hours */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Hull Tattoo Studio",
              "description": "Hull Tattoo Studio offers professional tattoo services including tattoo coverups and tattoo apprenticeships in Hull. Visit us for custom tattoos and expert advice.",
              "image": "https://www.hulltattoostudio.com/images/og-image.webp",
              "url": "https://www.hulltattoostudio.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "255 Hedon",
                "addressLocality": "Hull",
                "postalCode": "HU9 1NQ",
                "addressCountry": "GB"
              },
              "telephone": "07940080790",
              "openingHoursSpecification": [
                { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:30", "closes": "17:00" },
                { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday","Sunday"], "opens": "11:30", "closes": "19:00" }
              ]
            })
          }}
        />
      </Head>

      <Box
        position="relative"
        bg="transparent"
        color="white"
        w="100%"
        p={8}
        px={{ base: 4, md: 8 }}
        minH="100vh"
        as="main"
        overflowX="hidden"
        boxShadow="0 0 20px #ff007f, 0 0 30px #00d4ff"
      >
        {/* Optional neon diagonal lines like Harley page */}
        <Box className={styles.backgroundLines} />

        {/* Main Content Container (glassy neon) */}
        <Box
          className="glass-card"
          border="1px solid rgba(255,0,127,0.35)"
          boxShadow="0 0 0 1px rgba(0,212,255,0.25) inset, 0 0 22px rgba(255,0,127,0.35), 0 0 28px rgba(0,212,255,0.25)"
          borderRadius="xl"
          p={8}
          position="relative"
          zIndex="1"
        >
          {/* Header / Intro */}
          <MotionBox {...motionProps} mb={16} as="section">
            <Text
              as="h1"
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="bold"
              color="white"
              textAlign="center"
              textShadow="0 0 8px #ff007f, 0 0 12px #00d4ff"
              mb={4}
              className="neon-hero"
            >
              Jen
            </Text>
            <Text
              as="h2"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="medium"
              color="white"
              textAlign="center"
              textShadow="0 0 4px #ff007f, 0 0 8px #00d4ff"
              mb={8}
            >
              Apprentice · Full Colour Neo Traditional
            </Text>

            <Box mb={8} textAlign="center">
              <Image
                src="/images/jen/display.webp"
                alt="Portrait of Jen, a tattoo apprentice artist at Hull Tattoo Studio"
                width={200}
                height={200}
                priority={true}
                style={{
                  borderRadius: "50%",
                  boxShadow: "0 0 15px #ff007f, 0 0 25px #00d4ff",
                  border: "4px solid #ff007f",
                }}
              />
            </Box>

            <TextCard
              title="About Jen"
              subtitle="Full-colour Neo Traditional in development."
              description={`Jen is a developing artist at <strong>Hull Tattoo Studio</strong> who focuses on <strong>full-colour Neo Traditional</strong>. Her work blends bold structure with painterly colour — a style that rewards both clarity and character.<br/><br/>
              As an apprentice, Jen is actively expanding her portfolio with small to mid-sized pieces while training with our team. If you love expressive palettes and illustrative designs, Jen would love to collaborate on your next tattoo.`}
              stripes={[
                { left: "12%", width: "18px", color: "#ff007f" },
                { left: "68%", width: "24px", color: "#00d4ff" },
              ]}
            />
          </MotionBox>

          {/* Gallery */}
          <MotionBox {...motionProps} mb={16} as="section">
            <Tabs variant="soft-rounded" colorScheme="pink">
              <TabList justifyContent="center" mb={8}>
                <Tab _selected={{ bg: "#ff007f", color: "white" }} fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>
                  Neo Traditional · Colour
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} mb={8}>
                    <Text fontSize={{ base: "lg", md: "xl" }} textAlign="center" fontWeight="medium" lineHeight="1.8" maxW="800px">
                      {gallery.neoTraditionalColour.description}
                    </Text>
                  </VStack>
                  <Grid
                    templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
                    gap={6}
                  >
                    {gallery.neoTraditionalColour.images.map((img, index) => (
                      <AspectRatio ratio={1} key={index}>
                        <MotionBox
                          position="relative"
                          borderRadius="md"
                          overflow="hidden"
                          boxShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          _hover={{ boxShadow: "0 0 14px #ff007f, 0 0 18px #00d4ff" }}
                        >
                          <Image
                            src={`/images/jen/${img}`}
                            alt={`Jen Neo Traditional colour piece ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            loading="lazy"
                            sizes="(min-width: 768px) 33vw, 50vw"
                          />
                        </MotionBox>
                      </AspectRatio>
                    ))}
                  </Grid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </MotionBox>

          {/* Booking Block (Artist locked to Jen) */}
          <Box as="section" mb={16}>
            <BookingWidget />
          </Box>

          {/* Socials */}
          <MotionBox {...motionProps} mb={4} as="section">
            <Text
              as="h2"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="white"
              textAlign="center"
              mb={8}
              textShadow="0 0 8px #ff007f, 0 0 12px #00d4ff"
            >
              Connect with Jen
            </Text>
            <HStack spacing={6} justify="center">
              <ChakraLink
                href="https://www.facebook.com/profile.php?id=61575953590191"
                isExternal
                aria-label="Jen's Facebook"
                _hover={{ transform: "scale(1.1)", color: "#ff007f" }}
                transition="all 0.3s ease"
              >
                <FaFacebook size={40} color="#00d4ff" />
              </ChakraLink>
              <ChakraLink
                href="https://www.instagram.com/theplanetthieftattoo/"
                isExternal
                aria-label="Jen's Instagram"
                _hover={{ transform: "scale(1.1)", color: "#ff007f" }}
                transition="all 0.3s ease"
              >
                <FaInstagram size={40} color="#ff007f" />
              </ChakraLink>
            </HStack>
          </MotionBox>
        </Box>
      </Box>
    </>
  );
};

export default JenPage;
