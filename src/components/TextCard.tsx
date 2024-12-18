import React from "react";
import { Box, Text, Image } from "@chakra-ui/react";
import styles from "./TextCard.module.css"; // Ensure the path is correct

interface Stripe {
  left: string;
  width: string;
  color: string;
}

interface TextCardProps {
  title: string;
  subtitle?: string;
  description: string;
  footer?: string;
  leftImage?: string;
  rightImage?: string;
  stripes: Stripe[];
  align?: "left" | "center"; // New align prop
}

const TextCard: React.FC<TextCardProps> = ({
  title,
  subtitle,
  description,
  footer,
  leftImage,
  rightImage,
  stripes,
  align = "center", // Default to center
}) => {
  return (
    <Box
      position="relative"
      zIndex="0"
      bg="rgba(0, 0, 0, 0.6)" // Semi-transparent background
      borderRadius="md"
      p={6}
      overflow="hidden"
      boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
      transition="transform 0.3s ease"
      _hover={{ transform: "scale(1.05)" }}
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
      <Box className={styles.neonLines}></Box>
      <Text
        fontSize={{ base: "3xl", md: "4xl" }}
        fontWeight="bold"
        color="white"
        textAlign="center"
        mb={4}
        textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff, 0 0 30px #00d4ff"
      >
        {title}
      </Text>

      {/* Subtitle */}
      {subtitle && (
        <Text
          fontSize="lg"
          color="#00d4ff"
          textAlign="center"
          mb={4}
          textShadow="0 0 5px #00d4ff, 0 0 10px #ff007f"
        >
          {subtitle}
        </Text>
      )}

      {/* Description */}
      <Box
        fontSize={{ base: "md", md: "lg" }}
        color="white"
        textAlign={align} // Use the align prop here
        lineHeight="1.8"
        textShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
        mb={4}
        className="text-card-content"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      {/* Footer */}
      {footer && (
        <Text
          fontSize="lg"
          fontWeight="semibold"
          color="#00d4ff"
          textAlign="center"
          textShadow="0 0 5px #00d4ff, 0 0 10px #ff007f"
        >
          {footer}
        </Text>
      )}
    </Box>
  );
};

export default TextCard;
