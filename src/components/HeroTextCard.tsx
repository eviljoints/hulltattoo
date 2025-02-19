import React from "react";
import { Box, Heading, Text, Link, Button } from "@chakra-ui/react";

interface HeroTextCardProps {
  title: string;
  align?: "left" | "center" | "right";
}

const HeroTextCard: React.FC<HeroTextCardProps> = ({ title, align = "center" }) => {
  return (
    <Box
      maxW="800px"
      mx="auto"
      py={{ base: 6, md: 12 }}
      px={{ base: 4, md: 6 }}
      bg="rgba(0,0,0,0.7)"
      borderRadius="lg"
    >
      <Heading
        as="h1"
        fontSize={{ base: "2xl", md: "4xl" }}
        fontWeight="bold"
        color="white"
        textAlign={align}
        mb={3}
      >
        {title}
      </Heading>

      <Text fontSize={{ base: "md", md: "lg" }} color="gray.200" textAlign={align} lineHeight="1.5">
        Welcome to <strong>Hull Tattoo Studio</strong>, the leading tattoo parlour in Hull where creativity meets precision.
      </Text>
      <Text fontSize={{ base: "md", md: "lg" }} color="gray.200" textAlign={align}>
        Our expert tattooists specialize in <strong>black and grey realism, blackwork, fine line tattoos, anime tattoos, and custom designs</strong>.
      </Text>
      <Text fontSize={{ base: "md", md: "lg" }} color="gray.200" textAlign={align}>
        Looking for the <strong>best tattoo shops in Hull</strong>? Look no further.
      </Text>

      <Box textAlign="center" mt={4}>
  <Link href="/blog/Apprenticeship" color="#00d4ff" fontWeight="bold">
    Learn about our tattoo apprenticeships
  </Link>
</Box>

      <Box textAlign="center" mt={4}>
        <Button
          as="a"
          href="/mike"
          bg="#ff007f"
          color="white"
          _hover={{ bg: "#ff3399" }}
          fontWeight="bold"
          px={6}
          py={3}
        >
          Book Your Consultation
        </Button>
      </Box>
    </Box>
  );
};

export default HeroTextCard;
