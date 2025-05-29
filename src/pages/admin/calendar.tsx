// src/pages/admin/calendar.tsx
import React, { useState, useEffect } from 'react';
import { Box, FormControl, FormLabel, Select, Text, Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';
import Cookies from 'js-cookie';
import MikesAvailability from '../../components/MikesAvailability';
import PoppysAvailability from '../../components/PoppysAvailability';

const CalendarPage: React.FC = () => {
  const [who, setWho] = useState<'mike' | 'poppy'>('mike');
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

  if (!isAuthenticated) {
    return (
      <Box p={8} color="white">
        <Text mb={2}>Access Denied. Please login via the Admin Dashboard.</Text>
        <ChakraLink as={NextLink} href="/admin" fontWeight="bold">
          Go to Admin Dashboard
        </ChakraLink>
      </Box>
    );
  }

  return (
    <Box bg="rgb(42,0,21)" color="#fff" p={4}>
      <FormControl mb={4}>
        <FormLabel>View availability for:</FormLabel>
        <Select value={who} onChange={(e) => setWho(e.target.value as 'mike' | 'poppy')}>
          <option value="mike">Mike</option>
          <option value="poppy">Poppy</option>
        </Select>
      </FormControl>
      {who === 'mike' ? <MikesAvailability /> : <PoppysAvailability />}
    </Box>
  );
};

export default CalendarPage;
