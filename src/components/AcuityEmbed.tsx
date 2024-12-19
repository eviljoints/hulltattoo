// ./src/components/AcuityEmbed.tsx

import React from "react";
import { Box } from "@chakra-ui/react";
import Script from "next/script";
import styles from "./AcuityEmbed.module.css"; // Import the CSS module

interface AcuityEmbedProps {
  link?: string;
}

const AcuityEmbed: React.FC<AcuityEmbedProps> = ({ link }) => {
  // If no link is provided, fallback to a default link
  const iframeSrc = link || "https://app.acuityscheduling.com/schedule.php?owner=34239595&ref=embedded_csp";

  return (
    <Box className={styles.iframeContainer} mb={16}>
      <iframe
        src={iframeSrc}
        title="Schedule Appointment"
        frameBorder="0"
        scrolling="no"
        allowTransparency
      ></iframe>
      <Script
        src="https://embed.acuityscheduling.com/js/embed.js"
        strategy="afterInteractive"
      />
    </Box>
  );
};

export default AcuityEmbed;
