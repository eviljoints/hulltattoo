// ./src/components/HomePageBackground.tsx

import React from "react";
import { keyframes } from "@emotion/react";
import { Box, chakra, shouldForwardProp } from "@chakra-ui/react";
import { motion, isValidMotionProp } from "framer-motion";

/** Diagonal sweep (GPU-accelerated) */
const moveDiagonal = keyframes`
  0%   { transform: translate3d(-120%, -120%, 0); }
  100% { transform: translate3d(120%, 120%, 0); }
`;

/** Chakra + Framer Motion wrapper (unchanged API) */
const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
});

const HomePageBackground: React.FC = () => {
  // Use your site neon palette
  const PINK = "#ff007f";
  const CYAN = "#00d4ff";

  // Sleek neon beams (kept minimal for performance)
  const neonLines = [
    { color: CYAN, width: "2px", height: "200%", duration: "16s", delay: "0s", blur: "8px", opacity: 0.55 },
    { color: PINK, width: "2px", height: "200%", duration: "18s", delay: "4s", blur: "10px", opacity: 0.55 },
    { color: CYAN, width: "1px", height: "200%", duration: "22s", delay: "8s", blur: "6px", opacity: 0.4 },
    { color: PINK, width: "1px", height: "200%", duration: "26s", delay: "12s", blur: "6px", opacity: 0.4 },
  ];

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      overflow="hidden"
      zIndex="5"                // sits under header/nav/footer (which are 19/20/1000)
      pointerEvents="none"      // never intercepts clicks
    >
      {/* Radial neon wash (very subtle, matches site theme) */}
      <Box
        position="absolute"
        inset="0"
        opacity={0.8}
        sx={{
          background:
            `radial-gradient(1200px 600px at 20% 10%, ${PINK}22, transparent 60%),
             radial-gradient(900px 600px at 80% 80%, ${CYAN}20, transparent 60%)`,
          mixBlendMode: "screen",
        }}
      />

      {/* Futuristic grid/scanlines (subtle) */}
      <Box
        position="absolute"
        inset="0"
        opacity={0.35}
        sx={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px, 48px 48px",
          mixBlendMode: "screen",
        }}
      />

      {/* Animated neon beams (diagonal sweeps) */}
      {neonLines.map((line, i) => (
        <MotionBox
          key={i}
          position="absolute"
          top="-120%"
          left="-120%"
          width={line.width}
          height={line.height}
          bg={line.color}
          opacity={line.opacity}
          sx={{
            filter: `blur(${line.blur})`,
            boxShadow: `0 0 12px ${line.color}, 0 0 24px ${line.color}`,
            willChange: "transform",
            animation: `${moveDiagonal} ${line.duration} linear infinite`,
            animationDelay: line.delay,
            mixBlendMode: "screen",
            // Respect reduced motion
            "@media (prefers-reduced-motion: reduce)": {
              animation: "none",
              opacity: 0.2,
            },
          }}
        />
      ))}
    </Box>
  );
};

export default HomePageBackground;
