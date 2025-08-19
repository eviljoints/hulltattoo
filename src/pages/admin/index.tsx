// src/pages/admin/index.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { Box, Button, VStack, Heading } from '@chakra-ui/react';
import Cookies from 'js-cookie';

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) validateToken(token);
  }, []);

  const validateToken = async (token: string) => {
    try {
      const res = await fetch('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setIsAuthenticated(true);
      else {
        Cookies.remove('authToken');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      Cookies.remove('authToken');
      setIsAuthenticated(false);
    }
  };

  const authenticate = async () => {
    const username = prompt('Enter Username:');
    const password = prompt('Enter Password:');
    if (!username || !password) return;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const { token } = await res.json();
        Cookies.set('authToken', token, { expires: 1 });
        setIsAuthenticated(true);
      } else {
        alert('Authentication failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    Cookies.remove('authToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Box p={8} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Head>
          <title>Admin Login – Hull Tattoo Studio</title>
          <meta name="robots" content="noindex,nofollow" />
          <meta name="description" content="Admin login for Hull Tattoo Studio." />
        </Head>
        <Button colorScheme="blue" onClick={authenticate} aria-label="Login to admin">Login</Button>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Head>
        <title>Admin Dashboard – Hull Tattoo Studio</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin`} />
        <meta name="description" content="Internal admin dashboard for Hull Tattoo Studio." />
        <meta property="og:title" content="Admin Dashboard – Hull Tattoo Studio" />
        <meta property="og:type" content="website" />
        <meta property="og:description" content="Internal admin dashboard." />
        <meta name="twitter:card" content="summary" />
      </Head>

      <Button colorScheme="red" mb={4} onClick={handleLogout} aria-label="Logout">Logout</Button>

      <VStack spacing={4} align="start">
        <Heading size="md">Admin Dashboard</Heading>

        {/* Existing sections */}
        <NextLink href="/admin/designs" passHref>
          <Button as="a" w="100%">Manage Designs</Button>
        </NextLink>
        <NextLink href="/admin/calendar" passHref>
          <Button as="a" w="100%">Calendar Availability</Button>
        </NextLink>
        <NextLink href="/admin/loyalty" passHref>
          <Button as="a" w="100%">Manage Loyalty Clients</Button>
        </NextLink>
        <NextLink href="/admin/reviews" passHref>
          <Button as="a" w="100%">Manage Reviews</Button>
        </NextLink>
        <NextLink href="/admin/pending" passHref>
  <Button as="a" w="100%">Pending Bookings</Button>
</NextLink>

        {/* NEW: CRM sections */}
        <NextLink href="/admin/artists" passHref>
          <Button as="a" w="100%">Manage Artists</Button>
        </NextLink>
        <NextLink href="/admin/services" passHref>
          <Button as="a" w="100%">Manage Services</Button>
        </NextLink>
        <NextLink href="/admin/pricing" passHref>
          <Button as="a" w="100%">Per-Artist Pricing & Activation</Button>
        </NextLink>
      </VStack>
    </Box>
  );
};

export default AdminDashboard;
