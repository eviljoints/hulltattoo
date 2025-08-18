// ./src/pages/admin/artists.tsx
import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Cookies from "js-cookie";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Input,
  HStack,
  Switch,
  NumberInput,
  NumberInputField,
  VStack,
  Divider,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Select, // <- added for calendar picker
} from "@chakra-ui/react";

type Artist = {
  id: string;
  slug: string;
  name: string;
  roleTitle?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  image?: string | null;
  isActive: boolean;
  // calendarId may be present if your API includes it; optional here
  calendarId?: string | null;
};

type Service = {
  id: string;
  title: string;
  slug: string;
  durationMin: number;
  priceGBP: number; // pence
  depositGBP?: number | null;
  depositPct?: number | null;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  active: boolean;
};

type ArtistServiceLink = {
  id?: string;
  artistId: string;
  serviceId: string;
  priceGBP?: number | null; // pence override
  active: boolean;
  service?: Service; // included in GET
};

type GCalItem = {
  id: string;
  summary?: string;
  primary?: boolean;
  accessRole?: string;
};

const poundsToPence = (v: number) => Math.round((v || 0) * 100);
const penceToPounds = (v?: number | null) =>
  typeof v === "number" && !isNaN(v) ? v / 100 : 0;

const authHeaders = () => {
  const token = Cookies.get("authToken");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const AdminArtistsPage: React.FC = () => {
  const toast = useToast();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  // create form
  const [newArtist, setNewArtist] = useState<Partial<Artist>>({
    name: "",
    slug: "",
    roleTitle: "",
    image: "",
    instagram: "",
    facebook: "",
    isActive: true,
  });

  // inline edits (local state before save)
  const [drafts, setDrafts] = useState<Record<string, Partial<Artist>>>({});

  // manage services modal
  const [svcModalOpen, setSvcModalOpen] = useState(false);
  const [currentArtistId, setCurrentArtistId] = useState<string>("");
  const [links, setLinks] = useState<ArtistServiceLink[]>([]);

  // calendar picker modal
  const [calModalOpen, setCalModalOpen] = useState(false);
  const [calArtistId, setCalArtistId] = useState<string>("");
  const [calendars, setCalendars] = useState<GCalItem[]>([]);
  const [selectedCalId, setSelectedCalId] = useState<string>("");

  const currentArtist = useMemo(
    () => artists.find((a) => a.id === currentArtistId),
    [artists, currentArtistId]
  );

  async function load() {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([
        fetch("/api/admin/artists", { headers: authHeaders() }),
        fetch("/api/admin/services", { headers: authHeaders() }),
      ]);
      if (!aRes.ok) throw new Error("Failed to load artists");
      if (!sRes.ok) throw new Error("Failed to load services");
      const a = await aRes.json();
      const s = await sRes.json();
      setArtists(a.items || []);
      setServices(s.items || []);
    } catch (e: any) {
      toast({
        title: "Load error",
        description: e?.message || "Could not load artists/services",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /** Create artist */
  async function createArtist() {
    try {
      if (!newArtist.name || !newArtist.slug) {
        toast({ title: "Name and slug required", status: "warning" });
        return;
      }
      const res = await fetch("/api/admin/artists", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(newArtist),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || res.statusText);
      }
      toast({ title: "Artist created", status: "success" });
      setNewArtist({
        name: "",
        slug: "",
        roleTitle: "",
        image: "",
        instagram: "",
        facebook: "",
        isActive: true,
      });
      load();
    } catch (e: any) {
      toast({ title: "Create failed", description: e?.message, status: "error" });
    }
  }

  /** Save an existing artist */
  async function saveArtist(a: Artist) {
    try {
      const draft = drafts[a.id] || {};
      const payload = { ...a, ...draft };
      const res = await fetch(`/api/admin/artists/${a.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || res.statusText);
      }
      toast({ title: "Saved", status: "success" });
      setDrafts((d) => {
        const { [a.id]: _, ...rest } = d;
        return rest;
      });
      load();
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message, status: "error" });
    }
  }

  /** Delete artist */
  async function deleteArtist(id: string) {
    if (!confirm("Delete this artist?")) return;
    try {
      const res = await fetch(`/api/admin/artists/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok && res.status !== 204) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || res.statusText);
      }
      toast({ title: "Artist deleted", status: "success" });
      setArtists((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message, status: "error" });
    }
  }

  /** Open services modal */
  async function openServices(artistId: string) {
    setCurrentArtistId(artistId);
    setSvcModalOpen(true);
    try {
      const r = await fetch(
        `/api/admin/artist-services?artistId=${encodeURIComponent(artistId)}`,
        { headers: authHeaders() }
      );
      if (!r.ok) throw new Error("Failed to load artist services");
      const j = await r.json();
      setLinks(j.items || []);
    } catch (e: any) {
      toast({ title: "Load failed", description: e?.message, status: "error" });
      setLinks([]);
    }
  }

  /** Save a single row (upsert) */
  async function saveServiceForArtist(svcId: string) {
    try {
      const row = links.find((l) => l.serviceId === svcId);
      const payload = {
        artistId: currentArtistId,
        serviceId: svcId,
        priceGBP: row?.priceGBP ?? null,
        active: row?.active ?? true,
      };
      const r = await fetch("/api/admin/artist-services", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || r.statusText);
      }
      toast({ title: "Saved", status: "success" });
      // refresh list to ensure we have IDs
      const ref = await fetch(
        `/api/admin/artist-services?artistId=${encodeURIComponent(currentArtistId)}`,
        { headers: authHeaders() }
      );
      const j = await ref.json();
      setLinks(j.items || []);
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message, status: "error" });
    }
  }

  /** Local helpers to mutate links state */
  function setLinkActive(serviceId: string, val: boolean) {
    setLinks((prev) => {
      const have = prev.some((p) => p.serviceId === serviceId);
      return have
        ? prev.map((p) => (p.serviceId === serviceId ? { ...p, active: val } : p))
        : [
            ...prev,
            {
              artistId: currentArtistId,
              serviceId,
              priceGBP: null,
              active: val,
            },
          ];
    });
  }

  function setLinkPrice(serviceId: string, pounds?: number) {
    setLinks((prev) =>
      prev.some((p) => p.serviceId === serviceId)
        ? prev.map((p) =>
            p.serviceId === serviceId
              ? {
                  ...p,
                  priceGBP:
                    typeof pounds === "number" && !isNaN(pounds)
                      ? poundsToPence(pounds)
                      : null,
                }
              : p
          )
        : [
            ...prev,
            {
              artistId: currentArtistId,
              serviceId,
              priceGBP:
                typeof pounds === "number" && !isNaN(pounds)
                  ? poundsToPence(pounds)
                  : null,
              active: true,
            },
          ]
    );
  }

  /** Google Calendar: start OAuth for an artist */
  function connectGoogle(artistId: string) {
    window.location.href = `/api/google/oauth/start?artistId=${encodeURIComponent(
      artistId
    )}`;
  }

  /** Google Calendar: open picker modal for an artist */
  async function openCalendarPicker(artistId: string) {
    try {
      setCalArtistId(artistId);
      setCalModalOpen(true);
      setCalendars([]);
      setSelectedCalId("");

      const r = await fetch(
        `/api/google/calendar-list?artistId=${encodeURIComponent(artistId)}`,
        { headers: authHeaders() }
      );
      if (!r.ok) throw new Error("Failed to load calendars");
      const j = await r.json();

      const items: GCalItem[] = (j.items || [])
        .filter((c: any) => !!c.id)
        .map((c: any) => ({
          id: c.id as string,
          summary: c.summary as string,
          primary: !!c.primary,
          accessRole: c.accessRole as string | undefined,
        }));

      setCalendars(items);
      const def = items.find((i) => i.primary)?.id || items[0]?.id || "";
      setSelectedCalId(def);
    } catch (e: any) {
      toast({ title: "Could not load calendars", description: e?.message, status: "error" });
      setCalModalOpen(false);
    }
  }

  /** Google Calendar: save chosen calendar for artist */
  async function saveCalendarChoice() {
    try {
      if (!calArtistId || !selectedCalId) return;
      const res = await fetch("/api/google/set-calendar", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ artistId: calArtistId, calendarId: selectedCalId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || res.statusText);
      }
      toast({ title: "Calendar set", status: "success" });
      setCalModalOpen(false);
      // Optional: refresh artists to show calendarId if your API returns it
      load();
    } catch (e: any) {
      toast({ title: "Failed to set calendar", description: e?.message, status: "error" });
    }
  }

  return (
    <Box minH="100vh" bg="black" color="white" px={{ base: 4, md: 8 }} py={12}>
      <Head>
        <title>Manage Artists – Hull Tattoo Studio</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta
          name="description"
          content="Admin tools to add artists, connect Google Calendar, and assign services."
        />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/artists`}
        />
        <meta property="og:title" content="Manage Artists – Admin" />
        <meta property="og:description" content="Artists & services management." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <Heading
        mb={8}
        textAlign="center"
        fontSize={{ base: "3xl", md: "5xl" }}
        className="neon-text"
      >
        Manage Artists
      </Heading>

      {/* Create Artist */}
      <Box
        border="1px solid rgba(255,0,127,0.3)"
        borderRadius="md"
        boxShadow="0 0 20px rgba(255,0,127,0.4), 0 0 25px rgba(0,212,255,0.3)"
        p={4}
        mb={8}
      >
        <Heading size="md" mb={3}>
          Add Artist
        </Heading>
        <VStack align="stretch" spacing={3}>
          <HStack>
            <Input
              value={newArtist.name || ""}
              onChange={(e) => setNewArtist((n) => ({ ...n, name: e.target.value }))}
              placeholder="Name"
              aria-label="Artist name"
            />
            <Input
              value={newArtist.slug || ""}
              onChange={(e) => setNewArtist((n) => ({ ...n, slug: e.target.value }))}
              placeholder="slug (e.g., mike)"
              aria-label="Artist slug"
            />
          </HStack>
          <HStack>
            <Input
              value={newArtist.roleTitle || ""}
              onChange={(e) =>
                setNewArtist((n) => ({ ...n, roleTitle: e.target.value }))
              }
              placeholder="Role title"
              aria-label="Role title"
            />
            <Input
              value={newArtist.image || ""}
              onChange={(e) => setNewArtist((n) => ({ ...n, image: e.target.value }))}
              placeholder="Image URL (https://...)"
              aria-label="Image URL"
            />
          </HStack>
          <HStack>
            <Input
              value={newArtist.instagram || ""}
              onChange={(e) =>
                setNewArtist((n) => ({ ...n, instagram: e.target.value }))
              }
              placeholder="Instagram URL"
              aria-label="Instagram URL"
            />
            <Input
              value={newArtist.facebook || ""}
              onChange={(e) =>
                setNewArtist((n) => ({ ...n, facebook: e.target.value }))
              }
              placeholder="Facebook URL"
              aria-label="Facebook URL"
            />
            <HStack>
              <Text>Active</Text>
              <Switch
                isChecked={!!newArtist.isActive}
                onChange={(e) =>
                  setNewArtist((n) => ({ ...n, isActive: e.target.checked }))
                }
              />
            </HStack>
          </HStack>
          <Button onClick={createArtist} colorScheme="blue" isDisabled={loading}>
            Create Artist
          </Button>
        </VStack>
      </Box>

      {/* List + inline edit */}
      <Box
        overflowX="auto"
        border="1px solid rgba(255,0,127,0.3)"
        borderRadius="md"
        boxShadow="0 0 20px rgba(255,0,127,0.4), 0 0 25px rgba(0,212,255,0.3)"
      >
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              <Th color="var(--neon-blue)">Name</Th>
              <Th color="var(--neon-blue)">Slug</Th>
              <Th color="var(--neon-blue)">Role Title</Th>
              <Th color="var(--neon-blue)">Instagram</Th>
              <Th color="var(--neon-blue)">Facebook</Th>
              <Th color="var(--neon-blue)">Active</Th>
              <Th color="var(--neon-pink)">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {artists.map((a) => {
              const d = drafts[a.id] || {};
              const connected = !!a.calendarId; // may show false if API doesn't return it
              return (
                <Tr key={a.id}>
                  <Td>
                    <Input
                      value={d.name ?? a.name}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [a.id]: { ...prev[a.id], name: e.target.value },
                        }))
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      value={d.slug ?? a.slug}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [a.id]: { ...prev[a.id], slug: e.target.value },
                        }))
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      value={d.roleTitle ?? a.roleTitle ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [a.id]: { ...prev[a.id], roleTitle: e.target.value },
                        }))
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      value={d.instagram ?? a.instagram ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [a.id]: { ...prev[a.id], instagram: e.target.value },
                        }))
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      value={d.facebook ?? a.facebook ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [a.id]: { ...prev[a.id], facebook: e.target.value },
                        }))
                      }
                    />
                  </Td>
                  <Td>
                    <HStack>
                      <Badge>{(d.isActive ?? a.isActive) ? "Yes" : "No"}</Badge>
                      <Switch
                        isChecked={d.isActive ?? a.isActive}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [a.id]: { ...prev[a.id], isActive: e.target.checked },
                          }))
                        }
                        aria-label="Toggle active"
                      />
                    </HStack>
                  </Td>
                  <Td>
                    <HStack spacing={2} wrap="wrap">
                      <Button size="sm" onClick={() => saveArtist(a)} colorScheme="blue">
                        Save
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openServices(a.id)}
                        variant="outline"
                      >
                        Manage Services
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => connectGoogle(a.id)}
                        aria-label="Connect Google Calendar"
                      >
                        {connected ? "Reconnect Google" : "Connect Google Calendar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openCalendarPicker(a.id)}
                        aria-label="Choose default calendar"
                      >
                        Choose Calendar
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => deleteArtist(a.id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      {/* Manage services modal */}
      <Modal isOpen={svcModalOpen} onClose={() => setSvcModalOpen(false)} size="4xl">
        <ModalOverlay />
        <ModalContent bg="black" color="white">
          <ModalHeader>
            Assign Services — {currentArtist?.name || "Artist"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={3} opacity={0.8}>
              Toggle Active to enable a service for this artist. Optionally set a
              custom price to override the base price. Click <b>Save</b> on each row.
            </Text>
            <Divider mb={4} />
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th color="var(--neon-blue)">Service</Th>
                  <Th isNumeric color="var(--neon-blue)">Base £</Th>
                  <Th isNumeric color="var(--neon-blue)">Override £</Th>
                  <Th color="var(--neon-blue)">Active</Th>
                  <Th color="var(--neon-pink)"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {services.map((svc) => {
                  const link = links.find((l) => l.serviceId === svc.id);
                  const overridePounds = penceToPounds(link?.priceGBP ?? null);
                  const active = link ? !!link.active : true; // default true when creating
                  return (
                    <Tr key={svc.id}>
                      <Td>{svc.title}</Td>
                      <Td isNumeric>£{penceToPounds(svc.priceGBP).toFixed(2)}</Td>
                      <Td isNumeric>
                        <NumberInput
                          value={overridePounds || ""}
                          onChange={(_, v) => setLinkPrice(svc.id, v)}
                          min={0}
                        >
                          <NumberInputField placeholder="leave blank to use base" />
                        </NumberInput>
                      </Td>
                      <Td>
                        <Switch
                          isChecked={active}
                          onChange={(e) => setLinkActive(svc.id, e.target.checked)}
                        />
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          onClick={() => saveServiceForArtist(svc.id)}
                          colorScheme="blue"
                        >
                          Save
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Calendar picker modal */}
      <Modal isOpen={calModalOpen} onClose={() => setCalModalOpen(false)}>
        <ModalOverlay />
        <ModalContent bg="black" color="white">
          <ModalHeader>Choose Google Calendar</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={3} opacity={0.8}>
              Pick which calendar to use for availability blocking.
            </Text>
            <VStack align="stretch" spacing={3}>
              <Select
                value={selectedCalId}
                onChange={(e) => setSelectedCalId(e.target.value)}
                aria-label="Calendar select"
              >
                {calendars.length === 0 && <option value="">No calendars found</option>}
                {calendars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.summary || c.id} {c.primary ? "(primary)" : ""}
                  </option>
                ))}
              </Select>
              <HStack>
                <Button
                  colorScheme="blue"
                  onClick={saveCalendarChoice}
                  isDisabled={!selectedCalId}
                >
                  Set as Default
                </Button>
                <Button variant="outline" onClick={() => setCalModalOpen(false)}>
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminArtistsPage;
