// src/pages/book.tsx
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  HStack,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import styles from "./artists/MikePage.module.css";

// ✅ client-only widget to avoid hydration mismatch
const WixArtistBookingWidget = dynamic(
  () =>
    import("~/components/WixArtistBookingWidget").then(
      (m) => m.WixArtistBookingWidget
    ),
  { ssr: false }
);

type ArtistKey = "jen" | "harley" | "mike";

const ARTISTS: {
  key: ArtistKey;
  name: string;
  staffResourceId?: string;
  hourlyRateGbp: number;
}[] = [
  {
    key: "jen",
    name: "Jen",
    staffResourceId: process.env.NEXT_PUBLIC_WIX_STAFF_JEN_RESOURCE_ID,
    hourlyRateGbp: 50,
  },
  {
    key: "harley",
    name: "Harley",
    staffResourceId: process.env.NEXT_PUBLIC_WIX_STAFF_HARLEY_RESOURCE_ID,
    hourlyRateGbp: 35,
  },
  {
    key: "mike",
    name: "Mike",
    staffResourceId: process.env.NEXT_PUBLIC_WIX_STAFF_MIKE_RESOURCE_ID,
    hourlyRateGbp: 80,
  },
];

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v : undefined;
}

export default function BookPage() {
  const router = useRouter();

  const artistKey = asString(router.query.artist)?.toLowerCase() || "jen";
  const returnFlag = asString(router.query.return) === "1";
  const selectedArtist = ARTISTS.find((a) => a.key === artistKey) || ARTISTS[0];

  return (
    <>
      <Head>
        <title>Book | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="Choose Mike, Harley or Jen and view tattoo appointments at Hull Tattoo Studio, 255 Hedon Road. Continue securely to Wix checkout."
        />
        <link rel="canonical" href="https://www.hulltattoostudio.com/book/" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
          p={{ base: 3, md: 8 }}
          position="relative"
          zIndex="1"
        >
          <Text
            as="h1"
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="bold"
            textAlign="center"
            textShadow="0 0 8px #ff007f, 0 0 12px #00d4ff"
            mb={4}
          >
            Book an appointment
          </Text>

          <VStack spacing={4} mb={8}>
            {returnFlag ? (
              <Alert status="info" variant="subtle" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <AlertTitle>You&apos;re back from checkout</AlertTitle>
                  <AlertDescription>
                    Returning here does not confirm payment or reserve an
                    appointment. Check your Wix confirmation email, or contact
                    the studio if you are unsure.
                  </AlertDescription>
                </Box>
              </Alert>
            ) : null}
          </VStack>

          <HStack justify="center" mb={8} spacing={3} flexWrap="wrap">
            <Text as="label" htmlFor="booking-artist" fontWeight="semibold">
              Artist:
            </Text>
            <Select
              id="booking-artist"
              value={selectedArtist.key}
              onChange={(e) =>
                router.replace(
                  { pathname: "/book", query: { artist: e.target.value } },
                  undefined,
                  { shallow: true }
                )
              }
              maxW="260px"
              bg="black"
              color="white"
              borderColor="gray.600"
            >
              {ARTISTS.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.name}
                </option>
              ))}
            </Select>
          </HStack>

          {router.isReady && (
            <WixArtistBookingWidget
              key={selectedArtist.key}
              artistName={selectedArtist.name}
              staffResourceId={selectedArtist.staffResourceId}
              hourlyRateGbp={selectedArtist.hourlyRateGbp}
              maxMonthsAhead={2}
              debug={false}
              onSelectEntry={({
                serviceId,
                staffResourceId,
                artistName,
                entry,
              }) => {
                const payload = {
                  serviceId,
                  staffResourceId,
                  artistName,
                  hourlyRateGbp: selectedArtist.hourlyRateGbp,
                  entry,
                };

                sessionStorage.setItem(
                  "HTS_WIX_CHECKOUT_PAYLOAD",
                  JSON.stringify(payload)
                );
                router.push("/checkout");
              }}
            />
          )}
        </Box>
      </Box>
    </>
  );
}
