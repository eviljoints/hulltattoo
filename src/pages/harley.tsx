// ./src/pages/harley.tsx

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
import styles from "./artists/MikePage.module.css";
import TextCard from "~/components/TextCard";

// Define the gallery for Harley
const gallery = {
  apprenticeTattoos: {
    description: `Harley is our latest apprentice showing great promise especially in the dotwork and pointillism area. Pop by and say hi to our newest team member`,
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
const structuredData = {
  "@context": "http://schema.org",
  "@type": "Person",
  "name": "Harley",
  "jobTitle": "Apprentice Tattoo Artist",
  "worksFor": {
    "@type": "Organization",
    "name": "Hull Tattoo Studio",
    "url": "https://www.hulltattoostudio.com"
  },
  "image": "https://www.hulltattoostudio.com/images/harley.webp",
  "url": "https://www.hulltattoostudio.com/harley",
  "description": "Harley is an apprentice tattoo artist at Hull Tattoo Studio specializing in dotwork and pointillism. She is dedicated to learning and perfecting her craft while offering affordable tattoo services."
};

const HarleyPage: React.FC = () => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  const motionProps = isLargerThan768
    ? { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 } };

  return (
    <>
      <Head>
        <title>Harley - Apprentice Tattoo Artist | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="Meet Harley, our dedicated apprentice at Hull Tattoo Studio. Specializing in dotwork and pointillism, Harley offers affordable tattoos and is always improving her craft."
        />
        <meta
          name="keywords"
          content="Harley, Apprentice Tattoo Artist, Hull Tattoo Studio, Dotwork Tattoos, Pointillism Tattoos, Professional Tattoo Artist, Affordable Tattoos"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="Harley - Apprentice Tattoo Artist | Hull Tattoo Studio"
        />
        <meta
          property="og:description"
          content="Meet Harley, our dedicated apprentice at Hull Tattoo Studio. Specializing in dotwork and pointillism, Harley offers affordable tattoos and is always improving her craft."
        />
        <meta property="og:image" content="/images/harley.webp" />
        <meta property="og:url" content="https://www.hulltattoostudio.com/harley" />
        <meta property="og:type" content="profile" />
        <link rel="preload" href="/images/harley.webp" as="image" />
        <link
          rel="canonical"
          href="https://www.hulltattoostudio.com/harley"
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
        {/* Neon Diagonal Lines Background */}
        <Box className={styles.backgroundLines} />

        {/* Main Content Box */}
        <Box
          bgGradient="radial(rgba(54, 39, 255, 0.6), rgba(128, 0, 128, 0.6), rgba(0,0,0,0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
          zIndex="1"
        >
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
              Harley
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
                src="/images/harley.webp"
                alt="Portrait of Harley"
                width={200}
                height={200}
                quality={75}
                style={{
                  borderRadius: "50%",
                  boxShadow: "0 0 15px #ff007f, 0 0 25px #00d4ff",
                  border: "4px solid #ff007f",
                }}
              />
            </Box>

            <TextCard
              title="About Harley"
              subtitle="Harley is Hull Tattoo Studio's newest addition."
              description={`Harley is the latest addition to Hull Tattoo Studio, bringing a profound passion for art and a relentless drive to perfect her craft. With a keen eye for detail, Harley specializes in simplistic designs infused with a unique pointillism twist, creating tattoos that are both elegant and intricately detailed.

Despite her quiet demeanor, Harley is incredibly approachable and fosters a welcoming atmosphere for her clients. Her dedication is evident in the countless hours she spends honing her skills on fake skin, meticulously refining each stroke and shading technique. This rigorous practice not only showcases her commitment but also her patience and precision.

Harley's journey extends beyond practicing on fake skin; she courageously ventures into tattooing real clients, steadily building her confidence and expertise. Her willingness to embrace challenges and continuously learn makes her a valuable and inspiring member of the Hull Tattoo Studio team. Whether you're seeking a minimalist design or a detailed pointillism piece, Harley is eager to collaborate and bring your tattoo vision to life with grace and finesse.`}
              stripes={[
                { left: "10%", width: "20px", color: "#ff007f" },
                { left: "70%", width: "30px", color: "#00d4ff" },
              ]}
            />
          </MotionBox>

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
                            boxShadow: "0 0 15px #ff007f, 0 0 20px #00d4ff",
                          }}
                        >
                          <Image
                            src={`/images/harley/${img}`}
                            alt={`Apprentice tattoo ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
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
              Connect with Harley
            </Text>
            <HStack spacing={6} justify="center">
              <ChakraLink
                href="https://www.facebook.com/harley.bovill.79"
                isExternal
                aria-label="Harley's Facebook"
                _hover={{ transform: "scale(1.1)", color: "#ff007f" }}
                transition="all 0.3s ease"
              >
                <FaFacebook size={40} color="#00d4ff" />
              </ChakraLink>
              <ChakraLink
                href="https://www.instagram.com/harleybovilltattoos/"
                isExternal
                aria-label="Harley's Instagram"
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

export default HarleyPage;