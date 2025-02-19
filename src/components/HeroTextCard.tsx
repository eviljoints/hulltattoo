import React from "react";
import { Box, Heading } from "@chakra-ui/react";

/**
 * Basic interface for your hero text props.
 */
interface HeroTextCardProps {
  /**
   * Main heading text (e.g., "WELCOME TO HULL TATTOO STUDIO")
   */
  title: string;

  /**
   * Subtext or paragraph below the main title.
   * Accepts plain text or simple HTML.
   */
  description: string;

  /**
   * Text alignment: "left" | "center" | "right".
   * Default is "center".
   */
  align?: "left" | "center" | "right";
}

/**
 * A minimal, fast-loading hero text card.
 */
const HeroTextCard: React.FC<HeroTextCardProps> = ({
  title,
  description,
  align = "center",
}) => {
  return (
    <Box
      maxW="800px"
      mx="auto"
      py={{ base: 8, md: 16 }}
      px={{ base: 4, md: 8 }}
      bg="rgba(0,0,0,0.6)"
      borderRadius="md"
    >
      <Heading
        as="h1"
        fontSize={{ base: "2xl", md: "4xl" }}
        fontWeight="bold"
        color="white"
        textAlign={align}
        mb={4}
        textShadow="0 0 5px rgba(0,0,0,0.5)"
      >
        {title}
      </Heading>

      {/* Rendering HTML safely */}
      <Box
        fontSize={{ base: "md", md: "lg" }}
        color="gray.200"
        textAlign={align}
        lineHeight="1.6"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </Box>
  );
};

export default HeroTextCard;
