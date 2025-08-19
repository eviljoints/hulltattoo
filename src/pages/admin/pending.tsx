// src/pages/admin/pending.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Head from 'next/head';
import Cookies from 'js-cookie';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Button, HStack, Text, Input, NumberInput, NumberInputField,
  Badge, useToast, VStack
} from '@chakra-ui/react';

type Item = {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  start: string;
  end: string;
  createdAt: string;
  customerEmail?: string | null;
  customerName?: string | null;
  totalAmount: number;
  currency: string;
  stripeCheckoutId?: string | null;
  artist: { id: string; name: string; slug: string };
  service: { id: string; title: string; slug: string };
};

const authHeaders = () => {
  const token = Cookies.get('authToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

function pounds(pence: number) { return `£${(pence / 100).toFixed(2)}`; }
function ageMinutes(iso: string) {
  const created = new Date(iso).getTime();
  return Math.floor((Date.now() - created) / 60000);
}

export default function PendingBookings() {
  const toast = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [olderThan, setOlderThan] = useState<number>(30);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/admin/bookings?status=PENDING&olderThanMinutes=${olderThan}`;
      const r = await fetch(url, { headers: authHeaders() });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      setItems(j.items || []);
    } catch (e: any) {
      toast({ title: 'Load failed', description: e?.message || 'Error loading bookings', status: 'error' });
    } finally {
      setLoading(false);
    }
  }, [olderThan, toast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const f = filter.toLowerCase();
    if (!f) return items;
    return items.filter(i =>
      (i.customerEmail || '').toLowerCase().includes(f) ||
      (i.customerName || '').toLowerCase().includes(f) ||
      i.artist.name.toLowerCase().includes(f) ||
      i.service.title.toLowerCase().includes(f)
    );
  }, [items, filter]);

  async function cancelOne(id: string) {
    try {
      const r = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ id, action: 'cancel' }),
      });
      const ok = r.ok;
      if (!ok) throw new Error(await r.text());
      toast({ title: 'Booking cancelled', status: 'success' });
      setItems(prev => prev.filter(x => x.id !== id));
    } catch (e: any) {
      toast({ title: 'Cancel failed', description: e?.message || 'Error', status: 'error' });
    }
  }

  async function bulkCancel() {
    if (!confirm(`Cancel ALL PENDING bookings older than ${olderThan} minutes?`)) return;
    try {
      const r = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ olderThanMinutes: olderThan }),
      });
      const j = await r.json();
      toast({ title: `Cancelled ${j.cancelled} pending bookings`, status: 'success' });
      load();
    } catch (e: any) {
      toast({ title: 'Bulk cancel failed', description: e?.message || 'Error', status: 'error' });
    }
  }

  return (
    <Box minH="100vh" bg="black" color="white" px={{ base: 4, md: 8 }} py={12}>
      <Head>
        <title>Pending Bookings – Admin</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="description" content="Review and cancel unpaid pending bookings." />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/pending`} />
      </Head>

      <Heading mb={6} textAlign="center" fontSize={{ base: '3xl', md: '5xl' }} className="neon-text">
        Pending Bookings
      </Heading>

      <VStack align="stretch" spacing={4} mb={4}>
        <HStack flexWrap="wrap" gap={3}>
          <HStack>
            <Text>Older than (minutes):</Text>
            <NumberInput value={olderThan} min={0} onChange={(_, v) => setOlderThan(v || 0)} width="120px">
              <NumberInputField />
            </NumberInput>
          </HStack>
          <HStack>
            <Input placeholder="Filter by name/email/artist/service" value={filter} onChange={e => setFilter(e.target.value)} width="320px" />
          </HStack>
          <HStack>
            <Button onClick={load} isLoading={loading} colorScheme="blue">Refresh</Button>
            <Button onClick={bulkCancel} colorScheme="red" variant="outline">Bulk cancel</Button>
          </HStack>
        </HStack>
        <Text opacity={0.7}>Showing {filtered.length} of {items.length} records.</Text>
      </VStack>

      <Box
        overflowX="auto"
        border="1px solid rgba(255,0,127,0.3)"
        borderRadius="md"
        boxShadow="0 0 20px rgba(255,0,127,0.4), 0 0 25px rgba(0,212,255,0.3)"
      >
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th color="var(--neon-blue)">When</Th>
              <Th color="var(--neon-blue)">Artist</Th>
              <Th color="var(--neon-blue)">Service</Th>
              <Th color="var(--neon-blue)">Customer</Th>
              <Th isNumeric color="var(--neon-blue)">Amount</Th>
              <Th color="var(--neon-blue)">Age</Th>
              <Th color="var(--neon-pink)">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map(b => (
              <Tr key={b.id}>
                <Td>
                  <Text fontWeight="bold">
                    {new Date(b.start).toLocaleString('en-GB', { timeZone: 'Europe/London', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text opacity={0.7} fontSize="sm">
                    → {new Date(b.end).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Td>
                <Td>{b.artist?.name}</Td>
                <Td>{b.service?.title}</Td>
                <Td>
                  <Text>{b.customerName || b.customerEmail || '-'}</Text>
                  <Text opacity={0.7} fontSize="sm">{b.customerEmail || ''}</Text>
                </Td>
                <Td isNumeric>{pounds(b.totalAmount)}</Td>
                <Td>
                  <Badge colorScheme={ageMinutes(b.createdAt) >= olderThan ? 'red' : 'yellow'}>
                    {ageMinutes(b.createdAt)}m
                  </Badge>
                </Td>
                <Td>
                  <HStack>
                    <Button size="sm" colorScheme="red" onClick={() => cancelOne(b.id)}>
                      Cancel
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
            {filtered.length === 0 && (
              <Tr><Td colSpan={7}><Text p={4} textAlign="center" opacity={0.8}>No pending bookings match your filters.</Text></Td></Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
