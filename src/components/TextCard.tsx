import React from "react";
import { Box, Text } from "@chakra-ui/react";

interface Stripe {
  left: string;
  width: string;
  color: string;
}

interface TextCardProps {
  title: React.ReactNode;
  subtitle?: string;
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
      bg="rgba(0, 0, 0, 0.6)"
      borderRadius="md"
      p={6}
      overflow="hidden"
      boxShadow="0 0 8px #ff007f, 0 0 15px #00d4ff"
      transition="transform 0.3s ease"
      _hover={{ transform: "scale(1.02)" }}
      maxW={{ base: "95%", sm: "90%", md: "800px" }} // Responsive width for mobile
      mx={{ base: 6, md: "auto" }} // Margin for mobile & centered on larger screens
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
        fontSize={{ base: "2xl", md: "4xl" }} // Adjusted size for mobile
        fontWeight="bold"
        color="white"
        textAlign="center"
        mb={4}
        textShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
      >
        {title}
      </Text>

      {/* Subtitle (optional) */}
      {subtitle && (
        <Text
          fontSize={{ base: "md", md: "lg" }} // Responsive font size
          color="#00d4ff"
          textAlign="center"
          mb={4}
          textShadow="0 0 4px #00d4ff, 0 0 8px #ff007f"
        >
          {subtitle}
        </Text>
      )}

      {/* Description as HTML */}
      <Box
        fontSize={{ base: "sm", md: "lg" }} // Smaller font for mobile
        color="white"
        textAlign={align}
        lineHeight="1.8"
        textShadow="0 0 4px #ff007f, 0 0 8px #00d4ff"
        mb={1}
        className="text-card-content"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      {/* Footer (optional) */}
      {footer && (
        <Text
          fontSize={{ base: "md", md: "lg" }} // Adjusted footer size for mobile
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
