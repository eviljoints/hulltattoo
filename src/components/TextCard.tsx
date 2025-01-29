import React from "react";
import { Box, Text } from "@chakra-ui/react";

interface Stripe {
  left: string;
  width: string;
  color: string;
}

interface TextCardProps {
  title: React.ReactNode;  // Title can be any React node now
  subtitle?: string;
  // 'description' is a string, but we interpret it as HTML via dangerouslySetInnerHTML
  description: string;  
  footer?: string;
  stripes: Stripe[];
  align?: "left" | "center";
}

const TextCard: React.FC<TextCardProps> = ({
  title,
  subtitle,
  description,
  footer,
  stripes,
  align = "center",
}) => {
  return (
    <Box
      position="relative"
      zIndex="0"
      // Dark background with partial transparency
      bg="rgba(0, 0, 0, 0.6)"
      borderRadius="md"
      p={6}
      overflow="hidden"
      // Reduced from 0 0 10px + 0 0 20px to lighten the shadow
      boxShadow="0 0 8px #ff007f, 0 0 15px #00d4ff"
      // Shorter hover scale (from 1.05 to 1.02)
      transition="transform 0.3s ease"
      _hover={{ transform: "scale(1.02)" }}
      maxW="800px"
      mx="auto"
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

      {/* Title */}
      <Text
        fontSize={{ base: "3xl", md: "4xl" }}
        fontWeight="bold"
        color="white"
        textAlign="center"
        mb={4}
        // Reduced from 0 0 10px + 0 0 20px + 0 0 30px
        textShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
      >
        {title}
      </Text>

      {/* Subtitle (optional) */}
      {subtitle && (
        <Text
          fontSize="lg"
          color="#00d4ff"
          textAlign="center"
          mb={4}
          // Slightly lighter textShadow
          textShadow="0 0 4px #00d4ff, 0 0 8px #ff007f"
        >
          {subtitle}
        </Text>
      )}

      {/* Description as HTML */}
      <Box
        fontSize={{ base: "md", md: "lg" }}
        color="white"
        textAlign={align}
        lineHeight="1.8"
        textShadow="0 0 4px #ff007f, 0 0 8px #00d4ff"
        mb={4}
        className="text-card-content"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      {/* Footer (optional) */}
      {footer && (
        <Text
          fontSize="lg"
          fontWeight="semibold"
          color="#00d4ff"
          textAlign="center"
          textShadow="0 0 4px #00d4ff, 0 0 8px #ff007f"
        >
          {footer}
        </Text>
      )}
    </Box>
  );
};

export default TextCard;
