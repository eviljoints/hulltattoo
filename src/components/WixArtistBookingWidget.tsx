// src/components/WixArtistBookingWidget.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Divider,
  HStack,
  IconButton,
  Image as ChakraImage,
  Select,
  SimpleGrid,
  Spinner,
  Text,
  useToast,
  Button,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { getWixClient } from "../lib/wixClient";

const LONDON_TZ = "Europe/London";

type WixServiceRaw = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  staffMemberIds?: string[];
  media?: { mainMedia?: { image?: { url?: string } } };
  mainMedia?: { image?: string | { url?: string } };
};

type WixService = {
  id: string;
  name: string;
  description?: string;
  staffMemberIds: string[];
  imageUrl?: string;
};

export type WixAvailabilityEntry = {
  slot?: { startDate?: string; endDate?: string };
  [k: string]: any;
};

type DayEntries = Record<string, WixAvailabilityEntry[]>;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function addMonths(d: Date, m: number) {
  return new Date(d.getFullYear(), d.getMonth() + m, 1);
}
function isUuidLike(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function ymdInTz(dateOrIso: Date | string, tz = LONDON_TZ) {
  const d = typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = parts.find((p) => p.type === "year")?.value || "0000";
  const m = parts.find((p) => p.type === "month")?.value || "00";
  const day = parts.find((p) => p.type === "day")?.value || "00";
  return `${y}-${m}-${day}`;
}
function todayYmdLondon() {
  return ymdInTz(new Date(), LONDON_TZ);
}

function toTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", {
    timeZone: LONDON_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractImageUrl(s: any): string | undefined {
  const url1 = s?.media?.mainMedia?.image?.url;
  if (typeof url1 === "string" && url1) return url1;

  const mm = s?.mainMedia?.image;
  if (typeof mm === "string" && mm) return mm;

  const url2 = mm?.url;
  if (typeof url2 === "string" && url2) return url2;

  return undefined;
}

function normalizeService(s: WixServiceRaw): WixService | null {
  const id = String(s.id || s._id || "").trim();
  const name = String(s.name || s.title || "Untitled service").trim();
  if (!isUuidLike(id)) return null;

  return {
    id,
    name,
    description: s.description,
    staffMemberIds: Array.isArray(s.staffMemberIds) ? s.staffMemberIds : [],
    imageUrl: extractImageUrl(s),
  };
}

export type WixArtistBookingWidgetProps = {
  artistName: string;
  staffResourceId?: string;

  title?: string;
  maxMonthsAhead?: number;
  debug?: boolean;

  // ✅ new: hardcoded per-artist display price
  hourlyRateGbp?: number;

  onSelectEntry?: (payload: {
    serviceId: string;
    staffResourceId?: string;
    artistName: string;
    entry: WixAvailabilityEntry;
  }) => void;
};

export const WixArtistBookingWidget: React.FC<WixArtistBookingWidgetProps> = ({
  artistName,
  staffResourceId,
  title,
  maxMonthsAhead = 2,
  debug = true,
  hourlyRateGbp,
  onSelectEntry,
}) => {
  const toast = useToast();

  const [allServices, setAllServices] = useState<WixService[]>([]);
  const [serviceId, setServiceId] = useState<string>("");
  const [loadingServices, setLoadingServices] = useState(true);

  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const minMonth = useMemo(() => startOfMonth(new Date()), []);
  const maxDate = useMemo(() => addMonths(new Date(), maxMonthsAhead), [maxMonthsAhead]);
  const maxMonth = useMemo(() => startOfMonth(maxDate), [maxDate]);

  const [loadingAvail, setLoadingAvail] = useState(false);
  const [days, setDays] = useState<DayEntries>({});
  const [selectedDay, setSelectedDay] = useState<string>("");

  const reqSeq = useRef(0);

  const rateText = useMemo(() => {
    if (typeof hourlyRateGbp !== "number" || Number.isNaN(hourlyRateGbp)) return undefined;
    return `£${hourlyRateGbp.toFixed(0)} / hour`;
  }, [hourlyRateGbp]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingServices(true);
        const wix = getWixClient();
        const res = await wix.services.queryServices().find();
        const raw = (res?.items || []) as WixServiceRaw[];

        const normalized = raw
          .map(normalizeService)
          .filter((x): x is WixService => Boolean(x))
          .sort((a, b) => a.name.localeCompare(b.name));

        setAllServices(normalized);
      } catch (e: any) {
        toast({
          title: "Could not load services",
          description: e?.message || "Wix services query failed",
          status: "error",
        });
      } finally {
        setLoadingServices(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const servicesForArtist = useMemo(() => {
    if (!staffResourceId) return allServices;
    return allServices.filter((s) => (s.staffMemberIds || []).includes(staffResourceId));
  }, [allServices, staffResourceId]);

  useEffect(() => {
    if (loadingServices) return;
    if (serviceId && !servicesForArtist.some((s) => s.id === serviceId)) {
      setServiceId("");
      setDays({});
      setSelectedDay("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingServices, staffResourceId, servicesForArtist.length]);

  function prevMonth() {
    const prev = addMonths(currentMonth, -1);
    if (prev < minMonth) return;
    setCurrentMonth(prev);
  }
  function nextMonth() {
    const next = addMonths(currentMonth, 1);
    if (next > maxMonth) return;
    setCurrentMonth(next);
  }

  const calendarDays = useMemo(() => {
    const first = startOfMonth(currentMonth);
    const startOffset = first.getDay();
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - startOffset);

    const cells: { key: string; date: Date; inMonth: boolean; freeCount: number }[] = [];
    for (let i = 0; i < 42; i++) {
      const dt = new Date(gridStart);
      dt.setDate(gridStart.getDate() + i);

      const key = ymdInTz(dt, LONDON_TZ);
      const freeCount = days[key]?.length || 0;

      cells.push({
        key,
        date: dt,
        inMonth: dt.getMonth() === currentMonth.getMonth(),
        freeCount,
      });
    }
    return cells;
  }, [currentMonth, days]);

  async function loadMonthAvailability() {
    if (!serviceId) {
      setDays({});
      setSelectedDay("");
      return;
    }
    if (!isUuidLike(serviceId)) {
      toast({
        title: "Invalid service selection",
        description: "Service ID is not a valid Wix UUID. Please reselect the service.",
        status: "error",
      });
      return;
    }

    const mySeq = ++reqSeq.current;
    setLoadingAvail(true);
    setDays({});
    setSelectedDay("");

    try {
      const wix = getWixClient();

      const from = startOfMonth(currentMonth).toISOString();
      const to = endOfMonth(currentMonth).toISOString();

      const filter: any = {
        serviceId: [serviceId],
        startDate: from,
        endDate: to,
      };
      if (staffResourceId) filter.resourceId = [staffResourceId];

      if (debug) {
        console.groupCollapsed("[WixAvailability] queryAvailability");
        console.log("artistName:", artistName);
        console.log("staffResourceId:", staffResourceId);
        console.log("serviceId:", serviceId);
        console.log("range:", { from, to });
        console.log("filter:", filter);
        console.log("timezone option:", LONDON_TZ);
      }

      const availability = await wix.availabilityCalendar.queryAvailability(
        { filter },
        { timezone: LONDON_TZ } as any
      );

      const raw: any = availability as any;

      const entries: WixAvailabilityEntry[] = Array.isArray(raw?.availabilityEntries)
        ? raw.availabilityEntries
        : [];

      const nextDays: DayEntries = {};
      const todayLondon = todayYmdLondon();
      const maxLondon = ymdInTz(maxDate, LONDON_TZ);

      for (const entry of entries) {
        const startIso = entry?.slot?.startDate;
        const endIso = entry?.slot?.endDate;
        if (!startIso || !endIso) continue;

        const dayKey = ymdInTz(startIso, LONDON_TZ);
        if (dayKey < todayLondon) continue;
        if (dayKey > maxLondon) continue;

        if (!nextDays[dayKey]) nextDays[dayKey] = [];
        nextDays[dayKey].push(entry);
      }

      for (const k of Object.keys(nextDays)) {
        nextDays[k].sort((a, b) =>
          String(a?.slot?.startDate || "").localeCompare(String(b?.slot?.startDate || ""))
        );
      }

      if (debug) console.groupEnd();
      if (mySeq !== reqSeq.current) return;

      setDays(nextDays);
      const dayKeys = Object.keys(nextDays).sort();
      setSelectedDay(dayKeys[0] || "");
    } catch (e: any) {
      if (debug) console.error("[WixAvailability] error:", e);
      if (mySeq !== reqSeq.current) return;

      toast({
        title: "Failed to load availability",
        description: e?.message || "Availability query failed",
        status: "error",
      });

      setDays({});
      setSelectedDay("");
    } finally {
      if (mySeq === reqSeq.current) setLoadingAvail(false);
    }
  }

  useEffect(() => {
    if (loadingServices) return;
    loadMonthAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingServices, staffResourceId, serviceId, currentMonth]);

  const selectedEntries = selectedDay ? days[selectedDay] || [] : [];
  const selectedService = servicesForArtist.find((s) => s.id === serviceId);

  return (
    <Box
      p={4}
      border="1px solid rgba(255,0,127,0.35)"
      borderRadius="lg"
      boxShadow="0 0 20px rgba(255,0,127,0.35), 0 0 28px rgba(0,212,255,0.25)"
    >
      <HStack justify="space-between" align="center" mb={3} flexWrap="wrap">
        <Text as="h3" fontSize="2xl" textShadow="0 0 6px #ff007f, 0 0 12px #00d4ff">
          {title || `Book with ${artistName}`}
        </Text>

        {/* ✅ Only show the hardcoded hourly rate, no Wix explanations */}
        {rateText ? <Badge colorScheme="pink">{rateText}</Badge> : null}
      </HStack>

      {/* Service */}
      <Box mb={4}>
        <Text mb={1} fontWeight="semibold">
          Service
        </Text>

        {loadingServices ? (
          <HStack>
            <Spinner size="sm" />
            <Text>Loading services…</Text>
          </HStack>
        ) : servicesForArtist.length === 0 ? (
          <Box p={3} border="1px solid rgba(255,255,255,0.12)" borderRadius="md">
            <Text opacity={0.9}>No services assigned to this artist in Wix yet.</Text>
          </Box>
        ) : (
          <>
            <Select
              placeholder="Choose a service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              bg="black"
              color="white"
              borderColor="gray.600"
            >
              {servicesForArtist.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>

            {selectedService ? (
              <HStack mt={3} spacing={3} align="center">
                {selectedService.imageUrl ? (
                  <ChakraImage
                    src={selectedService.imageUrl}
                    alt={selectedService.name}
                    boxSize="44px"
                    objectFit="cover"
                    borderRadius="md"
                    border="1px solid rgba(255,255,255,0.12)"
                  />
                ) : null}

                <Box>
                  <Text fontWeight="semibold">{selectedService.name}</Text>
                  {/* ✅ No Wix price badge here anymore */}
                </Box>
              </HStack>
            ) : null}
          </>
        )}
      </Box>

      {/* Month nav */}
      <HStack justify="space-between" mb={4}>
        <HStack>
          <IconButton
            aria-label="Previous month"
            icon={<ChevronLeftIcon />}
            onClick={prevMonth}
            isDisabled={currentMonth <= minMonth}
          />
          <IconButton
            aria-label="Next month"
            icon={<ChevronRightIcon />}
            onClick={nextMonth}
            isDisabled={currentMonth >= maxMonth}
          />
          <Text fontWeight="bold">
            {currentMonth.toLocaleString("en-GB", { month: "long", year: "numeric" })}
          </Text>
        </HStack>

        <Button onClick={loadMonthAvailability} isDisabled={!serviceId || loadingAvail} variant="outline">
          {loadingAvail ? <Spinner size="sm" mr={2} /> : null}
          Refresh
        </Button>
      </HStack>

      {/* Calendar */}
      <Box border="1px solid rgba(255,255,255,0.12)" borderRadius="md" p={3}>
        <SimpleGrid columns={7} spacing={2} mb={2}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <Text key={d} textAlign="center" opacity={0.8} fontSize="sm">
              {d}
            </Text>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={7} spacing={2}>
          {calendarDays.map((cell) => {
            const isSelected = selectedDay === cell.key;
            const isPast = cell.key < todayYmdLondon();
            const isBeyondMax = cell.key > ymdInTz(maxDate, LONDON_TZ);
            const hasSlots = cell.freeCount > 0;

            const scheme = hasSlots ? "green" : "gray";
            const disabled = !cell.inMonth || isPast || isBeyondMax || !hasSlots || !serviceId;

            return (
              <Button
                key={cell.key}
                size="sm"
                variant={isSelected ? "solid" : hasSlots ? "outline" : "ghost"}
                colorScheme={scheme}
                onClick={() => !disabled && setSelectedDay(cell.key)}
                isDisabled={disabled}
                height="40px"
                title={
                  !serviceId
                    ? "Choose a service first"
                    : isBeyondMax
                    ? `Bookings open up to ${ymdInTz(maxDate, LONDON_TZ)}`
                    : hasSlots
                    ? `${cell.freeCount} available`
                    : "No availability"
                }
              >
                {cell.date.getDate()}
              </Button>
            );
          })}
        </SimpleGrid>

        {loadingAvail ? (
          <HStack mt={3}>
            <Spinner size="sm" />
            <Text opacity={0.85}>Loading availability…</Text>
          </HStack>
        ) : null}

        {!serviceId ? (
          <Text mt={3} opacity={0.8}>
            Choose a service to see available dates.
          </Text>
        ) : !loadingAvail && Object.keys(days).length === 0 ? (
          <Text mt={3} opacity={0.8}>
            No availability found for this month.
          </Text>
        ) : null}
      </Box>

      {/* Times */}
      <Box mt={6}>
        <Text as="h4" fontSize="lg" mb={2}>
          {selectedDay ? `Times on ${selectedDay}` : "Times"}
        </Text>
        <Divider mb={3} />

        {!serviceId ? (
          <Text opacity={0.85}>Choose a service first.</Text>
        ) : !selectedDay ? (
          <Text opacity={0.85}>Select an available date (green).</Text>
        ) : selectedEntries.length === 0 ? (
          <Text>No available slots for this day.</Text>
        ) : (
          <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap={3}>
            {selectedEntries.map((entry) => {
              const start = entry?.slot?.startDate;
              return (
                <Button
                  key={String(start)}
                  variant="outline"
                  colorScheme="green"
                  onClick={() => {
                    if (!serviceId) return;
                    onSelectEntry?.({
                      serviceId,
                      staffResourceId,
                      artistName,
                      entry,
                    });
                  }}
                >
                  {toTime(start)}
                </Button>
              );
            })}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
};
