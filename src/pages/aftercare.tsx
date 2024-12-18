// ./src/pages/aftercare.tsx

import React from "react";
import { Box, Grid, Center, Image, VStack } from "@chakra-ui/react";
import MotionSection from "../components/MotionSection";
import Head from "next/head";
import TextCard from "../components/TextCard";
import styles from "./artists/MikePage.module.css"; // For the neon background lines

const AfterCarePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Aftercare Instructions | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="Follow our aftercare instructions for proper tattoo healing. We recommend Apollo Aftercare products, available in-store."
        />
        <meta
          name="keywords"
          content="Tattoo Aftercare, Hull Tattoo Studio, Apollo Aftercare, Tattoo Healing, Tattoo Maintenance"
        />
        <meta property="og:title" content="Aftercare Instructions | Hull Tattoo Studio" />
        <meta property="og:description" content="Detailed aftercare instructions to help your tattoo heal properly." />
        <meta property="og:image" content="/images/aftercare-product.jpg" />
        <meta property="og:url" content="https://www.hulltattoostudio.com/aftercare" />
      </Head>

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

        {/* Main Content */}
        <Box
          bgGradient="radial(rgba(54, 39, 255, 0.6), rgba(128, 0, 128, 0.6), rgba(0, 0, 0, 0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
          zIndex="1"
        >
          {/* Aftercare Instructions */}
          <MotionSection
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            mb={16}
          >
            <TextCard
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

          {/* Apollo Aftercare Images */}
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
