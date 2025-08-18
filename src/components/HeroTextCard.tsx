import React from "react";
import { Box, Heading, Text, Link, Button } from "@chakra-ui/react";

interface HeroTextCardProps {
  title: string;
  align?: "left" | "center" | "right";
}

const HeroTextCard: React.FC<HeroTextCardProps> = ({ title, align = "center" }) => {
  return (
    <Box
      maxW="900px"
      mx="auto"
      py={{ base: 8, md: 12 }}
      px={{ base: 6, md: 10 }}
      borderRadius="2xl"
      bg="rgba(10, 12, 24, 0.6)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255,0,127,0.35)"
      boxShadow="0 0 15px rgba(255,0,127,0.5), 0 0 25px rgba(0,212,255,0.4)"
    >
      <Heading
        as="h1"
        fontFamily="'VanillaWhale', sans-serif"
        fontSize={{ base: "3xl", md: "5xl" }}
        fontWeight="bold"
        textAlign={align}
        mb={5}
        color="white"
        sx={{
          textShadow:
            "0 0 4px #fff, 0 0 8px #ff007f, 0 0 14px #ff007f, 0 0 20px #00d4ff, 0 0 32px rgba(0,212,255,.9)",
        }}
      >
        {title}
      </Heading>

      <Text
        fontSize={{ base: "md", md: "lg" }}
        color="rgba(230,230,230,0.9)"
        textAlign={align}
        lineHeight="1.7"
        mb={3}
      >
        Welcome to <strong>Hull Tattoo Studio</strong>, the leading tattoo parlour in Hull where creativity meets precision.
      </Text>
      <Text
        fontSize={{ base: "md", md: "lg" }}
        color="rgba(220,220,220,0.85)"
        textAlign={align}
        mb={3}
      >
        Our expert tattooists specialize in{" "}
        <strong>black and grey realism, blackwork, fine line tattoos, anime tattoos, and custom designs</strong>.
      </Text>
      <Text
        fontSize={{ base: "md", md: "lg" }}
        color="rgba(220,220,220,0.85)"
        textAlign={align}
      >
        Looking for the <strong>best tattoo shops in Hull</strong>? Look no further.
      </Text>

      <Box textAlign="center" mt={6}>
        <Link
          href="/blog/Apprenticeship"
          color="#00d4ff"
          fontWeight="bold"
          _hover={{
            color: "#ff007f",
            textShadow: "0 0 6px #ff007f, 0 0 12px #00d4ff",
          }}
        >
          Learn about our tattoo apprenticeships
        </Link>
      </Box>

      <Box textAlign="center" mt={6}>
        <Button
          as="a"
          href="/mike"
          borderRadius="xl"
          bg="linear-gradient(90deg, #ff007f, #00d4ff)"
          color="white"
          fontWeight="bold"
          px={8}
          py={4}
          boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
          _hover={{
            bg: "linear-gradient(90deg, #00d4ff, #ff007f)",
            boxShadow: "0 0 15px #00d4ff, 0 0 25px #ff007f",
          }}
          transition="all 0.2s ease-in-out"
        >
          Book Your Consultation
        </Button>
      </Box>
    </Box>
  );
};

export default HeroTextCard;
