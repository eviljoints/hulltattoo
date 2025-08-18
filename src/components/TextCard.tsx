// ./src/components/TextCard.tsx
import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

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

/** Subtle diagonal sheen pass across the panel */
const sheen = keyframes`
  0%   { transform: translateX(-120%) skewX(-18deg); opacity: .0; }
  25%  { opacity: .25; }
  50%  { opacity: .35; }
  100% { transform: translateX(120%) skewX(-18deg); opacity: .0; }
`;

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
      zIndex={0}
      // Glassy neon panel
      bg="rgba(10,12,24,0.6)"
      borderRadius="xl"
      p={{ base: 6, md: 8 }}
      maxW={{ base: "95%", sm: "90%", md: "900px" }}
      mx={{ base: 6, md: "auto" }}
      border="1px solid rgba(255,0,127,0.35)"
      backdropFilter="blur(10px)"
      boxShadow="0 0 0 1px rgba(0,212,255,0.25) inset, 
                 0 0 22px rgba(255,0,127,0.35), 
                 0 0 28px rgba(0,212,255,0.25)"
      overflow="hidden"
      transition="transform .25s ease, box-shadow .25s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow:
          "0 0 0 1px rgba(0,212,255,0.35) inset, 0 0 28px rgba(255,0,127,0.45), 0 0 36px rgba(0,212,255,0.35)",
      }}
      // Animated sheen line (very subtle)
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "-30%",
        width: "35%",
        pointerEvents: "none",
        background:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
        mixBlendMode: "screen",
        animation: `${sheen} 4.5s linear infinite`,
      }}
      sx={{
        "@media (prefers-reduced-motion: reduce)": {
          _before: { animation: "none" },
          transition: "none",
          _hover: { transform: "none" },
        },
      }}
    >
      {/* Soft neon beams behind, using your stripes prop */}
      {stripes.map((stripe, index) => (
        <Box
          key={index}
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
          boxShadow={`0 0 14px ${stripe.color}, 0 0 26px ${stripe.color}`}
          mixBlendMode="screen"
        />
      ))}

      {/* Title */}
      <Text
        as="h2"
        fontFamily="'VanillaWhale', sans-serif"
        fontSize={{ base: "2.25rem", md: "3.25rem" }}
        fontWeight="bold"
        color="white"
        textAlign="center"
        mb={{ base: 4, md: 5 }}
        lineHeight="1.1"
        sx={{
          textShadow:
            "0 0 4px #ffffff, 0 0 10px #ff007f, 0 0 18px #ff007f, 0 0 28px #00d4ff, 0 0 42px rgba(0,212,255,.9)",
        }}
      >
        {title}
      </Text>

      {/* Subtitle (optional) */}
      {subtitle && (
        <Text
          fontSize={{ base: "md", md: "lg" }}
          color="#00d4ff"
          textAlign="center"
          mb={{ base: 4, md: 5 }}
          sx={{
            textShadow: "0 0 6px #00d4ff, 0 0 10px #ff007f",
          }}
        >
          {subtitle}
        </Text>
      )}

      {/* Description (HTML) */}
      <Box
        fontSize={{ base: "sm", md: "lg" }}
        color="rgba(235,235,235,0.95)"
        textAlign={align}
        lineHeight="1.8"
        className="text-card-content"
        textShadow="0 0 4px #ff007f, 0 0 8px #00d4ff"
        mb={{ base: 2, md: 3 }}
        dangerouslySetInnerHTML={{ __html: description }}
      />

      {/* Footer (optional) */}
      {footer && (
        <Text
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="semibold"
          color="#00d4ff"
          textAlign="center"
          sx={{ textShadow: "0 0 6px #00d4ff, 0 0 10px #ff007f" }}
        >
          {footer}
        </Text>
      )}
    </Box>
  );
};

export default TextCard;
