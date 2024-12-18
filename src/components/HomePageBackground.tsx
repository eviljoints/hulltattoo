// ./src/components/HomePageBackground.tsx

import React from "react";
import { keyframes } from "@emotion/react";
import { Box, chakra, shouldForwardProp } from "@chakra-ui/react";
import { motion, isValidMotionProp } from "framer-motion";

// Define keyframes for the diagonal motion
const moveDiagonal = keyframes`
  0% { transform: translate(-100%, -100%); }
  100% { transform: translate(100%, 100%); }
`;

// Create a MotionBox component that combines Chakra UI and Framer Motion
const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});

const HomePageBackground: React.FC = () => {
  // Define additional neon line configurations
  const additionalNeonLines = [
    {
      color: "#ffff00", // Neon Yellow
      width: "2px",
      height: "200%",
      animationDuration: "14s",
      animationDelay: "6s",
    },
    {
      color: "#ff00ff", // Neon Magenta
      width: "2px",
      height: "200%",
      animationDuration: "16s",
      animationDelay: "8s",
    },
    // You can add more lines as desired
  ];

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      overflow="hidden"
      zIndex="5" // Ensure it layers above the default background but behind content
      pointerEvents="none" // Allow clicks to pass through
    >
      {additionalNeonLines.map((line, index) => (
        <MotionBox
          key={index}
          position="absolute"
          top="-100%"
          left="-100%"
          width={line.width}
          height={line.height}
          bg={line.color}
          boxShadow={`0 0 10px ${line.color},
                       0 0 20px ${line.color},
                       0 0 30px ${line.color}`}
          animation={`${moveDiagonal} ${line.animationDuration} linear infinite`}
          sx={{ animationDelay: line.animationDelay }}
        />
      ))}
    </Box>
  );
};

export default HomePageBackground;
