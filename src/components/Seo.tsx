import React from "react";
import { Box, Text, VStack, Heading } from "@chakra-ui/react";
import Head from "next/head";

const SEOOptimizedContent = () => {
  return (
    <>
      

      <Box
        as="section"
        position="relative"
        overflow="hidden"
        p={{ base: 6, md: 10 }}
        borderRadius="xl"
        bg="rgba(10, 10, 20, 0.75)"
        boxShadow="0 0 25px #ff1e90, 0 0 40px #00e5ff"
        textAlign="center"
        _hover={{
          transform: "scale(1.01)",
          boxShadow: "0 0 35px #ff1e90, 0 0 60px #00e5ff",
        }}
        transition="all 0.3s ease"
      >
        {/* Neon scanline overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          background="repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.04) 0px,
            rgba(255,255,255,0.04) 1px,
            transparent 2px,
            transparent 4px
          )"
          opacity="0.2"
          pointerEvents="none"
          animation="scan 8s linear infinite"
        />

        <VStack spacing={6} position="relative" zIndex={1}>
          <Heading
            as="h1"
            fontSize={{ base: "2.5rem", md: "3.5rem" }}
            fontFamily="'VanillaWhale', sans-serif"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color="white"
            textShadow="
              0 0 5px #fff,
              0 0 15px #ff1e90,
              0 0 25px #00e5ff,
              0 0 45px rgba(0,229,255,0.8)
            "
          >
            Welcome to Hull Tattoo Studio
          </Heading>

          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="white"
            lineHeight="1.8"
            textShadow="0 0 5px #ff1e90, 0 0 10px #00e5ff"
          >
            Searching for the best <strong>tattoo shops in Hull</strong>? Our experienced tattooists bring your ideas to life with stunning custom ink. Whether you&apos;re a first-timer or a seasoned collector, we ensure every piece is a masterpiece.
          </Text>

          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="white"
            lineHeight="1.8"
            textShadow="0 0 4px #00e5ff, 0 0 10px #ff1e90"
          >
            Interested in a <strong>tattoo apprenticeship in Hull</strong>? Join our professional team and start your journey into the world of tattoo artistry. We provide hands-on training in a real studio environment.
          </Text>

          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="white"
            lineHeight="1.8"
            textShadow="0 0 4px #00e5ff, 0 0 10px #ff1e90"
          >
            Looking for <strong>tattoo shops near you</strong>? Our Hull-based studio is a top-rated destination, known for quality ink and exceptional service.
          </Text>

          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="white"
            lineHeight="1.8"
            textShadow="0 0 5px #ff1e90, 0 0 10px #00e5ff"
          >
            Visit <strong>Hull Tattoo Studio</strong> today and experience the best tattooing in the area. Get inked by our expert artists in a professional and welcoming atmosphere.
          </Text>
        </VStack>
      </Box>
    </>
  );
};

export default SEOOptimizedContent;
