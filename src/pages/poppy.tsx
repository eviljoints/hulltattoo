import React, { useState, useRef, useEffect } from "react";
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
import styles from "./artists/MikePage.module.css"; // Reusing the neon background styles
import MotionBox from "../components/MotionBox";
import TextCard from "~/components/TextCard";

// Dynamically load AcuityEmbed to reduce bundle size
const AcuityEmbed = dynamic(() => import("../components/AcuityEmbed"), {
  ssr: false,
  loading: () => <p>Loading scheduler...</p>,
});

// Define Poppy’s gallery
const gallery = {
  apprenticeTattoos: {
    description: `Poppy is our dedicated apprentice, working mainly in black ink but branching out into color pieces. She is hardworking and always progressing her craft. Poppy works at an apprentice rate, making her work both exceptional and affordable.`,
    images: [
      "apprentice1.webp",
      "apprentice2.webp",
      "apprentice3.webp",
      "apprentice4.webp",
      "apprentice5.webp",
      "apprentice6.webp",
    ],
  },
};

// Structured data (JSON‑LD) for Poppy
const structuredData = {
  "@context": "http://schema.org",
  "@type": "Person",
  name: "Poppy",
  jobTitle: "Apprentice Tattoo Artist",
  worksFor: {
    "@type": "Organization",
    name: "Hull Tattoo Studio",
    url: "https://www.hulltattoostudio.com",
  },
  image: "https://www.hulltattoostudio.com/images/poppy.webp",
  url: "https://www.hulltattoostudio.com/poppy",
  description:
    "Poppy is an apprentice tattoo artist at Hull Tattoo Studio, specializing in black ink and exploring color pieces. She offers high-quality tattoos at an apprentice rate.",
};

const PoppyPage: React.FC = () => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  // Motion animation settings
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

  // Disclaimer state and checkbox for Poppy
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  // Ref for the Acuity Scheduling section
  const acuityRef = useRef<HTMLDivElement>(null);

  // Use IntersectionObserver to trigger the disclaimer when the scheduler comes into view
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
    if (acuityRef.current) {
      observer.observe(acuityRef.current);
    }
    return () => {
      if (acuityRef.current) {
        observer.unobserve(acuityRef.current);
      }
    };
  }, [disclaimerAccepted]);

  return (
    <>
      {/* Head & SEO Meta Tags */}
      <Head>
        <title>Poppy - Apprentice Tattoo Artist | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="Meet Poppy, our dedicated apprentice at Hull Tattoo Studio. She works mainly in black ink but is branching out into color pieces. Poppy is hardworking and always progressing her craft, offering her work at an apprentice rate."
        />
        <meta
          name="keywords"
          content="Poppy, Apprentice Tattoo Artist, Hull Tattoo Studio, Black Ink Tattoos, Color Tattoos, Professional Tattoo Artist, Affordable Tattoos"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Poppy - Apprentice Tattoo Artist | Hull Tattoo Studio"
        />
        <meta
          property="og:description"
          content="Meet Poppy, our dedicated apprentice at Hull Tattoo Studio. She works mainly in black ink but is branching out into color pieces."
        />
        <meta property="og:image" content="/images/poppy.webp" />
        <meta property="og:url" content="https://www.hulltattoostudio.com/poppy" />
        <meta property="og:type" content="profile" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://www.hulltattoostudio.com/poppy" />

        {/* Preload Poppy's portrait */}
        <link rel="preload" href="/images/poppy.webp" as="image" />
      </Head>

      {/* Structured Data */}
      <Script id="poppy-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      {/* Page Content */}
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
        {/* Neon Diagonal Lines Background */}
        <Box className={styles.backgroundLines} />

        {/* Main Container with Gradient */}
        <Box
          bgGradient="radial(rgba(54, 39, 255, 0.6), rgba(128, 0, 128, 0.6), rgba(0,0,0,0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
          zIndex="1"
        >
          {/* Poppy’s Intro Section */}
          <MotionBox {...motionProps} mb={16} as="section">
            <Text
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="bold"
              color="white"
              textAlign="center"
              textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
              mb={4}
              fontFamily="heading"
            >
              Poppy
            </Text>
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="medium"
              color="white"
              textAlign="center"
              textShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
              mb={8}
              fontFamily="body"
            >
              Apprentice Tattoo Artist
            </Text>

            <Box mb={8} textAlign="center">
              <Image
                src="/images/poppy.webp"
                alt="Portrait of Poppy"
                width={200}
                height={200}
                quality={75}
                style={{
                  borderRadius: "50%",
                  boxShadow: "0 0 15px #ff007f, 0 0 25px #00d4ff",
                  border: "4px solid #ff007f",
                }}
                priority
              />
            </Box>

            <TextCard
              title="About Poppy"
              subtitle="Poppy is Hull Tattoo Studio's quirky apprentice."
              description={`Poppy specializes in bold black ink but has been diving headfirst into the vibrant world of color tattoos. Known for her quirky personality and infectious energy, Poppy brings a fresh, creative approach to every piece she creates. Hardworking, passionate, and always honing her craft, she’s on a mission to become an exceptional tattoo artist.

As an apprentice, Poppy offers unique and affordable tattoos at an apprentice rate, making her the perfect choice for clients looking for high-quality work without breaking the bank. Whether it’s a custom design or a collaboration to bring your ideas to life, Poppy is excited to make your tattoo vision a reality!

Come say hi, share your ideas, and let Poppy’s enthusiasm and artistry shine through in your next tattoo.`}
              stripes={[
                { left: "10%", width: "20px", color: "#ff007f" },
                { left: "70%", width: "30px", color: "#00d4ff" },
              ]}
            />
          </MotionBox>

          {/* Apprentice Tattoos Section */}
          <MotionBox {...motionProps} mb={16} as="section">
            <Tabs variant="soft-rounded" colorScheme="pink">
              <TabList justifyContent="center" mb={8}>
                <Tab
                  _selected={{ bg: "#ff007f", color: "white" }}
                  fontWeight="bold"
                  fontSize={{ base: "md", md: "lg" }}
                >
                  Apprentice Tattoos
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} mb={8}>
                    <Text
                      fontSize={{ base: "lg", md: "xl" }}
                      textAlign="center"
                      fontWeight="medium"
                      lineHeight="1.8"
                      maxW="800px"
                    >
                      {gallery.apprenticeTattoos.description}
                    </Text>
                  </VStack>
                  <Grid
                    templateColumns={{
                      base: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                    }}
                    gap={6}
                  >
                    {gallery.apprenticeTattoos.images.map((img, index) => (
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
                            src={`/images/poppy/${img}`}
                            alt={`Apprentice tattoo ${index + 1}`}
                            layout="fill"
                            style={{ objectFit: "cover" }}
                            loading="lazy"
                          />
                        </MotionBox>
                      </AspectRatio>
                    ))}
                  </Grid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </MotionBox>

          {/* Acuity Scheduling Embed with Disclaimer */}
          <Box ref={acuityRef} mb={16} as="section">
            {disclaimerAccepted ? (
              <AcuityEmbed link="https://app.acuityscheduling.com/schedule.php?owner=34239595&calendarID=11234698" />
            ) : (
              <Box p={4} textAlign="center">
                <Text fontSize="lg" fontWeight="medium" mb={2}>
                  Please accept the disclaimer to access scheduling.
                </Text>
              </Box>
            )}
          </Box>

          {/* Social Media Links */}
          <MotionBox {...motionProps} mb={16} as="section">
            <Text
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="white"
              textAlign="center"
              mb={8}
              textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
              fontFamily="heading"
            >
              Connect with Poppy
            </Text>
            <HStack spacing={6} justify="center">
              <ChakraLink
                href="https://www.facebook.com/poppy.lee.7503"
                isExternal
                aria-label="Poppy's Facebook"
                _hover={{ transform: "scale(1.1)", color: "#ff007f" }}
                transition="all 0.3s ease"
              >
                <FaFacebook size={40} color="#00d4ff" />
              </ChakraLink>
              <ChakraLink
                href="https://www.instagram.com/macabre_tattooz/"
                isExternal
                aria-label="Poppy's Instagram"
                _hover={{ transform: "scale(1.1)", color: "#ff007f" }}
                transition="all 0.3s ease"
              >
                <FaInstagram size={40} color="#ff007f" />
              </ChakraLink>
            </HStack>
          </MotionBox>
        </Box>
      </Box>

      {/* Disclaimer Modal with Neon Cyberpunk Styling */}
      <Modal
        isOpen={showDisclaimerModal}
        onClose={() => {}}
        isCentered
        closeOnOverlayClick={false}
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent
          bg="black"
          color="white"
          border="2px solid #ff007f"
          boxShadow="0 0 20px #ff007f, 0 0 30px #00d4ff"
        >
          <ModalHeader
            textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
            fontFamily="'Ryzes', sans-serif"
          >
            Booking Disclaimer
          </ModalHeader>
          <ModalBody>
            <Text mb={4}>
              Please note: You must contact the artist prior to booking to ensure that you are booking the correct amount of time. If you book a time slot that is too short, you may be charged extra on the day.
            </Text>
            <Checkbox
              isChecked={checkboxChecked}
              onChange={(e) => setCheckboxChecked(e.target.checked)}
            >
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

// SSG for performance & SEO
export const getStaticProps = () => {
  return {
    props: {},
  };
};

export default PoppyPage;
