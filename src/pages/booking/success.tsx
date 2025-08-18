// src/pages/booking/success.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Heading, Text, Spinner, Button } from '@chakra-ui/react';
import NextLink from 'next/link';

export default function BookingSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const bookingId = router.query.bookingId as string | undefined;
    const session_id = router.query.session_id as string | undefined;
    if (!bookingId && !session_id) return;

    (async () => {
      try {
        const r = await fetch('/api/bookings/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, session_id }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || r.statusText);
        }
        setStatus('ok');
      } catch (e: any) {
        setStatus('error');
        setMessage(e?.message || 'Failed to finalize booking (we will email if it went through).');
      }
    })();
  }, [router.query]);

  return (
    <Box maxW="700px" mx="auto" p={8}>
      <Head>
        <title>Booking Confirmed – Hull Tattoo Studio</title>
        <meta name="robots" content="noindex,follow" />
      </Head>

      {status === 'loading' && (
        <Box textAlign="center">
          <Spinner size="lg" />
          <Text mt={4}>Finalizing your booking…</Text>
        </Box>
      )}

      {status === 'ok' && (
        <Box textAlign="center">
          <Heading size="lg" mb={3}>Thanks! Your booking is confirmed.</Heading>
          <Text mb={6}>A calendar invite and confirmation have been sent to your email.</Text>
          <NextLink href="/" passHref>
            <Button as="a" colorScheme="pink">Back to Home</Button>
          </NextLink>
        </Box>
      )}

      {status === 'error' && (
        <Box textAlign="center">
          <Heading size="lg" mb={3}>Payment complete, but we’re finalizing your booking</Heading>
          <Text mb={6}>{message}</Text>
          <NextLink href="/" passHref>
            <Button as="a" colorScheme="pink">Back to Home</Button>
          </NextLink>
        </Box>
      )}
    </Box>
  );
}
