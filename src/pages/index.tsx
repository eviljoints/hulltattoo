import React, { useEffect, useState } from "react";
import { Box, Grid, Spinner, Center } from "@chakra-ui/react";
import MotionSection from "../components/MotionSection";
import Head from "next/head";
import ArtistCard from "../components/ArtistCard";
import HomePageBackground from "../components/HomePageBackground";
import TextCard from "../components/TextCard";
import FindUs from "../components/FindUS"; // Import the FindUs component
import axios from "axios";
import styles from "../components/TextCard.module.css"; // Import the CSS module for background lines

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

const HomePage: React.FC = () => {
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axios.get("/api/artists");
        setArtists(response.data.artists);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load artist data.");
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="#ff007f" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center minH="100vh">
        <Box color="red.500">{error}</Box>
      </Center>
    );
  }

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
        {/* Open Graph Tags for Social Media */}
        <meta
          property="og:title"
          content="Hull Tattoo Studio | Professional Tattoo Artists"
        />
        <meta
          property="og:description"
          content="Welcome to Hull Tattoo Studio. Our professional tattoo artists create stunning tattoos in a warm and welcoming environment. Book your appointment today!"
        />
        <meta property="og:image" content="/images/og-image.jpg" />
        <meta property="og:url" content="https://www.hulltattoostudio.com" />
        <meta property="og:type" content="website" />
      </Head>

      {/* Include the HomePageBackground component */}
      <HomePageBackground />

      <Box
        as="main"
        position="relative"
        color="white"
        w="100%"
        p={8}
        px={{ base: 4, md: 8 }}
        minH="100vh"
        bg="transparent" // Ensure background is transparent to show neon lines
      >
        {/* Neon Diagonal Lines Background */}
        <Box className={styles.backgroundLines} />

        {/* Main Content Box with Purple and Black Faded Background */}
        <Box
          bgGradient="radial(rgba(54, 39, 255, 0.6), rgba(128, 0, 128, 0.6), rgba(0, 0, 0, 0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative" // To ensure it sits above the background lines
          zIndex="1" // Ensures content is above the background lines
        >
          {/* Welcome Section */}
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

          {/* Artists Section */}
          <MotionSection
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {/* Artists TextCard */}
            <TextCard
              title="ARTISTS"
              subtitle=""
              description="Meet our talented artists who specialize in various tattoo styles. Click their profiles to explore their work."
              stripes={[
                { left: "10%", width: "10px", color: "#ff007f" },
                { left: "30%", width: "15px", color: "#00d4ff" },
              ]}
            />

            {/* Add spacing between the TextCard and Grid */}
            <Box h={10} /> {/* Adds 40px of vertical space */}

            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(auto-fit, minmax(250px, 1fr))",
              }}
              gap={10}
            >
              {/* Render ArtistCard for each artist */}
              {artists &&
                artists.map((artist, index) => (
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

        {/* Find Us Section */}
        <Box mt={16}>
          <FindUs />
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
