import React, { useState } from "react";
import { Box, VStack, Text, Heading, SimpleGrid } from "@chakra-ui/react";
import MotionSection from "../components/MotionSection";
import Head from "next/head";
import styles from "./artists/MikePage.module.css";

const RafflePage: React.FC = () => {
  // In a real scenario, you might fetch the ‘taken’ numbers from a database,
  // or handle payment logic for reserving a number. For now, this is just an example.
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  const handleNumberClick = (num: number) => {
    // Example toggle logic — can be replaced with real payment/checkout flow.
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers((prev) => prev.filter((n) => n !== num));
    } else {
      setSelectedNumbers((prev) => [...prev, num]);
    }
  };

  return (
    <>
      <Head>
        <title>Christmas Raffle | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="Join our exclusive Christmas raffle! There are 40 numbers available at £10 each. Pick yours now."
        />
        <meta
          name="keywords"
          content="Christmas Raffle, Tattoo Raffle, Hull Tattoo Studio, Cyberpunk Raffle"
        />
        <meta property="og:title" content="Christmas Raffle | Hull Tattoo Studio" />
        <meta
          property="og:description"
          content="Grab your chance to win big in our neon-inspired Christmas Raffle! £10 per number, only 40 spots available."
        />
        <meta property="og:image" content="/images/og-image.png" />
        <meta property="og:url" content="https://www.hulltattoostudio.com/raffle" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:site_name" content="Hull Tattoo Studio" />
        <link rel="canonical" href="https://www.hulltattoostudio.com/raffle" />
      </Head>

      <Box
        as="main"
        position="relative"
        bg="transparent"
        color="white"
        w="100%"
        p={8}
        px={{ base: 4, md: 8 }}
        minH="100vh"
        overflowX="hidden"
        boxShadow="0 0 20px #ff007f, 0 0 30px #00d4ff"
      >
        {/* Reuse the same background lines from MikePage.module.css */}
        <Box className={styles.backgroundLines} />

        <Box
          bgGradient="radial(rgba(54,39,255,0.6), rgba(128,0,128,0.6), rgba(0,0,0,0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
          zIndex="1"
        >
          {/* Title / Intro */}
          <MotionSection
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            mb={16}
          >
            <Heading
              as="h1"
              size="2xl"
              color="white"
              textAlign="center"
              mb={4}
              textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
            >
              Christmas Raffle
            </Heading>
            <Text
              fontSize="xl"
              textAlign="center"
              mb={8}
              maxW="600px"
              mx="auto"
              lineHeight="1.6"
            >
              Each number costs <strong>£10</strong>. Numbers are only held once
              payment is made. The draw will be held once all 40 numbers are
              taken. Good luck!
            </Text>
          </MotionSection>

          {/* Raffle Numbers */}
          <MotionSection
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <SimpleGrid
              columns={{ base: 4, md: 8 }}
              spacing={4}
              maxW="800px"
              mx="auto"
            >
              {Array.from({ length: 40 }, (_, i) => i + 1).map((num) => (
                <Box
                  key={num}
                  cursor="pointer"
                  textAlign="center"
                  bg="rgba(0, 0, 0, 0.5)"
                  p={4}
                  borderRadius="md"
                  boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
                  transition="all 0.2s"
                  _hover={{ transform: "scale(1.05)" }}
                  onClick={() => handleNumberClick(num)}
                  border={
                    selectedNumbers.includes(num)
                      ? "2px solid #00d4ff"
                      : "2px solid transparent"
                  }
                >
                  <Text
                    fontWeight="bold"
                    color="white"
                    fontSize="lg"
                    textShadow="0 0 5px #ff007f"
                  >
                    #{num}
                  </Text>
                  {selectedNumbers.includes(num) && (
                    <Text fontSize="sm" color="#00d4ff" mt={1}>
                      Reserved
                    </Text>
                  )}
                </Box>
              ))}
            </SimpleGrid>
          </MotionSection>
        </Box>
      </Box>
    </>
  );
};

export default RafflePage;
