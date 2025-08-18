// src/pages/mike.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Text,
  Tabs,
  TabList,
  TabPanels, // ← fixed typo
  Tab,
  TabPanel,
  Grid,
  Link as ChakraLink,
  useMediaQuery,
  AspectRatio,
  HStack,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
} from "@chakra-ui/react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import dynamic from "next/dynamic";
import Image from "next/image";
import Head from "next/head";
import Script from "next/script";
import styles from "./artists/MikePage.module.css";

// Dynamically load non-critical components to reduce initial bundle size
const MotionBox = dynamic(() => import("../components/MotionBox"), { ssr: true });
const AcuityEmbed = dynamic(() => import("../components/AcuityEmbed"), { ssr: false });
const TextCard = dynamic(() => import("../components/TextCard"), { ssr: true });

// Define the galleries (unchanged)
const galleries = {
  realism: { /* ...as provided... */ 
    description: `Realism tattooing is an art form that captures lifelike images with precise detail and shading.
      Mike specializes in bringing portraits, landscapes, and objects to life on skin, creating tattoos that
      are almost indistinguishable from photographs.`,
    images: ["realism1.webp","realism2.webp","realism3.webp","realism4.webp","realism5.webp","realism6.webp"],
  },
  bespokeRealism: { 
    description: `Bespoke realism combines the precision of realism with personalized elements to create unique tattoos.
      Mike works closely with clients to incorporate individual stories and symbolism into hyper-realistic designs.`,
    images: ["bespoke1.webp","bespoke2.webp","bespoke3.webp","bespoke4.webp","bespoke5.webp","bespoke6.webp"],
  },
  neotrad: { 
    description: `Neotraditional tattoos combine bold lines with rich color palettes, blending traditional tattoo aesthetics
      with modern artistic elements. Mike's neotrad work is known for its vibrant colors and detailed designs, breathing
      new life into classic motifs.`,
    images: ["neotrad1.webp","neotrad2.webp","neotrad3.webp","neotrad4.webp","neotrad5.webp","neotrad6.webp"],
  },
  coverUp: { 
    description: `Cover-up tattoos are designed to transform and conceal existing tattoos with new designs.
      Mike specializes in creatively reimagining unwanted tattoos, turning them into stunning new pieces that clients can proudly display.`,
    images: ["coverup1.webp","coverup2.webp","coverup3.webp","coverup4.webp","coverup5.webp","coverup6.webp"],
  },
};

const MikePage: React.FC = () => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  // Disclaimer state and checkbox
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  // Ref for Acuity Scheduling section
  const acuityRef = useRef<HTMLDivElement>(null);

  // JSON-LD Structured Data (kept + expanded below in <Head>)
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Mike (Eggtattooer)",
      "jobTitle": "Tattoo Artist",
      "worksFor": { "@type": "Organization", "name": "Hull Tattoo Studio", "url": "https://www.hulltattoostudio.com" },
      "image": "https://www.hulltattoostudio.com/images/mike.webp",
      "url": "https://www.hulltattoostudio.com/mike",
      "description": "Mike is a friendly, down-to-earth tattoo artist at Hull Tattoo Studio with over 10 years of experience. He specializes in realism, bespoke realism, neotrad, and cover-up tattoos.",
      "sameAs": ["https://facebook.com/Hulltattoostudio", "https://instagram.com/egg_tattooer"]
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Hull Tattoo Studio",
      "description": "Hull Tattoo Studio offers professional tattoo services including tattoo coverups and tattoo apprenticeships in Hull. Visit us for custom tattoos and expert advice.",
      "image": "https://www.hulltattoostudio.com/images/og-image.webp",
      "url": "https://www.hulltattoostudio.com",
      "address": { "@type": "PostalAddress", "streetAddress": "255 Hedon", "addressLocality": "Hull", "postalCode": "HU9 1NQ", "addressCountry": "GB" },
      "telephone": "07940080790",
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:30", "closes": "17:00" },
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday","Sunday"], "opens": "11:30", "closes": "19:00" }
      ]
    },
    {
      "@context": "https://schema.org", "@type": "Service",
      "serviceType": "Tattoo Coverup",
      "provider": { "@type": "Organization", "name": "Hull Tattoo Studio", "url": "https://www.hulltattoostudio.com" },
      "description": "Expert tattoo coverup services that transform old or unwanted tattoos into stunning new designs at Hull Tattoo Studio."
    },
    {
      "@context": "https://schema.org", "@type": "Service",
      "serviceType": "Tattoo Apprenticeship",
      "provider": { "@type": "Organization", "name": "Hull Tattoo Studio", "url": "https://www.hulltattoostudio.com" },
      "description": "Comprehensive tattoo apprenticeship programs in Hull for aspiring tattoo artists, offered by Hull Tattoo Studio."
    }
  ];

  // IntersectionObserver to show disclaimer when Acuity section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !disclaimerAccepted) {
            setShowDisclaimerModal(true);
          }
        });
      },
      { threshold: 0.5 }
    );
    if (acuityRef.current) observer.observe(acuityRef.current);
    return () => { if (acuityRef.current) observer.unobserve(acuityRef.current); };
  }, [disclaimerAccepted]);

  const PAGE_URL = "https://www.hulltattoostudio.com/mike";
  const OG_IMAGE = "https://www.hulltattoostudio.com/images/mike.webp";

  return (
    <>
      {/* Head Metadata */}
      <Head>
        <title>Mike (Eggtattooer) | Tattoo Artist Hull | Realism, Bespoke, Neotrad & Cover-Ups</title>
        <meta
          name="description"
          content="Meet Mike (Eggtattooer), professional tattoo artist in Hull at Hull Tattoo Studio. Specialising in realism, bespoke realism, neotrad & expert cover-ups. Book online."
        />
        <meta
          name="keywords"
          content="tattoo artist hull, hull tattoo studio, mike eggtattooer, realism tattoos hull, bespoke realism hull, neotrad tattoos hull, cover up tattoo hull, tattoo apprenticeship hull, tattoo shops near me hull"
        />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href={PAGE_URL} />

        {/* Open Graph */}
        <meta property="og:type" content="profile" />
        <meta property="og:title" content="Mike (Eggtattooer) | Tattoo Artist Hull" />
        <meta property="og:description" content="Realism, bespoke realism, neotrad & cover-ups at Hull Tattoo Studio." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:site_name" content="Hull Tattoo Studio" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mike (Eggtattooer) | Tattoo Artist Hull" />
        <meta name="twitter:description" content="Realism, bespoke realism, neotrad & cover-ups at Hull Tattoo Studio." />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* Perf Hints */}
        <link rel="preconnect" href="https://app.acuityscheduling.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://embed.acuityscheduling.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/images/mike.webp" fetchPriority="high" />

        {/* Extra JSON-LD specific to this profile page */}
        <script
          type="application/ld+json"
          // ProfilePage container helps Google understand person profile
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              "name": "Mike (Eggtattooer) — Tattoo Artist in Hull",
              "about": { "@type": "Person", "name": "Mike (Eggtattooer)" },
              "url": PAGE_URL,
              "mainEntity": { "@type": "Person", "name": "Mike (Eggtattooer)", "url": PAGE_URL }
            })
          }}
        />
      </Head>

      {/* Original structured data (Person + LocalBusiness + Services) */}
      <Script id="mike-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      {/* Global neon & a11y polish (pure CSS; no component API changes) */}
      <style jsx global>{`
        :root {
          --neon-pink: #ff1e90;
          --neon-blue: #00e5ff;
          --neon-purple: #8a2be2;
          --panel: #0b0f17;
          --glass: rgba(255,255,255,0.06);
          --glass-border: rgba(255,255,255,0.14);
          --cyan-ghost: rgba(0,229,255,0.28);
          --pink-ghost: rgba(255,30,144,0.28);
        }
        body {
          background:
            radial-gradient(1200px 800px at 10% -10%, rgba(255, 30, 144, 0.22), transparent 60%),
            radial-gradient(1000px 700px at 110% 20%, rgba(0, 229, 255, 0.20), transparent 60%),
            linear-gradient(180deg, #05050a 0%, #0b0f17 70%, #05050a 100%) !important;
          color: #e9f1ff;
        }
        /* scanline + grid */
        body::before, body::after {
          content: "";
          position: fixed;
          inset: 0; pointer-events: none; z-index: -1;
        }
        body::before {
          background:
            linear-gradient(transparent 31px, rgba(255,255,255,0.035) 32px) 0 0 / 100% 32px,
            linear-gradient(90deg, transparent 31px, rgba(255,255,255,0.035) 32px) 0 0 / 32px 100%;
          opacity: 0.5; animation: gridScroll 18s linear infinite;
        }
        body::after {
          background: repeating-linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0) 2px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 4px);
          mix-blend-mode: soft-light; opacity: 0.22; animation: scan 8s linear infinite;
        }
        @keyframes gridScroll { to { transform: translateY(-32px); } }
        @keyframes scan { 0% { transform: translateY(-10%);} 100% { transform: translateY(10%);} }
        @media (prefers-reduced-motion: reduce) { body::before, body::after { animation: none; } }
        /* focus ring */
        :focus-visible { outline: 3px solid rgba(0, 229, 255, 0.6); outline-offset: 2px; }
      `}</style>

      {/* Page Content */}
      <Box position="relative" bg="transparent" color="white" w="100%" p={8} px={{ base: 4, md: 8 }} minH="100vh">
        {/* Neon Diagonal Lines Background */}
        <Box className={styles.backgroundLines} />

        {/* Main Container with Radial Gradient */}
        <Box
          bgGradient="radial(rgba(54, 39, 255, 0.6), rgba(128, 0, 128, 0.6), rgba(0,0,0,0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
          zIndex="1"
        >
          {/* Mike’s Profile Section */}
          <MotionBox initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} mb={16} as="section">
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
              description={`Meet Mike, your down-to-earth, creative tattoo artist who’s been perfecting his craft for over a decade. Sponsored by Ink Drop Shop, Mike specializes in everything from jaw-dropping realism and bespoke designs to bold neotraditional pieces and seamless cover-ups. With a keen eye for detail and a talent for bringing your vision to life, he’s here to ensure you leave with a work of art that's as unique as you are. Friendly, fun, and always up for a challenge—Mike’s got you covered, literally!`}
              stripes={[
                { left: "10%", width: "50px", color: "#ff007f" },
                { left: "70%", width: "30px", color: "#00d4ff" },
              ]}
            />
          </MotionBox>

          {/* Tattoo Galleries */}
          <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} mb={16} as="section">
            <Tabs variant="soft-rounded" colorScheme="pink">
              <TabList justifyContent="center" mb={8}>
                {Object.keys(galleries).map((key) => (
                  <Tab
                    key={key}
                    _selected={{ bg: "#ff007f", color: "white" }}
                    fontWeight="bold"
                    fontSize={{ base: "md", md: "lg" }}
                    _focusVisible={{ boxShadow: "0 0 0 3px rgba(255,0,127,0.6)" }}
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
                      <Text fontSize={{ base: "lg", md: "xl" }} textAlign="center" fontWeight="medium" lineHeight="1.8" maxW="800px">
                        {description}
                      </Text>
                    </VStack>
                    <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={6}>
                      {images.map((img, index) => (
                        <AspectRatio ratio={1} key={index}>
                          <MotionBox
                            position="relative"
                            borderRadius="md"
                            overflow="hidden"
                            boxShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            _hover={{ boxShadow: "0 0 15px #ff007f, 0 0 20px #00d4ff" }}
                          >
                            <Image
                              src={`/images/mike/${img}`}
                              alt={`${key.replace(/([A-Z])/g, " $1").trim()} tattoo ${index + 1} by Mike in Hull`}
                              layout="fill"
                              sizes="(max-width: 768px) 50vw, 33vw"
                              decoding="async"
                              style={{ objectFit: "cover" }}
                              loading="lazy"
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

          {/* Acuity Scheduling Embed with Disclaimer */}
          <Box ref={acuityRef} mb={16} as="section">
            {disclaimerAccepted ? (
              <AcuityEmbed link="https://app.acuityscheduling.com/schedule.php?owner=34239595&calendarID=11220578" />
            ) : (
              <Box p={4} textAlign="center">
                <Text fontSize="lg" fontWeight="medium" mb={2}>
                  Please accept the disclaimer to access scheduling.
                </Text>
              </Box>
            )}
          </Box>

          {/* Social Media Links */}
          <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }} mb={16} as="section">
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
                _focusVisible={{ boxShadow: "0 0 0 3px rgba(0,212,255,0.6)" }}
              >
                <FaFacebook size={40} color="#00d4ff" />
              </ChakraLink>
              <ChakraLink
                href="https://instagram.com/egg_tattooer"
                isExternal
                aria-label="Mike's Instagram Profile"
                _hover={{ transform: "scale(1.1)", color: "#ff007f" }}
                transition="all 0.3s ease"
                _focusVisible={{ boxShadow: "0 0 0 3px rgba(255,0,127,0.6)" }}
              >
                <FaInstagram size={40} color="#ff007f" />
              </ChakraLink>
            </HStack>
          </MotionBox>
        </Box>
      </Box>

      {/* Disclaimer Modal (unchanged logic) */}
      <Modal
        isOpen={showDisclaimerModal}
        onClose={() => {}}
        isCentered
        closeOnOverlayClick={false}
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent bg="black" color="white" border="2px solid #ff007f" boxShadow="0 0 20px #ff007f, 0 0 30px #00d4ff">
          <ModalHeader textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff" fontFamily="'Ryzes', sans-serif">
            Booking Disclaimer
          </ModalHeader>
          <ModalBody>
            <Text mb={4}>
              Please note: You must contact the artist prior to booking to ensure that you are booking the correct amount of time. If you book a time slot that is too short, you may be charged extra on the day.
            </Text>
            <Checkbox isChecked={checkboxChecked} onChange={(e) => setCheckboxChecked(e.target.checked)}>
              I have contacted the artist prior to booking.
            </Checkbox>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="pink"
              onClick={() => {
                if (checkboxChecked) {
                  setDisclaimerAccepted(true);
                  setShowDisclaimerModal(false);
                }
              }}
              disabled={!checkboxChecked}
            >
              Continue to Booking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// SSG for performance & SEO (enable ISR without changing API)
export function getStaticProps() {
  return {
    props: {},
    revalidate: 3600, // ISR: refresh every hour
  };
}

export default MikePage;
