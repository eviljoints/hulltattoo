// src/pages/jen.tsx
import React, { useMemo } from "react";
import {
  Box,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  VStack,
  Link as ChakraLink,
  useMediaQuery,
  AspectRatio,
  HStack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import dynamic from "next/dynamic";
import Image from "next/image";
import Head from "next/head";
import styles from "./artists/MikePage.module.css"; // keep same background class for visual parity
import TextCard from "~/components/TextCard";
import { useRouter } from "next/router";

// ✅ client-only widget to avoid hydration mismatch
const WixArtistBookingWidget = dynamic(
  () => import("~/components/WixArtistBookingWidget").then((m) => m.WixArtistBookingWidget),
  { ssr: false }
);

// Mike page uses dynamic MotionBox/TextCard in places; here you already import MotionBox normally.
// Keep as-is:
import MotionBox from "../components/MotionBox";

const LONDON_TZ = "Europe/London";

// ✅ Jen-only constants
const JEN_STAFF_RESOURCE_ID = process.env.NEXT_PUBLIC_WIX_STAFF_JEN_RESOURCE_ID;
const JEN_HOURLY_RATE_GBP = 50;

const gallery = {
  neoTraditionalColour: {
    description:
      "Jen is developing her craft in full-colour Neo Traditional — bold lines, rich palettes, and illustrative forms. She’s building a portfolio with vibrant pieces and is available for small to medium designs while she trains.",
    images: ["jen1.webp", "jen2.webp", "jen3.webp", "jen4.webp", "jen5.webp", "jen6.webp"],
  },
};

// --- JSON-LD Person for Jen ---
const structuredData = {
  "@context": "http://schema.org",
  "@type": "Person",
  name: "Jen",
  jobTitle: "Apprentice Tattoo Artist (Full Colour Neo Traditional)",
  worksFor: {
    "@type": "Organization",
    name: "Hull Tattoo Studio",
    url: "https://www.hulltattoostudio.com",
  },
  image: "https://www.hulltattoostudio.com/images/jen.webp",
  url: "https://www.hulltattoostudio.com/jen",
  description:
    "Jen is an apprentice tattoo artist at Hull Tattoo Studio focusing on full-colour Neo Traditional work. She’s developing a vibrant portfolio and is available for select projects.",
};

const JenPage: React.FC = () => {
  const router = useRouter();
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  const motionProps = isLargerThan768
    ? {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 },
      };

  const PAGE_URL = "https://www.hulltattoostudio.com/jen";
  const OG_IMAGE = "https://www.hulltattoostudio.com/images/jen.webp";

  return (
    <>
      <Head>
        <title>Jen - Apprentice Neo Traditional (Full Colour) | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="Meet Jen, an apprentice at Hull Tattoo Studio focusing on full-colour Neo Traditional tattoos. Bold lines, rich palettes, and illustrative styles."
        />
        <meta
          name="keywords"
          content="Jen, Apprentice Tattoo Artist, Hull Tattoo Studio, Neo Traditional Tattoos, Full Colour Tattoos, Illustrative Tattoos, Hull"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Social / OG */}
        <meta property="og:title" content="Jen - Apprentice Neo Traditional (Full Colour) | Hull Tattoo Studio" />
        <meta
          property="og:description"
          content="Jen is developing her craft in full-colour Neo Traditional at Hull Tattoo Studio. Explore her growing portfolio."
        />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="profile" />

        {/* Canonical + hreflang */}
        <link rel="canonical" href={PAGE_URL} />
        <link rel="alternate" hrefLang="en-gb" href={PAGE_URL} />
        <link rel="alternate" hrefLang="x-default" href={PAGE_URL} />

        {/* Perf */}
        <link rel="preload" href="/images/jen.webp" as="image" />

        {/* Structured Data (Person) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

        {/* LocalBusiness JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Hull Tattoo Studio",
              description:
                "Hull Tattoo Studio offers professional tattoo services including tattoo coverups and tattoo apprenticeships in Hull. Visit us for custom tattoos and expert advice.",
              image: "https://www.hulltattoostudio.com/images/og-image.webp",
              url: "https://www.hulltattoostudio.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "255 Hedon",
                addressLocality: "Hull",
                postalCode: "HU9 1NQ",
                addressCountry: "GB",
              },
              telephone: "07940080790",
              openingHoursSpecification: [
                { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:30", closes: "17:00" },
                { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday"], opens: "11:30", closes: "19:00" },
              ],
            }),
          }}
        />
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
          p={8}
          position="relative"
          zIndex="1"
        >
          {/* Header / Intro */}
          <MotionBox {...motionProps} mb={16} as="section">
            <Text
              as="h1"
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="bold"
              color="white"
              textAlign="center"
              textShadow="0 0 8px #ff007f, 0 0 12px #00d4ff"
              mb={4}
              className="neon-hero"
            >
              Jen
            </Text>
            <Text
              as="h2"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="medium"
              color="white"
              textAlign="center"
              textShadow="0 0 4px #ff007f, 0 0 8px #00d4ff"
              mb={8}
            >
              Apprentice · Full Colour Neo Traditional
            </Text>

            <Box mb={8} textAlign="center">
              <Image
                src="/images/jen.webp"
                alt="Portrait of Jen, a tattoo apprentice artist at Hull Tattoo Studio"
                width={200}
                height={200}
                priority
                style={{
                  borderRadius: "50%",
                  boxShadow: "0 0 15px #ff007f, 0 0 25px #00d4ff",
                  border: "4px solid #ff007f",
                }}
              />
            </Box>

            <TextCard
              title="About Jen"
              subtitle="Full-colour Neo Traditional in development."
              description={`Jen is a developing artist at <strong>Hull Tattoo Studio</strong> who focuses on <strong>full-colour Neo Traditional</strong>. Her work blends bold structure with painterly colour — a style that rewards both clarity and character.<br/><br/>
              As an apprentice, Jen is actively expanding her portfolio with small to mid-sized pieces while training with our team. If you love expressive palettes and illustrative designs, Jen would love to collaborate on your next tattoo.`}
              stripes={[
                { left: "12%", width: "18px", color: "#ff007f" },
                { left: "68%", width: "24px", color: "#00d4ff" },
              ]}
            />
          </MotionBox>

          {/* Gallery */}
          <MotionBox {...motionProps} mb={16} as="section">
            <Tabs variant="soft-rounded" colorScheme="pink">
              <TabList justifyContent="center" mb={8}>
                <Tab _selected={{ bg: "#ff007f", color: "white" }} fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>
                  Neo Traditional · Colour
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} mb={8}>
                    <Text fontSize={{ base: "lg", md: "xl" }} textAlign="center" fontWeight="medium" lineHeight="1.8" maxW="800px">
                      {gallery.neoTraditionalColour.description}
                    </Text>
                  </VStack>

                  <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={6}>
                    {gallery.neoTraditionalColour.images.map((img, index) => (
                      <AspectRatio ratio={1} key={index}>
                        <MotionBox
                          position="relative"
                          borderRadius="md"
                          overflow="hidden"
                          boxShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          _hover={{ boxShadow: "0 0 14px #ff007f, 0 0 18px #00d4ff" }}
                        >
                          <Image
                            src={`/images/Jen/${img}`}
                            alt={`Jen Neo Traditional colour piece ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            loading="lazy"
                            sizes="(min-width: 768px) 33vw, 50vw"
                          />
                        </MotionBox>
                      </AspectRatio>
                    ))}
                  </Grid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </MotionBox>

          {/* ✅ Jen booking block (Wix) */}
          <Box as="section" mb={16}>
            {!JEN_STAFF_RESOURCE_ID ? (
              <Alert status="warning" variant="subtle" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Missing Wix staff resource ID</Text>
                  <Text opacity={0.9}>
                    Set <b>NEXT_PUBLIC_WIX_STAFF_JEN_RESOURCE_ID</b> so this page shows Jen’s diary only.
                  </Text>
                </Box>
              </Alert>
            ) : (
              <Box
                border="1px solid rgba(255,0,127,0.35)"
                borderRadius="xl"
                p={{ base: 4, md: 6 }}
                boxShadow="0 0 0 1px rgba(0,212,255,0.25) inset, 0 0 22px rgba(255,0,127,0.35), 0 0 28px rgba(0,212,255,0.25)"
                bg="rgba(0,0,0,0.35)"
                backdropFilter="blur(8px)"
              >
                <WixArtistBookingWidget
                  title="Book with Jen"
                  artistName="Jen"
                  staffResourceId={JEN_STAFF_RESOURCE_ID}
                  hourlyRateGbp={JEN_HOURLY_RATE_GBP}
                  maxMonthsAhead={2}
                  debug={true}
                  onSelectEntry={({ serviceId, staffResourceId, artistName, entry }) => {
                    const payload = {
                      serviceId,
                      staffResourceId,
                      artistName,
                      hourlyRateGbp: JEN_HOURLY_RATE_GBP,
                      entry,
                    };
                    sessionStorage.setItem("HTS_WIX_CHECKOUT_PAYLOAD", JSON.stringify(payload));
                    router.push("/checkout");
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Socials */}
          <MotionBox {...motionProps} mb={4} as="section">
            <Text
              as="h2"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="white"
              textAlign="center"
              mb={8}
              textShadow="0 0 8px #ff007f, 0 0 12px #00d4ff"
            >
              Connect with Jen
            </Text>
            <HStack spacing={6} justify="center">
              <ChakraLink
                href="https://www.facebook.com/profile.php?id=61575953590191"
                isExternal
                aria-label="Jen's Facebook"
                _hover={{ transform: "scale(1.1)", color: "#ff007f" }}
                transition="all 0.3s ease"
              >
                <FaFacebook size={40} color="#00d4ff" />
              </ChakraLink>
              <ChakraLink
                href="https://www.instagram.com/theplanetthieftattoo/"
                isExternal
                aria-label="Jen's Instagram"
                _hover={{ transform: "scale(1.1)", color: "#ff007f" }}
                transition="all 0.3s ease"
              >
                <FaInstagram size={40} color="#ff007f" />
              </ChakraLink>
            </HStack>
          </MotionBox>
        </Box>
      </Box>
    </>
  );
};

export default JenPage;
