import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Input, NumberInput,
  NumberInputField, Switch, HStack, VStack, Divider, useToast, Text
} from '@chakra-ui/react';
import Cookies from 'js-cookie';

type Service = {
  id: string;
  title: string;
  slug: string;
  durationMin: number;
  priceGBP: number;           // minor units (pence)
  depositGBP?: number | null; // minor units (pence)
  depositPct?: number | null; // 0..100
  bufferBeforeMin: number;
  bufferAfterMin: number;
  active: boolean;
};

type NewService = Omit<Service, 'id'>;

const poundsToPence = (v: number) => Math.round((v || 0) * 100);
const penceToPounds = (v?: number | null) => (typeof v === 'number' ? v : 0) / 100;

const authHeaders = () => {
  const token = Cookies.get('authToken');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export default function ServicesAdmin() {
  const toast = useToast();
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const [newItem, setNewItem] = useState<NewService>({
    title: '',
    slug: '',
    durationMin: 60,
    priceGBP: 0,
    depositGBP: null,
    depositPct: null,
    bufferBeforeMin: 0,
    bufferAfterMin: 0,
    active: true,
  });

  async function load() {
    try {
      setLoading(true);
      const r = await fetch('/api/admin/services', { headers: authHeaders() });
      const j = await r.json();
      setItems(j.items || []);
    } catch (e: any) {
      toast({ title: 'Failed to load services', description: e?.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!newItem.title || !newItem.slug) {
      toast({ title: 'Title and slug are required', status: 'warning' });
      return;
    }
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newItem),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || res.statusText);
      }
      toast({ title: 'Service created', status: 'success' });
      setNewItem({
        title: '',
        slug: '',
        durationMin: 60,
        priceGBP: 0,
        depositGBP: null,
        depositPct: null,
        bufferBeforeMin: 0,
        bufferAfterMin: 0,
        active: true,
      });
      load();
    } catch (e: any) {
      toast({ title: 'Create failed', description: e?.message, status: 'error' });
    }
  }

  async function update(s: Service) {
    try {
      const res = await fetch(`/api/admin/services/${s.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(s),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || res.statusText);
      }
      toast({ title: 'Saved', status: 'success' });
      load();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message, status: 'error' });
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok && res.status !== 204) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || res.statusText);
      }
      toast({ title: 'Deleted', status: 'success' });
      setItems(items => items.filter(i => i.id !== id));
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e?.message, status: 'error' });
    }
  }

  return (
    <>
      <Head>
        <title>Admin – Services</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="description" content="Manage tattoo services for Hull Tattoo Studio." />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/services`} />
        <meta property="og:title" content="Admin – Services" />
        <meta property="og:description" content="Internal services management." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <Box maxW="1200px" mx="auto" p={6}>
        <Heading mb={4}>Services</Heading>

        {/* Create new */}
        <Box borderWidth="1px" borderRadius="lg" p={4} mb={6}>
          <Heading size="sm" mb={3}>Create Service</Heading>
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Box flex="1">
                <Text mb={1}>Title</Text>
                <Input
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g., Full Day Session"
                  aria-label="Service title"
                />
              </Box>
              <Box flex="1">
                <Text mb={1}>Slug</Text>
                <Input
                  value={newItem.slug}
                  onChange={(e) => setNewItem({ ...newItem, slug: e.target.value })}
                  placeholder="full-day-session"
                  aria-label="Service slug"
                />
              </Box>
            </HStack>

            <HStack>
              <Box flex="1">
                <Text mb={1}>Duration (min)</Text>
                <NumberInput value={newItem.durationMin} min={5}
                  onChange={(_, v) => setNewItem({ ...newItem, durationMin: v || 0 })}>
                  <NumberInputField />
                </NumberInput>
              </Box>
              <Box flex="1">
                <Text mb={1}>Price (£)</Text>
                <NumberInput value={penceToPounds(newItem.priceGBP)} min={0}
                  onChange={(_, v) => setNewItem({ ...newItem, priceGBP: poundsToPence(v || 0) })}>
                  <NumberInputField />
                </NumberInput>
              </Box>
            </HStack>

            <HStack>
              <Box flex="1">
                <Text mb={1}>Deposit (£)</Text>
                <NumberInput value={penceToPounds(newItem.depositGBP ?? 0)}
                  onChange={(_, v) => setNewItem({ ...newItem, depositGBP: Number.isFinite(v) ? poundsToPence(v) : null })}>
                  <NumberInputField placeholder="optional" />
                </NumberInput>
              </Box>
              <Box flex="1">
                <Text mb={1}>Deposit %</Text>
                <NumberInput value={newItem.depositPct ?? undefined} min={0} max={100}
                  onChange={(_, v) => setNewItem({ ...newItem, depositPct: Number.isFinite(v) ? v : null })}>
                  <NumberInputField placeholder="optional (0–100)" />
                </NumberInput>
              </Box>
            </HStack>

            <HStack>
              <Box flex="1">
                <Text mb={1}>Buffer Before (min)</Text>
                <NumberInput value={newItem.bufferBeforeMin} min={0}
                  onChange={(_, v) => setNewItem({ ...newItem, bufferBeforeMin: v || 0 })}>
                  <NumberInputField />
                </NumberInput>
              </Box>
              <Box flex="1">
                <Text mb={1}>Buffer After (min)</Text>
                <NumberInput value={newItem.bufferAfterMin} min={0}
                  onChange={(_, v) => setNewItem({ ...newItem, bufferAfterMin: v || 0 })}>
                  <NumberInputField />
                </NumberInput>
              </Box>
              <HStack align="center" spacing={3}>
                <Text>Active</Text>
                <Switch isChecked={newItem.active}
                  onChange={(e) => setNewItem({ ...newItem, active: e.target.checked })} />
              </HStack>
            </HStack>

            <HStack>
              <Button onClick={create} colorScheme="blue" isDisabled={loading}>Create</Button>
            </HStack>
          </VStack>
        </Box>

        <Divider mb={6} />

        {/* Existing services */}
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Slug</Th>
              <Th isNumeric>Duration (min)</Th>
              <Th isNumeric>Price (£)</Th>
              <Th isNumeric>Deposit (£ / %)</Th>
              <Th isNumeric>Buffers (pre / post)</Th>
              <Th>Active</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map(s => (
              <Tr key={s.id}>
                <Td>
                  <Input
                    value={s.title}
                    onChange={e => setItems(x => x.map(i => i.id === s.id ? { ...i, title: e.target.value } : i))}
                  />
                </Td>
                <Td>
                  <Input
                    value={s.slug}
                    onChange={e => setItems(x => x.map(i => i.id === s.id ? { ...i, slug: e.target.value } : i))}
                  />
                </Td>
                <Td isNumeric>
                  <NumberInput value={s.durationMin} min={5}
                    onChange={(_, v) => setItems(x => x.map(i => i.id === s.id ? { ...i, durationMin: v || 0 } : i))}>
                    <NumberInputField />
                  </NumberInput>
                </Td>
                <Td isNumeric>
                  <NumberInput value={penceToPounds(s.priceGBP)} min={0}
                    onChange={(_, v) => setItems(x => x.map(i => i.id === s.id ? { ...i, priceGBP: poundsToPence(v || 0) } : i))}>
                    <NumberInputField />
                  </NumberInput>
                </Td>
                <Td isNumeric>
                  <HStack>
                    <NumberInput value={penceToPounds(s.depositGBP ?? 0)}
                      onChange={(_, v) => setItems(x => x.map(i => i.id === s.id ? { ...i, depositGBP: Number.isFinite(v) ? poundsToPence(v) : null } : i))}>
                      <NumberInputField placeholder="£" />
                    </NumberInput>
                    <NumberInput value={s.depositPct ?? undefined} min={0} max={100}
                      onChange={(_, v) => setItems(x => x.map(i => i.id === s.id ? { ...i, depositPct: Number.isFinite(v) ? v : null } : i))}>
                      <NumberInputField placeholder="%" />
                    </NumberInput>
                  </HStack>
                </Td>
                <Td isNumeric>
                  <HStack>
                    <NumberInput value={s.bufferBeforeMin} min={0}
                      onChange={(_, v) => setItems(x => x.map(i => i.id === s.id ? { ...i, bufferBeforeMin: v || 0 } : i))}>
                      <NumberInputField placeholder="pre" />
                    </NumberInput>
                    <NumberInput value={s.bufferAfterMin} min={0}
                      onChange={(_, v) => setItems(x => x.map(i => i.id === s.id ? { ...i, bufferAfterMin: v || 0 } : i))}>
                      <NumberInputField placeholder="post" />
                    </NumberInput>
                  </HStack>
                </Td>
                <Td>
                  <Switch isChecked={s.active}
                    onChange={e => setItems(x => x.map(i => i.id === s.id ? { ...i, active: e.target.checked } : i))}
                  />
                </Td>
                <Td>
                  <HStack>
                    <Button size="sm" onClick={() => update(s)} colorScheme="blue">Save</Button>
                    <Button size="sm" onClick={() => remove(s.id)} colorScheme="red" variant="outline">Delete</Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {loading && <Text mt={4}>Loading…</Text>}
      </Box>
    </>
  );
}
