import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image"; // <= Next.js < v13 import

interface Stripe {
  left: string;
  width: string;
  color: string;
}

interface ArtistCardProps {
  name: string;
  role: string;
  image: string;    // e.g. "/images/mike.webp"
  alt: string;
  gallery: string;  // e.g. "/images/mike-gallery.webp"
  facebook?: string;
  instagram?: string;
  artsPage: string;
  stripes: Stripe[];
}

const ArtistCard: React.FC<ArtistCardProps> = ({
  name,
  role,
  image,
  alt,
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
      bg="rgba(0, 0, 0, 0.6)"
      borderRadius="md"
      p={4}
      overflow="hidden"
      boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
      transition="transform 0.3s ease"
      _hover={{ transform: "scale(1.05)" }}
    >
      {stripes.map((stripe, idx) => (
        <Box
          key={idx}
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

      <Box position="relative" zIndex={1}>
        {/* PROFILE IMAGE */}
        <Box mb={4} display="flex" justifyContent="center">
          <Box
            position="relative"
            width="150px"
            height="150px"
            overflow="hidden"
            borderRadius="50%"
            boxShadow="0 0 15px #ff007f, 0 0 25px #00d4ff"
            border="4px solid #ff007f"
          >
            <Image
              src={image}
              alt={alt || name}
              layout="fill"
              objectFit="cover"
              loading="lazy"
            />
          </Box>
        </Box>

        <Text
          fontSize="xl"
          fontWeight="bold"
          textAlign="center"
          mb={2}
          textShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
        >
          {name}
        </Text>

        <Text fontSize="md" textAlign="center" mb={4}>
          {role}
        </Text>

        {/* SOCIAL ICONS */}
        <Box display="flex" justifyContent="center" gap={4} mb={4}>
          {facebook && (
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} on Facebook`}
            >
              <FaFacebook size={24} color="#00d4ff" />
            </a>
          )}
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} on Instagram`}
            >
              <FaInstagram size={24} color="#ff007f" />
            </a>
          )}
        </Box>

        {/* GALLERY IMAGE */}
        <Box
          position="relative"
          overflow="hidden"
          mb={4}
          borderRadius="md"
          border="2px solid #ff007f"
          mx="auto"
          width={{ base: "80%", md: "50%" }}
          _hover={{ "div > span > img": { transform: "scale(1.3)" } }}
        >
          <Box position="relative" width="100%" height="0" pb="100%">
            <Box
              as="span"
              display="block"
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
            >
              <Image
                src={gallery}
                alt={`${name}'s Work`}
                layout="fill"
                objectFit="cover"
                style={{ transition: "transform 0.3s ease" }}
                loading="lazy"
              />
            </Box>
          </Box>
        </Box>

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
