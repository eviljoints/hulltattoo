// ./src/pages/aftercare.tsx

import React from "react";
import { Box, VStack } from "@chakra-ui/react";
import MotionSection from "../components/MotionSection";
import Head from "next/head";
import Script from "next/script";
import TextCard from "../components/TextCard";
import styles from "../components/TextCard.module.css";

// Page constants
const PAGE_URL = "https://www.hulltattoostudio.com/aftercare";
const PAGE_TITLE = "Aftercare Instructions for Your New Tattoo | Hull Tattoo Studio";
const PAGE_DESC =
  "Learn how to properly care for your new tattoo at Hull Tattoo Studio. Follow our step-by-step aftercare instructions to support healthy healing.";
const OG_IMAGE = "/images/aftercare.webp";

// Structured Data (JSON-LD) — HowTo (generic)
const howToStructuredData = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Tattoo Aftercare Instructions",
  description:
    "Step-by-step instructions to properly care for a new tattoo to support correct healing.",
  image: [OG_IMAGE],
  totalTime: "P7D",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "GBP",
    value: "Varies",
  },
  supply: [
    { "@type": "HowToSupply", name: "Fragrance-free, tattoo-safe aftercare ointment" },
    { "@type": "HowToSupply", name: "Clean towel or paper towel" },
  ],
  tool: [{ "@type": "HowToTool", name: "Warm water" }],
  step: [
    {
      "@type": "HowToStep",
      name: "Clean Your Tattoo",
      text:
        "Clean your tattoo with warm, clean water using just your hand in a gentle massaging motion.",
    },
    {
      "@type": "HowToStep",
      name: "Pat Dry",
      text:
        "Pat your tattoo dry with either a clean towel or a paper towel (do not rub it).",
    },
    {
      "@type": "HowToStep",
      name: "Air Dry",
      text:
        "Allow it to air dry for about 10 minutes before applying any aftercare product.",
    },
    {
      "@type": "HowToStep",
      name: "Apply Aftercare Ointment",
      text:
        "Apply a small amount of a suitable aftercare ointment and gently massage it into the skin.",
    },
    {
      "@type": "HowToStep",
      name: "Repeat Twice Daily",
      text: "Repeat this process once in the morning and once at night.",
    },
  ],
};

// Structured Data — LocalBusiness (hours kept as requested)
const businessStructuredData = {
  "@context": "https://schema.org",
  "@type": "TattooParlor",
  name: "Hull Tattoo Studio",
  url: "https://www.hulltattoostudio.com",
  image: [OG_IMAGE],
  address: {
    "@type": "PostalAddress",
    streetAddress: "255 Hedon Road",
    addressLocality: "Hull",
    postalCode: "HU9 1NQ",
    addressCountry: "GB",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:30",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "11:30",
      closes: "19:00",
    },
  ],
};

// Structured Data — Breadcrumbs
const breadcrumbsStructuredData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.hulltattoostudio.com" },
    { "@type": "ListItem", position: 2, name: "Aftercare", item: PAGE_URL },
  ],
};

const AfterCarePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESC} />
        <meta
          name="keywords"
          content="Tattoo aftercare, Hull Tattoo Studio, tattoo healing, how to care for a new tattoo, tattoo maintenance"
        />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta name="theme-color" content="#000000" />

        {/* Open Graph */}
        <meta property="og:title" content="Aftercare Instructions | Hull Tattoo Studio" />
        <meta
          property="og:description"
          content="Detailed aftercare instructions to help your tattoo heal properly."
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:site_name" content="Hull Tattoo Studio" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:alt" content="Tattoo aftercare guide illustration" />
        <meta property="og:image:type" content="image/webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Aftercare Instructions | Hull Tattoo Studio" />
        <meta
          name="twitter:description"
          content="Learn how to care for your new tattoo with our simple, expert aftercare guide."
        />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:image:alt" content="Tattoo aftercare guide illustration" />

        <link rel="canonical" href={PAGE_URL} />

        {/* Preload hero image */}
        <link
          rel="preload"
          as="image"
          href={OG_IMAGE}
          imageSrcSet="/images/aftercare.webp"
          imageSizes="(max-width: 768px) 100vw, 500px"
        />
      </Head>

      {/* Structured Data (use afterInteractive outside _document) */}
      <Script id="ld-howto" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(howToStructuredData)}
      </Script>
      <Script id="ld-business" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(businessStructuredData)}
      </Script>
      <Script id="ld-breadcrumbs" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(breadcrumbsStructuredData)}
      </Script>

      <Box
        as="main"
        position="relative"
        color="white"
        w="100%"
        p={8}
        px={{ base: 4, md: 8 }}
        minH="100vh"
        bg="transparent"
        aria-labelledby="aftercare-heading"
      >
        <Box className={styles.backgroundLines} aria-hidden="true" />

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
            <section aria-labelledby="aftercare-heading">
              <TextCard
                title="AFTERCARE INSTRUCTIONS"
                description={`<p>Please follow the aftercare advice given to you by the artist to ensure correct healing of your tattoo. If you have any questions, feel free to reach out to any member of the Hull Tattoo Studio staff.</p>

                <ol>
                  <li>Clean your tattoo with warm, clean water using just your hand in a gentle massaging motion.</li>
                  <li>Pat your tattoo dry with either a clean towel or a paper towel (do not rub it).</li>
                  <li>Allow it to air dry for about 10 minutes before applying any aftercare product.</li>
                  <li>Apply a small amount of a fragrance-free, tattoo-safe aftercare ointment and gently massage it into the skin.</li>
                  <li>Repeat this process twice a day: once in the morning and once at night.</li>
                </ol>

                <p><strong>If second skin is used:</strong></p>
                <ul>
                  <li>Keep it on for 24 hours, then return to the shop so we can reapply it.</li>
                  <li>It will remain on for ~7 days; plasma buildup under the film is normal.</li>
                  <li>To remove, gently warm the area to loosen the adhesive, then peel slowly from the edge.</li>
                </ul>

                <p><strong>Avoid:</strong></p>
                <ul>
                  <li>Direct sunlight on the fresh tattoo.</li>
                  <li>Soaking (baths, pools, sea) until fully healed.</li>
                  <li>Excess friction, dirt or contaminated environments.</li>
                </ul>`}
                footer="Use a fragrance-free, tattoo-safe aftercare ointment as advised by your artist."
                stripes={[
                  { left: "10%", width: "10px", color: "#ff007f" },
                  { left: "30%", width: "15px", color: "#00d4ff" },
                ]}
              />
            </section>
          </MotionSection>

          {/* Removed the product image and brand-specific section to keep this page generic */}
          <VStack spacing={8} align="center" />
        </Box>
      </Box>
    </>
  );
};

export const getStaticProps = async () => {
  return { props: {} };
};

export default AfterCarePage;
