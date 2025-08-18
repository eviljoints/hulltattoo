// ./src/pages/jen.tsx

import React from "react";
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
} from "@chakra-ui/react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import MotionBox from "../components/MotionBox";
import Image from "next/image";
import Head from "next/head";
import styles from "./artists/MikePage.module.css"; // keep same background class for visual parity
import TextCard from "~/components/TextCard";

// --- Jen gallery (feel free to rename files to match your real assets) ---
const gallery = {
  neoTraditionalColour: {
    description:
      "Jen is developing her craft in full-colour Neo Traditional — bold lines, rich palettes, and illustrative forms. She’s building a portfolio with vibrant pieces and is available for small to medium designs while she trains.",
    images: [
      // Put your real image filenames under /public/images/jen/
      "jen1.webp",
      "jen2.webp",
      "jen3.webp",
      "jen4.webp",
      "jen5.webp",
      "jen6.webp",
    ],
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
        <meta property="og:image" content="/images/jen.webp" />
        <meta property="og:url" content="https://www.hulltattoostudio.com/jen" />
        <meta property="og:type" content="profile" />
        {/* Canonical + hreflang */}
        <link rel="canonical" href="https://www.hulltattoostudio.com/jen" />
        <link rel="alternate" hrefLang="en-gb" href="https://www.hulltattoostudio.com/jen" />
        <link rel="alternate" hrefLang="x-default" href="https://www.hulltattoostudio.com/jen" />
        {/* Perf: preload hero image if you have a dedicated portrait */}
        <link rel="preload" href="/images/jen.webp" as="image" />
        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
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
        {/* Optional neon diagonal lines like Harley page */}
        <Box className={styles.backgroundLines} />

        {/* Main Content Container (glassy neon) */}
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
                alt="Portrait of Jen"
                width={220}
                height={220}
                quality={80}
                sizes="220px"
                style={{
                  borderRadius: "50%",
                  boxShadow: "0 0 12px #ff007f, 0 0 20px #00d4ff",
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
                  <Grid
                    templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
                    gap={6}
                  >
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
                            src={`/images/jen/${img}`}
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
