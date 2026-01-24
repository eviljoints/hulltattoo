// src/pages/checkout.tsx
import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Divider,
  HStack,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import styles from "./artists/MikePage.module.css";
import { getWixClient } from "~/lib/wixClient";

const LONDON_TZ = "Europe/London";

type CheckoutPayload = {
  serviceId: string;
  staffResourceId?: string;
  artistName: string;
  entry: any; // WixAvailabilityEntry (slotAvailability)
  // optional if you want to display:
  hourlyRateGbp?: number;
};

function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: LONDON_TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();

  const [paying, setPaying] = useState(false);

  const payload: CheckoutPayload | null = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("HTS_WIX_CHECKOUT_PAYLOAD");
      return raw ? (JSON.parse(raw) as CheckoutPayload) : null;
    } catch {
      return null;
    }
  }, []);

  async function startWixCheckoutRedirect() {
    if (!payload?.serviceId || !payload?.entry) {
      toast({
        title: "Missing booking details",
        description: "Please go back and select a slot again.",
        status: "warning",
      });
      router.push("/book");
      return;
    }

    setPaying(true);

    try {
      const wix = getWixClient();

      console.groupCollapsed("[WixCheckout] createRedirectSession");
      console.log("payload:", payload);

      const redirect = await wix.redirects.createRedirectSession({
        bookingsCheckout: {
          slotAvailability: payload.entry,
          timezone: LONDON_TZ,
        },
        callbacks: {
          // Wix sends user back here after payment flow
          postFlowUrl: `${window.location.origin}/checkout/return`,
        },
      } as any);

      const url = redirect?.redirectSession?.fullUrl;
      console.log("redirect response:", redirect);
      console.log("redirect URL:", url);
      console.groupEnd();

      if (!url) throw new Error("No checkout URL returned from Wix");

      // ✅ Most reliable: redirect in same tab
      window.location.assign(url);
    } catch (e: any) {
      console.error("[WixCheckout] error:", e);
      toast({
        title: "Could not start checkout",
        description: e?.message || "Wix checkout failed",
        status: "error",
      });
      setPaying(false);
    }
  }

  // Optional: auto-start if user lands here with a payload
  useEffect(() => {
    // If you DON'T want auto redirect, delete this effect.
    if (payload?.serviceId && payload?.entry) {
      // comment this out if you want user to click instead
      // startWixCheckoutRedirect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Checkout | Hull Tattoo Studio</title>
        <meta name="description" content="Confirm your booking details and pay securely." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <Box
        position="relative"
        bg="transparent"
        color="white"
        w="100%"
        p={8}
        px={{ base: 4, md: 8 }}
        minH="100vh"
        as="main"
        overflowX="hidden"
        boxShadow="0 0 20px #ff007f, 0 0 30px #00d4ff"
      >
        <Box className={styles.backgroundLines} />

        <Box
          className="glass-card"
          border="1px solid rgba(255,0,127,0.35)"
          boxShadow="0 0 0 1px rgba(0,212,255,0.25) inset, 0 0 22px rgba(255,0,127,0.35), 0 0 28px rgba(0,212,255,0.25)"
          borderRadius="xl"
          p={{ base: 6, md: 8 }}
          position="relative"
          zIndex="1"
          maxW="860px"
          mx="auto"
        >
          <Text
            as="h1"
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="bold"
            textAlign="center"
            textShadow="0 0 8px #ff007f, 0 0 12px #00d4ff"
            mb={4}
          >
            Checkout
          </Text>

          {!payload ? (
            <Alert status="warning" variant="subtle" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">No booking selected</Text>
                <Text opacity={0.9}>Please go back and pick an artist, service, and time slot.</Text>
                <Button mt={4} colorScheme="pink" onClick={() => router.push("/book")}>
                  Back to booking
                </Button>
              </Box>
            </Alert>
          ) : (
            <VStack align="stretch" spacing={4}>
              <Box p={4} border="1px solid rgba(255,255,255,0.12)" borderRadius="lg">
                <Text fontWeight="bold" mb={2}>
                  Booking details
                </Text>

                <HStack justify="space-between" gap={4} flexWrap="wrap">
                  <Text opacity={0.85}>Artist</Text>
                  <Text fontWeight="semibold">{payload.artistName}</Text>
                </HStack>

                <HStack justify="space-between" gap={4} flexWrap="wrap" mt={2}>
                  <Text opacity={0.85}>Time</Text>
                  <Text fontWeight="semibold">{fmtDateTime(payload.entry?.slot?.startDate)}</Text>
                </HStack>

                <Divider my={3} />

                <HStack justify="space-between" gap={4} flexWrap="wrap">
                  <Text opacity={0.85}>Rate</Text>
                  <Text fontWeight="bold" fontSize="xl">
                    {typeof payload.hourlyRateGbp === "number" ? `£${payload.hourlyRateGbp}/hour` : "—"}
                  </Text>
                </HStack>

                <Text opacity={0.7} fontSize="sm" mt={3}>
                  Final price is calculated in Wix checkout based on the selected service + duration.
                </Text>
              </Box>

              <HStack justify="space-between" flexWrap="wrap" gap={3}>
                <Button variant="outline" onClick={() => router.push("/book")}>
                  Change selection
                </Button>

                <Button colorScheme="pink" onClick={startWixCheckoutRedirect} isLoading={paying}>
                  Continue to payment
                </Button>
              </HStack>

              {paying ? (
                <HStack opacity={0.85}>
                  <Spinner size="sm" />
                  <Text>Redirecting to secure checkout…</Text>
                </HStack>
              ) : null}
            </VStack>
          )}
        </Box>
      </Box>
    </>
  );
}
