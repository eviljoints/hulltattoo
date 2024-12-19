// ./pages/reviews.tsx

import React, { useState } from 'react';
import { Box, Heading, VStack, Text, FormControl, FormLabel, Input, Textarea, Button, Select, SimpleGrid } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MotionSection from '../components/MotionSection';
import styles from './artists/MikePage.module.css';

interface Review {
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsPageProps {
  reviews: Review[];
}

export default function ReviewsPage({ reviews }: ReviewsPageProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, comment })
      });
      const data = await res.json();
      if (res.ok) {
        // Successfully added a review
        setName('');
        setRating('5');
        setComment('');
        // Refresh page to show the new review
        router.replace(router.asPath);
      } else {
        console.error('Error adding review:', data.error);
      }
    } catch (error) {
      console.error('Error adding review:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reviews | Hull Tattoo Studio</title>
        <meta name="description" content="See what clients say and leave your own review!" />
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
        <Box className={styles.backgroundLines} />

        <Box
          bgGradient="radial(rgba(54,39,255,0.6), rgba(128,0,128,0.6), rgba(0,0,0,0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
          zIndex="1"
        >
          <VStack spacing={10} align="stretch" maxW="800px" mx="auto">
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
                Reviews
              </Heading>
              <Text fontSize="lg" textAlign="center" mb={8}>
                We value your feedback! Please leave a review and let us know about your experience.
              </Text>
            </MotionSection>

            <MotionSection
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Box as="form" onSubmit={handleSubmit} bg="rgba(0,0,0,0.5)" p={6} borderRadius="md" boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff">
                <FormControl isRequired mb={4}>
                  <FormLabel>Name</FormLabel>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    bg="white"
                    color="black"
                  />
                </FormControl>

                <FormControl isRequired mb={4}>
                  <FormLabel>Rating</FormLabel>
                  <Select value={rating} onChange={(e) => setRating(e.target.value)} bg="white" color="black">
                    <option value="5">5 ★★★★★</option>
                    <option value="4">4 ★★★★</option>
                    <option value="3">3 ★★★</option>
                    <option value="2">2 ★★</option>
                    <option value="1">1 ★</option>
                  </Select>
                </FormControl>

                <FormControl isRequired mb={4}>
                  <FormLabel>Comment</FormLabel>
                  <Textarea
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    bg="white"
                    color="black"
                  />
                </FormControl>

                <Button type="submit" colorScheme="pink" isLoading={loading} isDisabled={loading}>
                  Submit Review
                </Button>
              </Box>
            </MotionSection>

            <MotionSection
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Heading as="h2" size="xl" color="white" textAlign="center" mb={8} textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff">
                Client Reviews
              </Heading>
              {reviews.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {reviews.map((rev, i) => (
                    <Box
                      key={i}
                      bg="rgba(0,0,0,0.5)"
                      p={6}
                      borderRadius="md"
                      boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
                    >
                      <Text fontWeight="bold" mb={2}>
                        {rev.name} - {rev.rating}★
                      </Text>
                      <Text fontSize="md" lineHeight="1.8">
                        {rev.comment}
                      </Text>
                      <Text fontSize="sm" fontStyle="italic" mt={2}>
                        Posted: {new Date(rev.createdAt).toLocaleDateString()}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
                <Text textAlign="center">No reviews yet. Be the first to leave one!</Text>
              )}
            </MotionSection>
          </VStack>
        </Box>
      </Box>
    </>
  );
}

export async function getServerSideProps(context) {
  // In production on Vercel, VERCEL_URL is set.
  // If you have a custom domain, set NEXT_PUBLIC_BASE_URL in your project environment variables.
  const protocol = context.req.headers['x-forwarded-proto'] || 'http';
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/reviews`);
  const data = await res.json();

  return {
    props: {
      reviews: data.reviews || []
    }
  };
}
