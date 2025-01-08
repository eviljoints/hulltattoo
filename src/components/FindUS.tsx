// src\components\FindUS.tsx
import React from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

const FindUs: React.FC = () => {
  return (
    <Box
      position="relative"
      p={8}
      borderRadius="md"
      bg="rgba(0, 0, 0, 0.6)" // Semi-transparent background
      boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
      color="white"
    >
      <VStack spacing={6} align="center" textAlign="center">
        {/* Section Title */}
        <Text
          fontSize={{ base: "3xl", md: "4xl" }}
          fontWeight="bold"
          textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
        >
          Find Us
        </Text>

        {/* Address */}
        <Text
          fontSize={{ base: "md", md: "lg" }}
          lineHeight="1.6"
          textShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
        >
          Hull Tattoo Studio <br />
          652 Anlaby Road, <br />
          Hull, HU3 6UU, UK <br />
          Tel. 07940080790
        </Text>

        {/* Google Maps Embed */}
        <Box
          as="iframe"
          src="https://maps.google.com/maps?q=652%20Anlaby%20Road%20Hull%20HU3%206UU&t=&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="450px"
          border="0"
          borderRadius="md"
          loading="lazy"
          boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
          allowFullScreen
        />
      </VStack>
    </Box>
  );
};

export default FindUs;
