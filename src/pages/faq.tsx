// ./src/pages/faq.tsx

import React from "react";
import { Box, VStack, Text, Heading, SimpleGrid } from "@chakra-ui/react";
import MotionSection from "../components/MotionSection";
import Head from "next/head";
import Script from "next/script";
import styles from "./artists/MikePage.module.css";
import { PrismaClient } from "@prisma/client";

interface FAQ {
  question: string;
  answer: string;
}

interface CustomReview {
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface FAQPageProps {
  faqs: FAQ[];
  reviews: CustomReview[];
}

// Sample FAQ data
const faqs: FAQ[] = [
  {
    question: "How do I book an appointment?",
    answer: "You can book online through our website or call the studio directly."
  },
  {
    question: "Do you accept walk-ins?",
    answer: "We do accept walk-ins when artists are available, but booking is encouraged."
  },
  {
    question: "What should I do to prepare for my appointment?",
    answer:
      "Get a good night’s sleep, stay hydrated, and eat a meal beforehand. Avoid alcohol and drugs before your session."
  },
  {
    question: "How do I care for my new tattoo?",
    answer:
      "Follow our aftercare instructions, keep it clean, moisturized, and protected from direct sunlight. Check out our Aftercare page for detailed guidance."
  }
];

// FAQ Schema for SEO
const faqStructuredData = {
  "@context": "http://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};

const FAQPage: React.FC<FAQPageProps> = ({ faqs, reviews }) => {
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

      <Script
        id="faq-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(faqStructuredData)}
      </Script>

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
          <MotionSection
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            mb={16}
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

          {/* Display Custom Reviews - Statically Generated Once a Week */}
          <MotionSection
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            mt={16}
          >
            <Heading
              as="h2"
              size="xl"
              color="white"
              textAlign="center"
              mb={8}
              textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
            >
              What Our Clients Say
            </Heading>
            {reviews.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} maxW="800px" mx="auto" mb={10}>
                {reviews.map((review, i) => (
                  <Box
                    key={i}
                    bg="rgba(0,0,0,0.5)"
                    p={6}
                    borderRadius="md"
                    boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
                  >
                    <Text fontWeight="bold" mb={2}>
                      {review.name} - {`${review.rating}★`}
                    </Text>
                    <Text fontSize="md" lineHeight="1.8">
                      {review.comment}
                    </Text>
                    <Text fontSize="sm" fontStyle="italic" mt={2}>
                      Posted: {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Text textAlign="center" fontSize="lg" mb={10}>
                No reviews available at this time.
              </Text>
            )}
          </MotionSection>
        </Box>
      </Box>
    </>
  );
};

export default FAQPage;

export async function getStaticProps() {
  const prisma = new PrismaClient();

  // Fetch reviews from your database
  const reviewsFromDB = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Convert to the required shape if necessary
  const reviews: CustomReview[] = reviewsFromDB.map((r) => ({
    name: r.name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    props: {
      faqs,
      reviews
    },
    // Re-generate the page once a week (604800 seconds)
    revalidate: 604800,
  };
}
