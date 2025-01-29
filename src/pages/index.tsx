// ./src/pages/index.tsx

import React from "react";
import { Box, Grid, Spinner, Center, Flex } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import axios from "axios";
import MotionSection from "../components/MotionSection";
import ArtistCard from "../components/ArtistCard";
import TextCard from "../components/TextCard";
// import FindUs from "../components/FindUS"; // <-- REMOVED this direct import
// Next.js dynamic imports to reduce initial bundle size
const ReviewsModal = dynamic(() => import("~/components/ReviewsModal"), {
  ssr: false,
});
const ContactUsModal = dynamic(() => import("~/components/ContactUsModal"), {
  ssr: false,
});
// Lazy-load FindUs
const FindUsLazy = dynamic(() => import("../components/FindUS"), {
  ssr: false,
});

// Artist interface
interface Stripe {
  left: string;
  width: string;
  color: string;
}
interface Artist {
  slug: number;
  name: string;
  role: string;
  description: string; // Add the description field
  image: string; // Path to .webp
  gallery: string; // Path to .webp
  facebook?: string;
  instagram?: string;
  artsPage: string;
  stripes: Stripe[];
}

interface HomePageProps {
  artists: Artist[] | null;
  error?: string;
}

const HomePage: React.FC<HomePageProps> = ({ artists, error }) => {
  // 1. Handle Error or Loading
  if (error) {
    return (
      <Center minH="100vh">
        <Box color="red.500" fontSize="xl">
          {error}
        </Box>
      </Center>
    );
  }
  if (!artists) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="#ff007f" />
      </Center>
    );
  }

  // 2. Structured Data for SEO
  const structuredData = {
    "@context": "http://schema.org",
    "@type": "TattooStudio",
    name: "Hull Tattoo Studio",
    description:
      "Professional tattoo studio in Hull offering various styles including realism, blackwork, anime, and apprentice work.",
    image: "https://www.hulltattoostudio.com/images/og-image.webp",
    url: "https://www.hulltattoostudio.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "652 Anlaby Road",
      addressLocality: "Hull",
      postalCode: "HU3 6UU",
      addressCountry: "UK",
    },
    openingHours: "Tu-F 09:30-15:00, Sa 11:30-18:00",
    telephone: "07940080790",
  };

  return (
    <>
      {/* 3. HEAD TAGS & SEO */}
      <Head>
        <title>Hull Tattoo Studio | Professional Tattoo Artists in Hull</title>
        <meta
          name="description"
          content="Hull Tattoo Studio offers exceptional tattoos crafted by expert artists in a welcoming environment. Specializing in realism, blackwork, and anime tattoos. Book now!"
        />
        <meta
          name="keywords"
          content="Hull Tattoo Studio, Tattoo Artists, Realism Tattoo, Blackwork Tattoo, Anime Tattoo, Professional Tattoo Studio, Hull, Custom Tattoos"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Hull Tattoo Studio | Professional Tattoo Artists in Hull"
        />
        <meta
          property="og:description"
          content="Hull Tattoo Studio offers stunning tattoos in Hull. Specializing in realism, blackwork, and anime tattoos. Book your appointment today!"
        />
        <meta
          property="og:image"
          content="https://www.hulltattoostudio.com/images/og-image.webp"
        />
        <meta property="og:url" content="https://www.hulltattoostudio.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:description"
          content="Expert tattoo artists in Hull creating stunning realism, blackwork, and anime tattoos. Visit Hull Tattoo Studio for your next piece!"
        />
        <meta
          name="twitter:image"
          content="https://www.hulltattoostudio.com/images/og-image.webp"
        />

        {/* Canonical URL */}
        <link rel="canonical" href="https://www.hulltattoostudio.com" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </Head>

      {/* 4. OPTIONAL: Defer 3rd-party scripts to reduce blocking */}
      {/* Example of deferring a script:
          <Script 
            src="https://example-third-party.js" 
            strategy="lazyOnload" 
          />
      */}

      {/* 5. PAGE CONTENT */}
      <Box
        as="main"
        position="relative"
        color="pink"
        width="100%"
        padding={8}
        paddingX={{ base: 4, md: 8 }}
        minHeight="100vh"
        bg="transparent"
      >
        <Box
          bgGradient="radial(rgba(54, 39, 255, 0.6), rgba(128, 0, 128, 0.6), rgba(0, 0, 0, 0.6))"
          borderRadius="md"
          padding={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
        >
          {/* Intro Section - reduced animation */}
          <MotionSection
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            viewport={{ once: true }}
            marginBottom={16}
          >
            <TextCard
              title="WELCOME TO HULL TATTOO STUDIO"
              description={`
                <p>
                  At Hull Tattoo Studio, our knowledgeable artists strive to create exceptional tattoos
                  that reflect your unique style. Whether you’re seeking a vibrant custom design or a
                  subtle black-and-grey masterpiece, we take pride in being the go-to choice for tattoos
                  in Hull.
                </p>
                <p>
                  Our welcoming environment, combined with expert skill and a passion for artistry,
                  ensures that every client feels confident in choosing Hull Tattoo Studio for their
                  next piece. As a leading tattoo artist in Hull, we remain committed to delivering safe,
                  innovative, and personalized services — leaving you with a tattoo you’ll be proud of
                  for years to come.
                </p>
              `}
              footer="OPEN TUES-FRI 9:30-15:00 | SAT 11:30-18:00"
              stripes={[
                { left: "10%", width: "10px", color: "#ff007f" },
                { left: "30%", width: "15px", color: "#00d4ff" },
              ]}
            />
          </MotionSection>

          {/* Buttons side by side */}
          <Center marginBottom={10}>
            <Flex
              gap={4}
              flexWrap="wrap"
              justifyContent="center"
              width="100%"
              maxWidth="500px"
            >
              <ReviewsModal
                buttonProps={{
                  width: "200px",
                  colorScheme: "blue",
                  boxShadow: "0 0 10px #00d4ff",
                  _hover: {
                    boxShadow: "0 0 20px #00d4ff, 0 0 40px #ff007f",
                    transform: "scale(1.05)",
                  },
                  "aria-label": "Read Reviews",
                }}
              />
              <ContactUsModal
                buttonProps={{
                  width: "200px",
                  colorScheme: "pink",
                  boxShadow: "0 0 10px #ff007f",
                  _hover: {
                    boxShadow: "0 0 20px #ff007f, 0 0 40px #00d4ff",
                    transform: "scale(1.05)",
                  },
                  "aria-label": "Contact Us",
                }}
              />
            </Flex>
          </Center>

          {/* Artists Section */}
          <MotionSection
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            marginBottom={16}
          >
            <TextCard
              title="ARTISTS"
              description={`
                <p>
                  Meet our talented team at Hull Tattoo Studio, your premier destination
                  for tattoos in Hull.
                </p>
                </br>
                <p>
                  <strong>Eggtattooer (Mike)</strong>, specializes in
                  black and gray and color realism tattoos, backed by roughly 8 years of
                  industry experience. He’s constantly honing his craft and is currently
                  sponsored by 
                  <a href="https://hulltattoostudio.com/aftercare" style="color:#00d4ff;">
                    <strong> Apollo Tattoo Aftercare </strong>
                  </a>.
                </p>
                </br>
                <p>
                  <strong>Poppy</strong>, focuses on simple black
                  and gray, blackwork, and limited color pieces. She’s easy to talk with
                  and always happy to discuss your unique ideas. Follow her journey on
                  her <a href="/poppy" style="color:#00d4ff;">Poppy Page</a>.
                </p>
                </br>
                <p>
                  <strong>Harley</strong>, our latest addition, is diligently practicing
                  on fake skin with a goal to specialize in blackwork and pointillism.
                  Stay tuned for updates on her
                  <a href="/harley" style="color:#00d4ff;">Harley’s page</a>
                  as she refines her skills.
                </p>
              `}
              stripes={[
                { left: "10%", width: "10px", color: "#ff007f" },
                { left: "30%", width: "15px", color: "#00d4ff" },
              ]}
            />

            {/* 6. Artist Cards */}
            <Grid
              templateColumns={{
                base: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(auto-fit, minmax(250px, 1fr))",
              }}
              gap={10}
              marginTop={8}
            >
              {artists.map((artist, index) => (
                <ArtistCard
                  key={artist.slug || index}
                  name={artist.name}
                  role={artist.role}
                  description={artist.description} // Pass the description here
                  image={artist.image}
                  alt={`Image of ${artist.name}, a tattoo artist at Hull Tattoo Studio`}
                  gallery={artist.gallery}
                  facebook={artist.facebook}
                  instagram={artist.instagram}
                  artsPage={artist.artsPage}
                  stripes={artist.stripes}
                  priority={index === 0} // Prioritize LCP image
                />
              ))}
            </Grid>
          </MotionSection>
        </Box>

        {/* 7. FIND US SECTION - now lazy-loaded */}
        <Box marginTop={16}>
          <FindUsLazy />
        </Box>
      </Box>
    </>
  );
};

// 8. ISR: fetch data at build time + revalidate every hour
export const getStaticProps = async () => {
  try {
    const response = await axios.get(
      "https://www.hulltattoostudio.com/api/artists"
    );
    return {
      props: {
        artists: response.data.artists,
      },
      revalidate: 3600, // <-- ISR
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        artists: null,
        error: "Failed to load artist data.",
      },
      revalidate: 3600,
    };
  }
};

export default HomePage;
