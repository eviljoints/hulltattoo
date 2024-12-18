// ./src/components/MotionSection.tsx

import { chakra, shouldForwardProp, BoxProps } from "@chakra-ui/react";
import { motion, isValidMotionProp, MotionProps } from "framer-motion";
import React from "react";

// Define MotionSectionProps without using Merge
type MotionSectionProps = Omit<BoxProps, "transition"> & MotionProps;

// Create the MotionSection component with correct typing
const MotionSection: React.FC<MotionSectionProps> = chakra(motion.section, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});

export default MotionSection;
