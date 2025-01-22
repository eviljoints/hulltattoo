// ./src/pages/artists/mike.tsx

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
  Link as ChakraLink,
  useMediaQuery,
  AspectRatio,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import dynamic from "next/dynamic";
import Image from "next/image";
import Head from "next/head";
import Script from "next/script";
import styles from "./artists/MikePage.module.css";

// Dynamically load non-critical components to reduce initial bundle size
const MotionBox = dynamic(() => import("../components/MotionBox"), {
  ssr: true, // Enable SSR for critical content
});
const AcuityEmbed = dynamic(() => import("../components/AcuityEmbed"), {
  ssr: false, // Non-critical or interactive component
});
const TextCard = dynamic(() => import("../components/TextCard"), {
  ssr: true, // Enable SSR if it contains critical content
});

// Define the galleries
const galleries = {
  realism: {
    description: `Realism tattooing is an art form that captures lifelike images with precise detail and shading.
      Mike specializes in bringing portraits, landscapes, and objects to life on skin, creating tattoos that
      are almost indistinguishable from photographs.`,
    images: [
      "realism1.webp",
      "realism2.webp",
      "realism3.webp",
      "realism4.webp",
      "realism5.webp",
      "realism6.webp",
    ],
  },
  bespokeRealism: {
    description: `Bespoke realism combines the precision of realism with personalized elements to create unique tattoos.
      Mike works closely with clients to incorporate individual stories and symbolism into hyper-realistic designs.`,
    images: [
      "bespoke1.webp",
      "bespoke2.webp",
      "bespoke3.webp",
      "bespoke4.webp",
      "bespoke5.webp",
      "bespoke6.webp",
    ],
  },
  neotrad: {
    description: `Neotraditional tattoos combine bold lines with rich color palettes, blending traditional tattoo aesthetics
      with modern artistic elements. Mike's neotrad work is known for its vibrant colors and detailed designs, breathing
      new life into classic motifs.`,
    images: [
      "neotrad1.webp",
      "neotrad2.webp",
      "neotrad3.webp",
      "neotrad4.webp",
      "neotrad5.webp",
      "neotrad6.webp",
    ],
  },
  coverUp: {
    description: `Cover-up tattoos are designed to transform and conceal existing tattoos with new designs.
      Mike specializes in creatively reimagining unwanted tattoos, turning them into stunning new pieces that clients can proudly display.`,
    images: [
      "coverup1.webp",
      "coverup2.webp",
      "coverup3.webp",
      "coverup4.webp",
      "coverup5.webp",
      "coverup6.webp",
    ],
  },
};

const MikePage: React.FC = () => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  // JSON-LD structured data
  const structuredData = {
    "@context": "http://schema.org",
    "@type": "Person",
    name: "Mike (Eggtattooer)",
    jobTitle: "Tattoo Artist",
    worksFor: {
      "@type": "Organization",
      name: "Hull Tattoo Studio",
      url: "https://www.hulltattoostudio.com",
    },
    image: "https://www.hulltattoostudio.com/images/mike.webp",
    url: "https://www.hulltattoostudio.com/artists/mike",
    description:
      "Mike is a friendly, down-to-earth tattoo artist at Hull Tattoo Studio with over 10 years of experience. He specializes in realism, bespoke realism, neotrad, and cover-up tattoos.",
    sameAs: [
      "https://facebook.com/Hulltattoostudio",
      "https://instagram.com/egg_tattooer",
      // Add other social profiles if available
    ],
  };

  return (
    <>
      {/* 1. Head Metadata */}
      <Head>
        <title>
          Mike (Eggtattooer) - Professional Tattoo Artist in Hull | Hull Tattoo
          Studio
        </title>
        <meta
          name="description"
          content="Meet Mike (Eggtattooer), a friendly and approachable tattoo artist at Hull Tattoo Studio with over 10 years of experience. Specializing in realism, bespoke realism, neotrad, and cover-up tattoos, Mike creates one-of-a-kind artworks for every client."
        />
        <meta
          name="keywords"
          content="Mike, Eggtattooer, Tattoo Artist, Hull Tattoo Studio, Realism Tattoos, Bespoke Realism, Neotrad Tattoos, Cover-up Tattoos, Professional Tattoo Artist, Hull Tattoos"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph Meta */}
        <meta
          property="og:title"
          content="Mike (Eggtattooer) - Professional Tattoo Artist in Hull | Hull Tattoo Studio"
        />
        <meta
          property="og:description"
          content="Meet Mike, a friendly and talented tattoo artist at Hull Tattoo Studio with 10+ years of experience in realism, bespoke realism, neotrad, and cover-up tattoos."
        />
        <meta property="og:image" content="/images/mike.webp" />
        <meta
          property="og:url"
          content="https://www.hulltattoostudio.com/mike"
        />
        <meta property="og:type" content="profile" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:site_name" content="Hull Tattoo Studio" />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href="https://www.hulltattoostudio.com/mike"
        />
      </Head>

      {/* 2. Structured Data via Next.js <Script> */}
      <Script id="mike-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      {/* 3. Page Content */}
      <Box
        position="relative"
        bg="transparent"
        color="white"
        w="100%"
        p={8}
        px={{ base: 4, md: 8 }}
        minH="100vh"
      >
        {/* Neon Diagonal Lines Background */}
        <Box className={styles.backgroundLines} />

        {/* Main Container w/ Radial Gradient */}
        <Box
          bgGradient="radial(rgba(54, 39, 255, 0.6), rgba(128, 0, 128, 0.6), rgba(0,0,0,0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
          zIndex="1"
        >
          {/* Mike's Profile Section */}
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            mb={16}
            as="section"
          >
            <Text
              as="h1"
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="bold"
              color="white"
              textAlign="center"
              textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
              mb={4}
              fontFamily="heading"
            >
              Mike (Eggtattooer)
            </Text>
            <Text
              as="h2"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="medium"
              color="white"
              textAlign="center"
              textShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
              mb={8}
              fontFamily="body"
            >
              Professional Tattoo Artist in Hull
            </Text>

            <Box mb={8} textAlign="center">
              <Image
                src="/images/mike.webp"
                alt="Portrait of Mike, a professional tattoo artist at Hull Tattoo Studio"
                width={200}
                height={200}
                priority={true}
                style={{
                  borderRadius: "50%",
                  boxShadow: "0 0 15px #ff007f, 0 0 25px #00d4ff",
                  border: "4px solid #ff007f",
                }}
              />
            </Box>

            <TextCard
              title="About Mike"
              subtitle="Tattoo Artist with 10 Years of Experience"
              description={`Meet Mike, your down-to-earth, creative tattoo artist who’s been perfecting his craft for over a decade. Sponsored by Apollo Tattoo Aftercare, Mike specializes in everything from jaw-dropping realism and bespoke designs to bold neotraditional pieces and seamless cover-ups. With a keen eye for detail and a talent for bringing your vision to life, he’s here to ensure you leave with a work of art that's as unique as you are. Friendly, fun, and always up for a challenge—Mike’s got you covered, literally!`}
              stripes={[
                { left: "10%", width: "50px", color: "#ff007f" },
                { left: "70%", width: "30px", color: "#00d4ff" },
              ]}
            />
          </MotionBox>

          {/* Tattoo Galleries */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            mb={16}
            as="section"
          >
            <Tabs variant="soft-rounded" colorScheme="pink">
              <TabList justifyContent="center" mb={8}>
                {Object.keys(galleries).map((key) => (
                  <Tab
                    key={key}
                    _selected={{ bg: "#ff007f", color: "white" }}
                    fontWeight="bold"
                    fontSize={{ base: "md", md: "lg" }}
                  >
                    {(() => {
                      if (key === "bespokeRealism") return "Bespoke Realism";
                      if (key === "coverUp") return "Cover-up Tattoos";
                      return key.charAt(0).toUpperCase() + key.slice(1);
                    })()}
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {Object.entries(galleries).map(([key, { description, images }]) => (
                  <TabPanel key={key}>
                    <VStack spacing={4} mb={8}>
                      <Text
                        fontSize={{ base: "lg", md: "xl" }}
                        textAlign="center"
                        fontWeight="medium"
                        lineHeight="1.8"
                        maxW="800px"
                      >
                        {description}
                      </Text>
                    </VStack>
                    <Grid
                      templateColumns={{
                        base: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                      }}
                      gap={6}
                    >
                      {images.map((img, index) => (
                        <AspectRatio ratio={1} key={index}>
                          <MotionBox
                            position="relative"
                            borderRadius="md"
                            overflow="hidden"
                            boxShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            _hover={{
                              boxShadow:
                                "0 0 15px #ff007f, 0 0 20px #00d4ff",
                            }}
                          >
                            <Image
                              src={`/images/mike/${img}`}
                              alt={`${key} tattoo ${index + 1}`}
                              width={300}
                              height={300}
                              style={{ objectFit: "cover" }}
                              loading="lazy" // Enables lazy loading
                            />
                          </MotionBox>
                        </AspectRatio>
                      ))}
                    </Grid>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </MotionBox>

          {/* Acuity Scheduling Embed */}
          <AcuityEmbed link="https://app.acuityscheduling.com/schedule.php?owner=34239595&calendarID=11220578" />

          {/* Social Media Links */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            mb={16}
            as="section"
          >
            <Text
              as="h2"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="white"
              textAlign="center"
              mb={8}
              textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
              fontFamily="heading"
            >
              Connect with Mike
            </Text>
            <HStack spacing={6} justify="center">
              <ChakraLink
                href="https://facebook.com/Hulltattoostudio"
                isExternal
                aria-label="Mike's Facebook Profile"
                _hover={{ transform: "scale(1.1)", color: "#ff007f" }}
                transition="all 0.3s ease"
              >
                <FaFacebook size={40} color="#00d4ff" />
              </ChakraLink>
              <ChakraLink
                href="https://instagram.com/egg_tattooer"
                isExternal
                aria-label="Mike's Instagram Profile"
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

// 4. SSG for better performance & SEO
export function getStaticProps() {
  return {
    props: {},
  };
}

export default MikePage;
