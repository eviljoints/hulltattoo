import React, { useEffect } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
export default function CheckoutReturnPage() {
  useEffect(() => { try { sessionStorage.removeItem('HTS_WIX_CHECKOUT_PAYLOAD'); } catch {} }, []);
  return <><Head><title>Back from checkout | Hull Tattoo Studio</title><meta name="robots" content="noindex,nofollow" /></Head>
    <Box minH="65vh" display="flex" alignItems="center" justifyContent="center" px={4}>
      <VStack spacing={5} p={{base:5,md:8}} maxW="650px" className="glass-card" textAlign="center">
        <Text as="h1" fontSize={{base:'2xl',md:'4xl'}}>Back from Wix checkout</Text>
        <Text>Returning here does not confirm payment or reserve an appointment. Please check your Wix booking confirmation email.</Text>
        <Text>If you are unsure whether payment completed, contact the studio before trying again to avoid a duplicate booking.</Text>
        <Button as="a" href="tel:+447940080790" colorScheme="pink">Call the studio</Button>
        <NextLink href="/book/" passHref><Button as="a" variant="outline">Back to appointments</Button></NextLink>
      </VStack>
    </Box></>;
}
