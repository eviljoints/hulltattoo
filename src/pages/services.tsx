// src/pages/services.tsx
import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import {
  Box,
  Text,
  Grid,
  Badge,
  Spinner,
  HStack,
  Button,
  VStack,
  useToast,
  Select,
} from "@chakra-ui/react";

import styles from "./artists/MikePage.module.css";
import MotionBox from "../components/MotionBox";
import TextCard from "~/components/TextCard";
import { getWixClient } from "../lib/wixClient";

type WixService = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  staffMemberIds?: string[]; // resourceIds that can provide service
  media?: { mainMedia?: { image?: { url?: string } } };
  price?: { amount?: string; currency?: string };
  payment?: { rateType?: string };
  schedule?: { durationInMinutes?: number };
};

function serviceUuid(s: WixService) {
  return (s.id || s._id || "").trim();
}
function serviceLabel(s: WixService) {
  return (s.name || s.title || "Untitled service").trim();
}
function moneyGBP(amountStr?: string) {
  if (!amountStr) return null;
  const n = Number(amountStr);
  if (Number.isNaN(n)) return null;
  return `£${n.toFixed(2)}`;
}

const ARTISTS = [
  { key: "jen", label: "Jen", staffResourceId: process.env.NEXT_PUBLIC_WIX_STAFF_JEN_RESOURCE_ID },
  { key: "harley", label: "Harley", staffResourceId: process.env.NEXT_PUBLIC_WIX_STAFF_HARLEY_RESOURCE_ID },
  { key: "mike", label: "Mike", staffResourceId: process.env.NEXT_PUBLIC_WIX_STAFF_MIKE_RESOURCE_ID },
] as const;

const ServicesPage: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<WixService[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [artistKey, setArtistKey] = useState<string>(ARTISTS[0]?.key || "jen");

  const selectedArtist = ARTISTS.find((a) => a.key === artistKey) || ARTISTS[0];
  const artistResourceId = selectedArtist?.staffResourceId;
  const artistMissingEnv = !artistResourceId;

  const sorted = useMemo(() => {
    const base = [...items].sort((a, b) => serviceLabel(a).localeCompare(serviceLabel(b)));

    // If we have a chosen artist, show only services assigned to them
    if (!artistResourceId) return base;
    return base.filter((s) => (s.staffMemberIds || []).includes(artistResourceId));
  }, [items, artistResourceId]);

  async function loadServices() {
    setLoading(true);
    setError(null);

    try {
      const wix = getWixClient();
      const res = await wix.services.queryServices().find();
      const list = (res?.items || []) as WixService[];
      setItems(list);
    } catch (e: any) {
      const msg = e?.message || "Failed to load services";
      setError(msg);
      toast({ title: "Could not load services", description: msg, status: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Services | Hull Tattoo Studio</title>
        <meta name="description" content="Browse services and start your booking." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://www.hulltattoostudio.com/services" />
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
          <MotionBox
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            mb={10}
          >
            <Text
              as="h1"
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="bold"
              textAlign="center"
              textShadow="0 0 8px #ff007f, 0 0 12px #00d4ff"
              mb={4}
            >
              Services
            </Text>

            <TextCard
              title="Choose artist + service"
              subtitle="We’ll only show services that artist can provide."
              description={`Service assignments + artist calendars are managed in Wix, synced automatically.`}
              stripes={[
                { left: "12%", width: "18px", color: "#ff007f" },
                { left: "68%", width: "24px", color: "#00d4ff" },
              ]}
            />

            <HStack justify="center" mt={6} spacing={3} flexWrap="wrap">
              <Text fontWeight="semibold">Artist:</Text>
              <Select
                value={artistKey}
                onChange={(e) => setArtistKey(e.target.value)}
                maxW="260px"
                bg="black"
                color="white"
                borderColor="gray.600"
              >
                {ARTISTS.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
              </Select>

              <Button onClick={loadServices} variant="outline" colorScheme="pink">
                Refresh
              </Button>
            </HStack>

            {artistMissingEnv ? (
              <Box mt={4} p={3} border="1px solid rgba(255,0,127,0.35)" borderRadius="md">
                <Text fontSize="sm" opacity={0.9}>
                  Missing env var for {selectedArtist.label}. Set{" "}
                  <b>NEXT_PUBLIC_WIX_STAFF_{selectedArtist.key.toUpperCase()}_RESOURCE_ID</b>.
                </Text>
              </Box>
            ) : null}
          </MotionBox>

          {loading ? (
            <Box p={6} border="1px solid rgba(255,255,255,0.12)" borderRadius="lg">
              <HStack>
                <Spinner />
                <Text>Loading services…</Text>
              </HStack>
            </Box>
          ) : error ? (
            <Box p={6} border="1px solid rgba(255,0,127,0.35)" borderRadius="lg">
              <Text fontWeight="bold" mb={2}>
                Couldn’t load services
              </Text>
              <Text opacity={0.85} mb={4}>
                {error}
              </Text>
              <Button onClick={loadServices} colorScheme="pink">
                Try again
              </Button>
            </Box>
          ) : sorted.length === 0 ? (
            <Box p={6} border="1px solid rgba(255,255,255,0.12)" borderRadius="lg">
              <Text>
                No services found for {selectedArtist.label}. Check service staff assignments in Wix.
              </Text>
            </Box>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={6}>
              {sorted.map((s) => {
                const id = serviceUuid(s);
                const name = serviceLabel(s);
                const price = moneyGBP(s.price?.amount);
                const duration = s.schedule?.durationInMinutes ? `${s.schedule.durationInMinutes} mins` : null;
                const imgUrl = s.media?.mainMedia?.image?.url;

                return (
                  <Box
                    key={id || name}
                    border="1px solid rgba(255,255,255,0.12)"
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="0 0 10px rgba(255,0,127,0.18), 0 0 16px rgba(0,212,255,0.12)"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "0 0 16px rgba(255,0,127,0.28), 0 0 22px rgba(0,212,255,0.18)",
                    }}
                    transition="all 0.2s ease"
                    bg="rgba(0,0,0,0.35)"
                  >
                    {imgUrl ? (
                      <Box position="relative" w="100%" h="180px">
                        <Image
                          src={imgUrl}
                          alt={name}
                          width={1200}
                          height={180}
                          style={{ objectFit: "cover" }}
                          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                        />
                      </Box>
                    ) : (
                      <Box
                        w="100%"
                        h="180px"
                        bg="rgba(255,255,255,0.03)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text opacity={0.7}>No image</Text>
                      </Box>
                    )}

                    <VStack align="stretch" spacing={3} p={5}>
                      <Text fontSize="xl" fontWeight="bold" textShadow="0 0 6px rgba(255,0,127,0.35)">
                        {name}
                      </Text>

                      <HStack spacing={2} flexWrap="wrap">
                        {price ? <Badge colorScheme="pink">{price}</Badge> : null}
                        {duration ? <Badge colorScheme="cyan">{duration}</Badge> : null}
                        {s.payment?.rateType ? (
                          <Badge variant="outline" colorScheme="gray">
                            {s.payment.rateType}
                          </Badge>
                        ) : null}
                      </HStack>

                      {s.description ? (
                        <Text opacity={0.9} noOfLines={4} lineHeight="1.7">
                          {s.description}
                        </Text>
                      ) : (
                        <Text opacity={0.65}>No description provided.</Text>
                      )}

                      <Button
                        mt={2}
                        colorScheme="pink"
                        variant="solid"
                        onClick={() => {
                          window.location.href = `/book?artist=${encodeURIComponent(artistKey)}&serviceId=${encodeURIComponent(
                            id
                          )}`;
                        }}
                        isDisabled={!id || artistMissingEnv}
                      >
                        Book this service
                      </Button>
                    </VStack>
                  </Box>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ServicesPage;
