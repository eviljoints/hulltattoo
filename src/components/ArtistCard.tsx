// ./src/components/ArtistCard.tsx

import React from "react";
import { Box, Text, Image, Button } from "@chakra-ui/react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Link from "next/link";

interface Stripe {
  left: string;
  width: string;
  color: string;
}

interface ArtistCardProps {
  name: string;
  role: string;
  image: string;
  gallery: string;
  facebook?: string;
  instagram?: string;
  artsPage: string;
  stripes: Stripe[];
}

const ArtistCard: React.FC<ArtistCardProps> = ({
  name,
  role,
  image,
  gallery,
  facebook,
  instagram,
  artsPage,
  stripes,
}) => {
  

  return (
    <Box
      position="relative"
      zIndex="0"
      bg="rgba(0, 0, 0, 0.6)" // Semi-transparent background
      borderRadius="md"
      p={4}
      overflow="hidden"
      boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
      transition="transform 0.3s ease"
      _hover={{ transform: "scale(1.05)" }}
    >
      {/* Background Stripes */}
      {stripes.map((stripe, index) => (
        <Box
          key={index}
          position="absolute"
          top="-50%"
          left={stripe.left}
          width={stripe.width}
          height="200%"
          bg={stripe.color}
          opacity={0.5}
          transform="rotate(45deg)"
          zIndex={-1}
        />
      ))}

      {/* Content */}
      <Box position="relative" zIndex={1}>
        {/* Artist Profile Image */}
        <Image
          src={image}
          alt={name}
          borderRadius="full"
          width={150} // Explicit width
          height={150} // Explicit height
          objectFit="cover"
          mx="auto"
          mb={4}
        />

        {/* Artist Name */}
        <Text
          fontSize="xl"
          fontWeight="bold"
          textAlign="center"
          mb={2}
          textShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
        >
          {name}
        </Text>

        {/* Artist Role */}
        <Text fontSize="md" textAlign="center" mb={4}>
          {role}
        </Text>

        {/* Social Media Icons */}
        <Box display="flex" justifyContent="center" gap={4} mb={4}>
          {facebook && (
            <a href={facebook} target="_blank" rel="noopener noreferrer">
              <FaFacebook size={24} color="#00d4ff" />
            </a>
          )}
          {instagram && (
            <a href={instagram} target="_blank" rel="noopener noreferrer">
              <FaInstagram size={24} color="#ff007f" />
            </a>
          )}
        </Box>

        {/* Enlarging Image in Centered Border Box */}
        <Box
          position="relative"
          overflow="hidden"
          mb={4}
          borderRadius="md"
          border="2px solid #ff007f" // Added border
          width="50%"
          mx="auto" // Center horizontally
          _hover={{ img: { transform: "scale(1.3)" } }}
        >
          <Image
            src={gallery}
            alt={`${name}'s Work`}
            width={200} // Explicit width
            height={200} // Explicit height
            objectFit="cover"
            transition="transform 0.3s ease"
          />
        </Box>

        {/* View Profile Button */}
        <Link href={artsPage} passHref>
          <Button
            as="a"
            variant="outline"
            colorScheme="pink"
            width="full"
            _hover={{ bg: "#ff007f", color: "white" }}
          >
            View Profile
          </Button>
        </Link>

        
      </Box>
    </Box>
  );
};

export default ArtistCard;
