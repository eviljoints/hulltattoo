import React from "react";
import { Box, Text, VStack, Heading } from "@chakra-ui/react";
import Head from "next/head";

const SEOOptimizedContent = () => {
  return (
    <>
      <Head>
        <title>Hull Tattoo Studio - Best Tattoo Artists in Hull</title>
        <meta
          name="description"
          content="Looking for the best tattoo studio in Hull? We offer expert tattooing, tattoo apprenticeships, and high-quality custom ink at our top-rated tattoo parlour."
        />
        <meta
          name="keywords"
          content="Hull tattoo studio, tattoo shops Hull, tattoo apprenticeship Hull, tattoos near me, tattooist near me, tattoo parlour Hull"
        />
        <meta name="robots" content="index, follow" />
      </Head>
      <Box
        as="section"
        bg="rgba(0, 0, 0, 0.6)"
        p={8}
        borderRadius="md"
        boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
        color="white"
        textAlign="center"
      >
        <VStack spacing={6}>
          <Heading as="h1" fontSize={{ base: "3xl", md: "4xl" }}>
            Welcome to Hull Tattoo Studio
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }}>
            Searching for the best <strong>tattoo shops in Hull</strong>? Our experienced tattooists bring your ideas to life with stunning custom ink. Whether you&apos;re a first-timer or a seasoned collector, we ensure every piece is a masterpiece.
          </Text>
          <Text fontSize={{ base: "md", md: "lg" }}>
            Interested in a <strong>tattoo apprenticeship in Hull</strong>? Join our professional team and start your journey into the world of tattoo artistry. We provide hands-on training in a real studio environment.
          </Text>
          <Text fontSize={{ base: "md", md: "lg" }}>
            Looking for <strong>tattoo shops near you</strong>? Our Hull-based studio is a top-rated destination, known for quality ink and exceptional service.
          </Text>
          <Text fontSize={{ base: "md", md: "lg" }}>
            Visit <strong>Hull Tattoo Studio</strong> today and experience the best tattooing in the area. Get inked by our expert artists in a professional and welcoming atmosphere.
          </Text>
        </VStack>
      </Box>
    </>
  );
};

export default SEOOptimizedContent;
