// ./src/components/FindUS.tsx
import React from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

const FindUs: React.FC = () => {
  return (
    <Box
      position="relative"
      id="find-us"                           /* SEO anchor preserved */
      p={{ base: 6, md: 10 }}
      borderRadius="xl"
      bg="rgba(10, 12, 24, 0.65)"           /* glassy neon panel */
      backdropFilter="blur(10px)"
      border="1px solid rgba(255,0,127,0.35)"
      boxShadow="0 0 0 1px rgba(0,212,255,0.25) inset,
                 0 0 22px rgba(255,0,127,0.35),
                 0 0 28px rgba(0,212,255,0.25)"
      color="white"
      overflow="hidden"
      transition="transform .25s ease, box-shadow .25s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow:
          "0 0 0 1px rgba(0,212,255,0.35) inset, 0 0 28px rgba(255,0,127,0.45), 0 0 36px rgba(0,212,255,0.35)",
      }}
    >
      {/* subtle scanlines (visual only) */}
      <Box
        aria-hidden="true"
        position="absolute"
        inset={0}
        pointerEvents="none"
        opacity={0.22}
        background="repeating-linear-gradient(
          180deg,
          rgba(255,255,255,0) 0px,
          rgba(255,255,255,0) 2px,
          rgba(255,255,255,0.05) 3px,
          rgba(255,255,255,0.05) 4px
        )"
      />

      <VStack spacing={6} align="center" textAlign="center" position="relative" zIndex={1}>
        {/* Section Title */}
        <Text
          as="h2"
          fontFamily="'VanillaWhale', sans-serif"
          fontSize={{ base: "2.25rem", md: "3rem" }}
          letterSpacing="0.06em"
          textTransform="uppercase"
          textShadow="
            0 0 4px #ffffff,
            0 0 10px #ff007f,
            0 0 18px #ff007f,
            0 0 28px #00d4ff,
            0 0 42px rgba(0,212,255,.9)
          "
        >
          Find Us
        </Text>

        {/* Address */}
        <Text as="address" fontSize={{ base: "md", md: "lg" }} lineHeight="1.6">
          Hull Tattoo Studio <br />
          255 Hedon Road, <br />
          Hull, HU9 1NQ, UK <br />
          <a href="tel:+447940080790">Tel. 07940080790</a><br />
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=255%20Hedon%20Road%20Hull%20HU9%201NQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Directions
          </a>
        </Text>

        {/* Responsive Google Map (16:9) */}
        <Box
          position="relative"
          width="100%"
          maxW="1000px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="0 0 12px #ff007f, 0 0 20px #00d4ff"
          _before={{
            content: '""',
            display: "block",
            paddingBottom: "56.25%",        /* 16:9 aspect ratio */
          }}
        >
          <Box
            as="iframe"
            title="Hull Tattoo Studio Location"
            src="https://maps.google.com/maps?q=255%20Hedon%20Road%20Hull%20HU9%201NQ&t=&z=15&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
            allowFullScreen
            border="0"
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            sx={{ filter: "saturate(1.05) contrast(1.05)" }}
          />
        </Box>
      </VStack>
    </Box>
  );
};

export default FindUs;
