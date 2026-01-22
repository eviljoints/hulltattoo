// src/pages/book.tsx
import React, { useEffect, useMemo, useState } from "react";
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
  () => import("~/components/WixArtistBookingWidget").then((m) => m.WixArtistBookingWidget),
  { ssr: false }
);

type ArtistKey = "jen" | "harley" | "mike";

const ARTISTS: {
  key: ArtistKey;
  name: string;
  staffResourceId?: string;
  hourlyRateGbp: number;
}[] = [
  { key: "jen", name: "Jen", staffResourceId: process.env.NEXT_PUBLIC_WIX_STAFF_JEN_RESOURCE_ID, hourlyRateGbp: 50 },
  { key: "harley", name: "Harley", staffResourceId: process.env.NEXT_PUBLIC_WIX_STAFF_HARLEY_RESOURCE_ID, hourlyRateGbp: 35 },
  { key: "mike", name: "Mike", staffResourceId: process.env.NEXT_PUBLIC_WIX_STAFF_MIKE_RESOURCE_ID, hourlyRateGbp: 80 },
];

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v : undefined;
}

export default function BookPage() {
  const router = useRouter();

  const [artistKey, setArtistKey] = useState<ArtistKey>("jen");
  const returnFlag = useMemo(() => asString(router.query.return) === "1", [router.query.return]);

  useEffect(() => {
    if (!router.isReady) return;
    const qArtist = asString(router.query.artist)?.toLowerCase();
    const validArtist = (ARTISTS.find((a) => a.key === qArtist) ? qArtist : undefined) as
      | ArtistKey
      | undefined;
    setArtistKey(validArtist || "jen");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const selectedArtist = useMemo(
    () => ARTISTS.find((a) => a.key === artistKey) || ARTISTS[0],
    [artistKey]
  );

  const missingEnv = useMemo(() => {
    return ARTISTS.filter((a) => !a.staffResourceId).map((a) => a.key);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const currentArtist = asString(router.query.artist)?.toLowerCase();
    if (currentArtist === artistKey) return;

    router.replace(
      { pathname: "/book", query: { ...router.query, artist: artistKey } },
      undefined,
      { shallow: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistKey, router.isReady]);

  return (
    <>
      <Head>
        <title>Book | Hull Tattoo Studio</title>
        <meta name="description" content="Book your tattoo appointment." />
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
          p={{ base: 6, md: 8 }}
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
              <Alert status="success" variant="subtle" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <AlertTitle>You&apos;re back from checkout</AlertTitle>
                  <AlertDescription>
                    If you completed payment, your booking should now be confirmed in Wix Bookings.
                  </AlertDescription>
                </Box>
              </Alert>
            ) : null}

            {missingEnv.length > 0 ? (
              <Alert status="warning" variant="subtle" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <AlertTitle>Missing staff resource IDs</AlertTitle>
                  <AlertDescription>
                    These env vars are missing, so availability filtering may not work:{" "}
                    <b>{missingEnv.join(", ")}</b>
                  </AlertDescription>
                </Box>
              </Alert>
            ) : null}
          </VStack>

          <HStack justify="center" mb={8} spacing={3} flexWrap="wrap">
            <Text fontWeight="semibold">Artist:</Text>
            <Select
              value={artistKey}
              onChange={(e) => setArtistKey(e.target.value as ArtistKey)}
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

          <WixArtistBookingWidget
            artistName={selectedArtist.name}
            staffResourceId={selectedArtist.staffResourceId}
            hourlyRateGbp={selectedArtist.hourlyRateGbp}
            maxMonthsAhead={2}
            debug={true}
            onSelectEntry={({ serviceId, staffResourceId, artistName, entry }) => {
              const payload = {
  serviceId,
  staffResourceId,
  artistName,
  hourlyRateGbp: selectedArtist.hourlyRateGbp,
  entry,
};

              console.log("[BookPage] Selected slot -> checkout payload:", {
                artistName,
                staffResourceId,
                serviceId,
                slotStart: entry?.slot?.startDate,
              });

              sessionStorage.setItem("HTS_WIX_CHECKOUT_PAYLOAD", JSON.stringify(payload));
              router.push("/checkout");
            }}
          />
        </Box>
      </Box>
    </>
  );
}
