import React from "react";
import { Box, VStack, Text, Heading } from "@chakra-ui/react";
import MotionSection from "../components/MotionSection";
import Head from "next/head";
import Script from "next/script";
import styles from "../components/TextCard.module.css";

// Updated FAQ list
const faqs = [
  {
    question: "How do I book an appointment?",
    answer:
      "You can book online via the online booking system, come in store and discuss it with ourselves (we recommend this for cover-ups), or via our social media platforms.",
  },
  {
    question: "Do you accept walk-ins?",
    answer: "We do accept walk-ins when artists are available, but booking is encouraged.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept cash, bank transfer, card payments, PayPal, and Klarna.",
  },
  {
    question: "What should I do to prepare for my appointment?",
    answer:
      "Get a good night’s sleep, stay hydrated, and eat a meal beforehand. Avoid alcohol and drugs before your session.",
  },
  {
    question: "How do I care for my new tattoo?",
    answer:
      "Follow our aftercare instructions, keep it clean, moisturized, and protected from direct sunlight.",
  },
];

// FAQ Schema for SEO
const faqStructuredData = {
  "@context": "http://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const FAQPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Frequently Asked Questions | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="Find answers to common questions about booking, preparation, aftercare, and more at Hull Tattoo Studio."
        />
        <meta
          name="keywords"
          content="Tattoo FAQ, Booking Questions, Aftercare, Hull Tattoo Studio, Tattoo Preparation"
        />
        <meta property="og:title" content="Frequently Asked Questions | Hull Tattoo Studio" />
        <meta
          property="og:description"
          content="Got questions? Our FAQ page provides answers about booking, sessions, aftercare, and more."
        />
        <meta property="og:image" content="/images/og-image.jpg" />
        <meta property="og:url" content="https://www.hulltattoostudio.com/faq" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:site_name" content="Hull Tattoo Studio" />
        <link rel="canonical" href="https://www.hulltattoostudio.com/faq" />
      </Head>

      {/* Structured Data for SEO */}
      <Script id="faq-structured-data" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(faqStructuredData)}
      </Script>

      {/* Neon background effects */}
     

      <Box
        as="main"
        position="relative"
        bg="transparent"
        color="white"
        w="100%"
        p={8}
        px={{ base: 4, md: 8 }}
        minH="100vh"
        overflowX="hidden"
        boxShadow="0 0 20px #ff007f, 0 0 30px #00d4ff"
      >
        <Box className={styles.backgroundLines} />

        <Box
          bgGradient="radial(rgba(54,39,255,0.6), rgba(128,0,128,0.6), rgba(0,0,0,0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
          zIndex="1"
        >
          {/* FAQ Section */}
          <MotionSection
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Heading
              as="h1"
              size="2xl"
              color="white"
              textAlign="center"
              mb={8}
              textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
            >
              Frequently Asked Questions
            </Heading>
            <VStack spacing={6} align="stretch" maxW="800px" mx="auto">
              {faqs.map((faq, i) => (
                <Box
                  key={i}
                  bg="rgba(0, 0, 0, 0.5)"
                  p={6}
                  borderRadius="md"
                  boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
                >
                  <Text fontSize="xl" fontWeight="bold" mb={2}>
                    Q: {faq.question}
                  </Text>
                  <Text fontSize="md" lineHeight="1.8">
                    A: {faq.answer}
                  </Text>
                </Box>
              ))}
            </VStack>
          </MotionSection>
        </Box>
      </Box>
    </>
  );
};

export default FAQPage;
