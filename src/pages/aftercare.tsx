// ./src/pages/aftercare.tsx

import React from "react";
import { Box, Center, Image, VStack } from "@chakra-ui/react";
import MotionSection from "../components/MotionSection";
import Head from "next/head";
import Script from "next/script";
import TextCard from "../components/TextCard";
import styles from "../components/TextCard.module.css";

const structuredData = {
  "@context": "http://schema.org",
  "@type": "HowTo",
  "name": "Tattoo Aftercare Instructions",
  "description": "Step-by-step instructions to properly care for a new tattoo to ensure correct healing.",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "GBP",
    "value": "Varies"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "Aftercare ointment (recommended: Apollo Aftercare)"
    },
    {
      "@type": "HowToSupply",
      "name": "Clean towel or paper towel"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Clean Your Tattoo",
      "text": "Clean your tattoo with warm clean water using just your hand in a massaging motion."
    },
    {
      "@type": "HowToStep",
      "name": "Pat Dry",
      "text": "Pat your tattoo dry with either a clean towel or a paper towel (do not rub it)."
    },
    {
      "@type": "HowToStep",
      "name": "Air Dry",
      "text": "Allow it to air dry for 10 minutes before applying aftercare ointment."
    },
    {
      "@type": "HowToStep",
      "name": "Apply Aftercare Ointment",
      "text": "Apply a small amount of aftercare ointment and gently massage it into the skin."
    },
    {
      "@type": "HowToStep",
      "name": "Repeat Twice Daily",
      "text": "Repeat this process once in the morning and once at night."
    }
  ],
  "tool": [
    {
      "@type": "HowToTool",
      "name": "Warm water"
    }
  ],
  "totalTime": "P7D"
};

const AfterCarePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Aftercare Instructions for Your New Tattoo | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="Learn how to properly care for your new tattoo at Hull Tattoo Studio. Follow our detailed aftercare instructions, use recommended Apollo Aftercare products, and ensure proper healing."
        />
        <meta
          name="keywords"
          content="Tattoo Aftercare, Hull Tattoo Studio, Apollo Aftercare, Tattoo Healing, Tattoo Maintenance, How to care for new tattoo, Hull"
        />
        <meta property="og:title" content="Aftercare Instructions | Hull Tattoo Studio" />
        <meta property="og:description" content="Detailed aftercare instructions to help your tattoo heal properly. Use Apollo Aftercare products for the best results." />
        <meta property="og:image" content="/images/aftercare-product.jpg" />
        <meta property="og:url" content="https://www.hulltattoostudio.com/aftercare" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:site_name" content="Hull Tattoo Studio" />
        <link rel="canonical" href="https://www.hulltattoostudio.com/aftercare" />
      </Head>

      {/* JSON-LD injected via next/script */}
      <Script
        id="aftercare-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(structuredData)}
      </Script>
      <Box className={styles.neonLines}></Box>

      <Box
        as="main"
        position="relative"
        color="white"
        w="100%"
        p={8}
        px={{ base: 4, md: 8 }}
        minH="100vh"
        bg="transparent"
      >
        {/* Neon Diagonal Lines Background */}
        <Box className={styles.backgroundLines} />

        <Box
          bgGradient="radial(rgba(54, 39, 255, 0.6), rgba(128, 0, 128, 0.6), rgba(0, 0, 0, 0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
          zIndex="1"
        >
          <MotionSection
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            mb={16}
          >
            <TextCard
              // Keeping the title as a string to reduce complexity
              title="AFTERCARE INSTRUCTIONS"
              description={`<p>Please follow the aftercare advice given to you by the artist to ensure correct healing of your tattoo. If you have any questions, feel free to reach out to any member of the Hull Tattoo Studio staff.</p>

              <ol>
                <li>Clean your tattoo with warm clean water using just your hand in a massaging motion.</li>
                <li>Pat your tattoo dry with either a clean towel or a paper towel (do not rub it).</li>
                <li>Allow it to air dry for 10 minutes — make a cuppa tea or watch some TikTok's!</li>
                <li>Apply a small amount of aftercare ointment and gently massage it into the skin.</li>
                <li>Repeat this process twice a day: once in the morning and once at night.</li>
              </ol>

              <p><strong>If second skin is used:</strong></p>
              <ul>
                <li>Keep it on for 24 hours, then return to the shop so we can reapply it.</li>
                <li>It will remain on for 7 days, during which plasma buildup is normal.</li>
                <li>To remove it, gently warm the area to loosen the adhesive, then peel it off.</li>
              </ul>

              <p><strong>Avoid:</strong></p>
              <ul>
                <li>Direct sunlight.</li>
                <li>Soaking your fresh tattoo in any body of water.</li>
                <li>Getting your tattoo dirty.</li>
              </ul>`}
              footer="We recommend Apollo Aftercare products, available in-store."
              stripes={[
                { left: "10%", width: "10px", color: "#ff007f" },
                { left: "30%", width: "15px", color: "#00d4ff" },
              ]}
            />
          </MotionSection>

          <MotionSection
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <VStack spacing={8} align="center">
              <Box textAlign="center">
                <Image
                  src="/images/apollo-aftercare.svg"
                  alt="Apollo Aftercare Product"
                  borderRadius="md"
                  boxShadow="0 0 10px #ff007f, 0 0 15px #00d4ff"
                  maxW={{ base: "100%", md: "500px" }}
                />
              </Box>
              <TextCard
                // Using a string for the title here to ensure it's SSR-safe
                title="Apollo Aftercare"
                description={`Apollo Aftercare products are designed to help your tattoo heal quickly and effectively. They are gentle on the skin, free from harsh chemicals, and highly recommended by our artists. Available for purchase in-store.`}
                stripes={[
                  { left: "10%", width: "10px", color: "#ff007f" },
                  { left: "70%", width: "15px", color: "#00d4ff" },
                ]}
              />
            </VStack>
          </MotionSection>
        </Box>
      </Box>
    </>
  );
};

export default AfterCarePage;
