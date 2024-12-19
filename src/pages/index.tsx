import React from "react";
import { Box, Grid, Spinner, Center } from "@chakra-ui/react";
import MotionSection from "../components/MotionSection";
import Head from "next/head";
import ArtistCard from "../components/ArtistCard";
import HomePageBackground from "../components/HomePageBackground";
import TextCard from "../components/TextCard";
import FindUs from "../components/FindUS";
import axios from "axios";
import styles from "../components/TextCard.module.css";

interface Stripe {
  left: string;
  width: string;
  color: string;
}

interface Artist {
  name: string;
  role: string;
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
  if (error) {
    return (
      <Center minH="100vh">
        <Box color="red.500">{error}</Box>
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

  const structuredData = {
    "@context": "http://schema.org",
    "@type": "TattooParlor",
    "name": "Hull Tattoo Studio",
    "description": "Professional tattoo studio in Hull offering various styles including realism, blackwork, anime, and apprentice work.",
    "image": "https://www.hulltattoostudio.com/images/og-image.jpg",
    "url": "https://www.hulltattoostudio.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Hull Street",
      "addressLocality": "Hull",
      "postalCode": "HU1 1AA",
      "addressCountry": "UK"
    },
    "openingHours": "Tu-F 09:30-15:00, Sa 11:30-18:00",
    "telephone": "+44-XXXX-XXXXXX"
  };

  return (
    <>
      <Head>
        <title>Hull Tattoo Studio | Professional Tattoo Artists</title>
        <meta
          name="description"
          content="Welcome to Hull Tattoo Studio. Our professional tattoo artists create stunning tattoos in a warm and welcoming environment. Book your appointment today!"
        />
        <meta
          name="keywords"
          content="Hull Tattoo Studio, Tattoo Artists, Realism Tattoo, Blackwork Tattoo, Anime Tattoo, Apprentice Tattoo Artist, Professional Tattoo, Best Tattoo Studio"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Hull Tattoo Studio | Professional Tattoo Artists" />
        <meta
          property="og:description"
          content="Welcome to Hull Tattoo Studio. Our professional tattoo artists create stunning tattoos in a warm and welcoming environment. Book your appointment today!"
        />
        <meta property="og:image" content="/images/og-image.jpg" />
        <meta property="og:url" content="https://www.hulltattoostudio.com" />
        <meta property="og:type" content="website" />

        <link rel="canonical" href="https://www.hulltattoostudio.com" />

        {/* Inject JSON-LD structured data using dangerouslySetInnerHTML */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <HomePageBackground />

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
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            mb={16}
          >
            <TextCard
              title="WELCOME TO HULL TATTOO STUDIO"
              description={`At Hull Tattoo Studio, our knowledgeable artists strive to create the best tattoos possible. We provide a warm and welcoming atmosphere to make every client feel as comfortable as possible during the tattoo procedure. Trust us to bring your tattoo ideas to life!
    
There is free parking very close to the studio and convenient bus stops providing easy means of transport.`}
              footer="OPEN TUES-FRI 9:30-15:00 | SAT 11:30-18:00"
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
            <TextCard
              title="ARTISTS"
              subtitle=""
              description="Meet our talented artists who specialize in various tattoo styles. Click their profiles to explore their work."
              stripes={[
                { left: "10%", width: "10px", color: "#ff007f" },
                { left: "30%", width: "15px", color: "#00d4ff" },
              ]}
            />

            <Box h={10} />

            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(auto-fit, minmax(250px, 1fr))",
              }}
              gap={10}
            >
              {artists.map((artist, index) => (
                <ArtistCard
                  key={index}
                  name={artist.name}
                  role={artist.role}
                  image={artist.image}
                  gallery={artist.gallery}
                  facebook={artist.facebook}
                  instagram={artist.instagram}
                  artsPage={artist.artsPage}
                  stripes={artist.stripes}
                />
              ))}
            </Grid>
          </MotionSection>
        </Box>

        <Box mt={16}>
          <FindUs />
        </Box>
      </Box>
    </>
  );
};

export const getStaticProps = async () => {
  try {
    // Adjust the API endpoint as needed
    const response = await axios.get("hulltattoostudio.com/api/artists");
    return {
      props: {
        artists: response.data.artists,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        artists: null,
        error: "Failed to load artist data.",
      },
    };
  }
};

export default HomePage;
