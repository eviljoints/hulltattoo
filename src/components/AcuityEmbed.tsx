// ./src/components/AcuityEmbed.tsx

import React from "react";
import { Box } from "@chakra-ui/react";
import Script from "next/script";
import styles from "./AcuityEmbed.module.css"; // Import the CSS module

const AcuityEmbed: React.FC = () => {
  return (
    <Box className={styles.iframeContainer} mb={16}>
      <iframe
        src="https://app.acuityscheduling.com/schedule.php?owner=34239595&ref=embedded_csp"
        title="Schedule Appointment"
        frameBorder="0"
        scrolling="no" // Disable native scrolling
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
