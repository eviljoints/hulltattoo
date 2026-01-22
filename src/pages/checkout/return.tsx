// src/pages/checkout/return.tsx
import React, { useEffect } from "react";
import Head from "next/head";
import { Box, Button, Text, VStack } from "@chakra-ui/react";

export default function CheckoutReturnPage() {
  useEffect(() => {
    try {
      // If opened as a popup, refresh opener
      if (window.opener && !window.opener.closed) {
        window.opener.location.href = `${window.location.origin}/book?return=1`;
      }
      // Attempt to close popup
      window.close();
    } catch {
      // ignore
    }
  }, []);

  return (
    <>
      <Head>
        <title>Returning… | Hull Tattoo Studio</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="black" color="white">
        <VStack spacing={4} p={6} border="1px solid rgba(255,255,255,0.12)" borderRadius="xl">
          <Text fontSize="xl" fontWeight="bold">
            Returning to Hull Tattoo Studio…
          </Text>
          <Text opacity={0.85} textAlign="center">
            If this window doesn&apos;t close automatically, click below.
          </Text>
          <Button
            colorScheme="pink"
            onClick={() => {
              try {
                if (window.opener && !window.opener.closed) {
                  window.opener.location.href = `${window.location.origin}/book?return=1`;
                } else {
                  window.location.href = "/book?return=1";
                }
                window.close();
              } catch {
                window.location.href = "/book?return=1";
              }
            }}
          >
            Close
          </Button>
        </VStack>
      </Box>
    </>
  );
}
