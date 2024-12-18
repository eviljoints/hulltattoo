// ./src/components/MotionBox.tsx

import { chakra, shouldForwardProp, BoxProps } from "@chakra-ui/react";
import { motion, isValidMotionProp, MotionProps } from "framer-motion";
import React from "react";

// Utility type to merge props and handle overlapping properties
type Merge<P, T> = Omit<P, keyof T> & T;

// Define MotionBoxProps to include both BoxProps and MotionProps
type MotionBoxProps = Merge<BoxProps, MotionProps>;

// Create the MotionBox component with correct typing
const MotionBox: React.FC<MotionBoxProps> = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});

export default MotionBox;
