// ./src/pages/index.tsx

import React from "react";
import { Box, Grid, Spinner, Center, Flex } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import axios from "axios";
import MotionSection from "../components/MotionSection";
import ArtistCard from "../components/ArtistCard";
import TextCard from "../components/TextCard";

// Dynamically import non-critical components
const ReviewsModal = dynamic(() => import("~/components/ReviewsModal"), {
  ssr: false,
});
const ContactUsModal = dynamic(() => import("~/components/ContactUsModal"), {
  ssr: false,
});
const FindUsLazy = dynamic(() => import("../components/FindUS"), {
  ssr: false,
});

// Data Interfaces
interface Stripe {
  left: string;
  width: string;
  color: string;
}

interface Artist {
  slug: number;
  name: string;
  role: string;
  description: string;
  image: string;
  gallery: string;
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
  // Handle error or loading states
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

  // Structured Data for SEO (JSON-LD)
  const structuredData = {
    "@context": "http://schema.org",
    "@type": "TattooStudio",
    name: "Hull Tattoo Studio",
    description:
      "Professional tattoo studio in Hull. Hull Tattoo Studio offers tattoo artists specialising in black and grey tattoos, colour tattoos, and custom tattoo designs.",
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
      <Head>
        <title>
          Hull Tattoo Studio | Professional Tattoo Artists in Hull
        </title>
        <meta
          name="description"
          content="Hull Tattoo Studio offers exceptional tattoos crafted by expert artists in a welcoming environment. Specialising in realism, blackwork, and anime tattoos. Book now!"
        />
        <meta
          name="keywords"
          content="Hull Tattoo Studio, Tattoo Artists, Realism Tattoo, Blackwork Tattoo, Anime Tattoo, Professional Tattoo Studio, Hull, Custom Tattoos"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph Meta Tags */}
        <meta
          property="og:title"
          content="Hull Tattoo Studio | Professional Tattoo Artists in Hull"
        />
        <meta
          property="og:description"
          content="Hull Tattoo Studio offers stunning tattoos in Hull. Specialising in realism, blackwork, and anime tattoos. Book your appointment today!"
        />
        <meta
          property="og:image"
          content="https://www.hulltattoostudio.com/images/og-image.webp"
        />
        <meta property="og:url" content="https://www.hulltattoostudio.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Card Meta Tags */}
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

      {/* Intro Section */}
      <MotionSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        marginBottom={30}
        marginTop={30}
      >
        <TextCard
          title="WELCOME TO HULL TATTOO STUDIO"
          description={`
            <p>
              At Hull Tattoo Studio, our knowledgeable artists strive to create exceptional tattoos that reflect your unique style. Whether you’re seeking a vibrant custom design or a subtle black and grey masterpiece, we pride ourselves on being the preferred choice for tattoos in Hull.
            </p>
          `}
          stripes={[
            { left: "10%", width: "10px", color: "#ff007f" },
            { left: "30%", width: "15px", color: "#00d4ff" },
          ]}
        />
      </MotionSection>

      {/* Second Intro Section */}
      <MotionSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        marginBottom={16}
      >
        <TextCard
          title="What Hull Tattoo Studio Offers"
          description={`
            <p>
              We offer a welcoming environment combined with expert skills and a passion for artistry, ensuring that every client feels confident in choosing Hull Tattoo Studio for their next tattoo. As a leading tattoo studio in Hull, we remain committed to delivering safe, innovative, and personalised services—leaving you with a tattoo you’ll be proud of for years to come.
            </p>
          `}
          footer="OPEN TUES-FRI 9:30-15:00 | SAT 11:30-18:00"
          stripes={[
            { left: "10%", width: "10px", color: "#ff007f" },
            { left: "30%", width: "15px", color: "#00d4ff" },
          ]}
        />
      </MotionSection>

      {/* Buttons Section */}
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
          bgGradient="linear(rgba(54, 0, 92, 0.6), rgba(128, 0, 128, 0.6), rgba(0, 0, 0, 0.6))"
          borderRadius="md"
          padding={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
        >
          {/* Artists Section */}
          <MotionSection
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            marginBottom={16}
            marginTop={16}
          >
            <TextCard
              title="ARTISTS"
              description={`
                <p>
                  Meet our talented team at Hull Tattoo Studio, your premier destination for tattoos in Hull.
                </p>
                <br />
                <p>
                  <strong>Eggtattooer (Mike)</strong> specialises in black and grey and colour realism tattoos, backed by approximately 8 years of industry experience. He is constantly honing his craft and is currently sponsored by 
                  <a href="https://www.hulltattoostudio.com/aftercare" style="color:#00d4ff;">
                    <strong>Apollo Tattoo Aftercare</strong>
                  </a>.
                </p>
                <br />
                <p>
                  <strong>Poppy</strong> focuses on simple black and grey, blackwork, and limited colour pieces. She is approachable and always happy to discuss your unique ideas. Follow her journey on her 
                  <a href="/poppy" style="color:#00d4ff;">Poppy Page</a>.
                </p>
                <br />
                <p>
                  <strong>Harley</strong>, our latest addition, is diligently practising on practice skin with the goal of specialising in blackwork and pointillism. Stay tuned for updates on her 
                  <a href="/harley" style="color:#00d4ff;">Harley’s Page</a> as she refines her skills.
                </p>
              `}
              stripes={[
                { left: "10%", width: "10px", color: "#ff007f" },
                { left: "30%", width: "15px", color: "#00d4ff" },
              ]}
            />

            <Box marginTop={10}>
              <TextCard
                title="Apprenticeships and Advice"
                description={`
                  <p>
                    Considering an apprenticeship or seeking tattoo-related advice? Visit our 
                    <a href="/blog" style="color:#00d4ff;">blog</a> for insights, tips, and stories from our artists and apprentices. If you are specifically interested in learning how to get started, check out our dedicated post at 
                    <a href="/blog/Apprenticeship" style="color:#00d4ff;">Apprenticeship Post</a>.
                  </p>
                `}
                stripes={[
                  { left: "10%", width: "10px", color: "#ff007f" },
                  { left: "30%", width: "15px", color: "#00d4ff" },
                ]}
              />
            </Box>

            <Box marginTop={10}>
              <TextCard
                title="Frequently Asked Questions"
                description={`
                  <p>
                    Have questions about our services, tattoo aftercare, or the appointment process? Visit our 
                    <a href="/faq" style="color:#00d4ff;">FAQ page</a> for detailed answers.
                  </p>
                `}
                stripes={[
                  { left: "10%", width: "10px", color: "#ff007f" },
                  { left: "30%", width: "15px", color: "#00d4ff" },
                ]}
              />
            </Box>

            {/* Artist Cards */}
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
                  description={artist.description}
                  image={artist.image}
                  alt={`Image of ${artist.name}, a tattoo artist at Hull Tattoo Studio`}
                  gallery={artist.gallery}
                  facebook={artist.facebook}
                  instagram={artist.instagram}
                  artsPage={artist.artsPage}
                  stripes={artist.stripes}
                  priority={index === 0}
                />
              ))}
            </Grid>
          </MotionSection>
        </Box>

        {/* FIND US SECTION - Lazy-loaded */}
        <Box marginTop={16}>
          <FindUsLazy />
        </Box>
      </Box>
    </>
  );
};

// ISR: Fetch data at build time and revalidate every hour
export const getStaticProps = async () => {
  try {
    const response = await axios.get(
      "https://www.hulltattoostudio.com/api/artists"
    );
    return {
      props: {
        artists: response.data.artists,
      },
      revalidate: 3600,
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
