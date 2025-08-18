import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

interface Stripe {
  left: string;
  width: string;
  color: string;
}

interface ArtistCardProps {
  name: string;
  role: string;
  description: string;
  image: string;
  alt: string;
  gallery: string;
  facebook?: string;
  instagram?: string;
  artsPage: string;
  stripes: Stripe[];
  priority?: boolean;
}

const ArtistCard: React.FC<ArtistCardProps> = ({
  name,
  role,
  description,
  image,
  alt,
  gallery,
  facebook,
  instagram,
  artsPage,
  stripes,
  priority,
}) => {
  return (
    <Box
      position="relative"
      zIndex={0}
      // Glassy neon panel (subtle ~50% glow, consistent with globals.css)
      bg="rgba(10,12,24,0.60)"
      borderRadius="xl"
      p={{ base: 5, md: 6 }}
      border="1px solid rgba(255,0,127,0.35)"
      backdropFilter="blur(10px)"
      boxShadow="0 0 0 1px rgba(0,212,255,0.25) inset,
                 0 0 12px rgba(255,0,127,0.35),
                 0 0 16px rgba(0,212,255,0.25)"
      overflow="hidden"
      transition="transform .25s ease, box-shadow .25s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow:
          "0 0 0 1px rgba(0,212,255,0.35) inset, 0 0 16px rgba(255,0,127,0.45), 0 0 22px rgba(0,212,255,0.35)",
      }}
      sx={{
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          _hover: { transform: "none" },
        },
      }}
    >
      {/* Holographic light beams from stripes (softened + screen blend) */}
      {stripes.map((stripe, idx) => (
        <Box
          key={idx}
          position="absolute"
          top="-60%"
          left={stripe.left}
          width={stripe.width}
          height="220%"
          transform="rotate(45deg)"
          zIndex={-1}
          opacity={0.45}
          bgGradient={`linear(to-b, ${stripe.color}, ${stripe.color})`}
          filter="blur(6px)"
          mixBlendMode="screen"
          boxShadow={`0 0 8px ${stripe.color}, 0 0 12px ${stripe.color}`}
        />
      ))}

      <Box position="relative" zIndex={1}>
        {/* PROFILE IMAGE — circular neon ring (reduced glow) */}
        <Box mb={4} display="flex" justifyContent="center">
          <Box
            position="relative"
            width="150px"
            height="150px"
            borderRadius="50%"
            overflow="hidden"
            border="3px solid rgba(255,0,127,0.6)"
            boxShadow="0 0 8px rgba(255,0,127,0.45), 0 0 12px rgba(0,212,255,0.35)"
            _after={{
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              pointerEvents: "none",
              boxShadow:
                "inset 0 0 6px rgba(0,212,255,0.30), inset 0 0 10px rgba(255,0,127,0.30)",
            }}
          >
            <Image
              src={image}
              alt={alt || name}
              layout="fill"
              objectFit="cover"
              loading={priority ? "eager" : "lazy"}
              priority={!!priority}
            />
          </Box>
        </Box>

        {/* NAME (subtle neon text-shadow) */}
        <Text
          fontSize="xl"
          fontWeight="bold"
          textAlign="center"
          mb={1}
          color="white"
          sx={{
            textShadow:
              "0 0 1px #ffffff, 0 0 2px #ff007f, 0 0 4px #00d4ff, 0 0 6px rgba(0,212,255,.4)",
          }}
        >
          {name}
        </Text>

        {/* ROLE */}
        <Text fontSize="sm" opacity={0.9} textAlign="center" mb={2} color="white">
          {role}
        </Text>

        {/* DESCRIPTION */}
        <Text fontSize="sm" textAlign="center" mb={4} color="rgba(235,235,235,0.95)">
          {description}
        </Text>

        {/* SOCIAL ICONS — neon chips with hover lift (reduced glow) */}
        <Box display="flex" justifyContent="center" gap={3} mb={5}>
          {facebook && (
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} on Facebook`}
              style={{
                display: "grid",
                placeItems: "center",
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "1px solid rgba(0,212,255,0.35)",
                background:
                  "linear-gradient(180deg, rgba(0,212,255,0.08), rgba(255,0,127,0.08))",
                boxShadow:
                  "0 0 6px rgba(0,212,255,0.3), inset 0 0 8px rgba(255,0,127,0.22)",
                color: "#00d4ff",
                transition: "transform .15s ease, box-shadow .2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 0 10px rgba(0,212,255,0.4), inset 0 0 12px rgba(255,0,127,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 0 6px rgba(0,212,255,0.3), inset 0 0 8px rgba(255,0,127,0.22)";
              }}
            >
              <FaFacebook size={18} />
            </a>
          )}
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} on Instagram`}
              style={{
                display: "grid",
                placeItems: "center",
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "1px solid rgba(255,0,127,0.35)",
                background:
                  "linear-gradient(180deg, rgba(255,0,127,0.08), rgba(0,212,255,0.08))",
                boxShadow:
                  "0 0 6px rgba(255,0,127,0.3), inset 0 0 8px rgba(0,212,255,0.22)",
                color: "#ff007f",
                transition: "transform .15s ease, box-shadow .2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 0 10px rgba(255,0,127,0.4), inset 0 0 12px rgba(0,212,255,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 0 6px rgba(255,0,127,0.3), inset 0 0 8px rgba(0,212,255,0.22)";
              }}
            >
              <FaInstagram size={18} />
            </a>
          )}
        </Box>

        {/* GALLERY IMAGE — square with sheen on hover */}
        <Box
          position="relative"
          overflow="hidden"
          mb={5}
          borderRadius="md"
          border="2px solid rgba(255,0,127,0.6)"
          mx="auto"
          width={{ base: "86%", md: "60%" }}
          _hover={{ transform: "translateY(-1px)" }}
          transition="transform .2s ease"
        >
          <Box position="relative" width="100%" height="0" pb="100%">
            {/* sheen pass */}
            <Box
              position="absolute"
              inset={0}
              pointerEvents="none"
              opacity={0.14}
              background="linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)"
              transform="translateX(-120%)"
              transition="transform .6s ease"
              _groupHover={{ transform: "translateX(120%)" }}
            />
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

        {/* LINK TO FULL PROFILE (outline → neon fill on hover) */}
        <Link href={artsPage} passHref>
          <Button
            as="a"
            variant="outline"
            width="full"
            fontWeight="700"
            color="white"
            borderColor="rgba(255,0,127,0.6)"
            _hover={{
              bg: "linear-gradient(90deg, rgba(255,0,127,0.85), rgba(0,212,255,0.85))",
              borderColor: "transparent",
              boxShadow:
                "0 0 10px rgba(0,212,255,0.4), 0 0 14px rgba(255,0,127,0.4)",
            }}
            _focusVisible={{
              boxShadow: "0 0 0 3px rgba(0,212,255,0.5)",
              outline: "none",
            }}
          >
            View Profile
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default ArtistCard;
