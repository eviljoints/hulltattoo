// src/pages/admin/index.tsx
import React, { useState, useEffect } from 'react';
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
        <Button colorScheme="blue" onClick={authenticate}>Login</Button>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Button colorScheme="red" mb={4} onClick={handleLogout}>Logout</Button>
      <VStack spacing={4} align="start">
        <Heading size="md">Admin Dashboard</Heading>
        {/* Link-wrapped buttons to avoid multiple child error */}
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
      </VStack>
    </Box>
  );
};

export default AdminDashboard;