import React, { useMemo, useState } from "react";
import NextLink from "next/link";
import Image from "next/image";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Select,
  HStack,
  Badge,
} from "@chakra-ui/react";
import PageSeo from "~/components/PageSeo";
import { allPosts, PostMeta } from "~/lib/blog";
import { displayDate } from "~/lib/dates";

export default function BlogIndex({ posts }: { posts: PostMeta[] }) {
  const [topic, setTopic] = useState("All topics");
  const [order, setOrder] = useState("newest");
  const topics = [
    "All topics",
    ...Array.from(new Set(posts.map((p) => p.topic))),
  ];
  const visible = useMemo(
    () =>
      posts
        .filter((p) => topic === "All topics" || p.topic === topic)
        .sort((a, b) =>
          order === "title"
            ? a.title.localeCompare(b.title)
            : order === "oldest"
            ? a.date.localeCompare(b.date)
            : b.date.localeCompare(a.date)
        ),
    [posts, topic, order]
  );
  return (
    <>
      <PageSeo
        title="Tattoo advice & studio journal"
        description="Plan your tattoo with guides to booking, placement, cover-ups and aftercare, alongside work from Hull Tattoo Studio’s artists."
        path="/blog/"
      />
      <Box
        className="blog-page blog-index"
        as="main"
        maxW="1150px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={{ base: 8, md: 12 }}
      >
        <Text color="cyan.200" mb={3}>
          The studio journal
        </Text>
        <Heading as="h1" fontSize={{ base: "3xl", md: "5xl" }} mb={5}>
          Tattoo ideas, advice & stories
        </Heading>
        <Text maxW="720px" mx="auto" mb={8} lineHeight="1.8">
          Explore styles, prepare for your appointment and get to know the work
          made at our studio on Hedon Road in Hull. Start with our{" "}
          <NextLink href="/blog/Booking/">booking guide</NextLink>, browse the
          artists’ portfolios or read{" "}
          <NextLink href="/aftercare/">aftercare advice</NextLink>.
        </Text>
        <HStack spacing={4} mb={8} flexWrap="wrap" justify="center">
          <Box>
            <label htmlFor="blog-topic">Topic</label>
            <Select
              id="blog-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              bg="black"
            >
              {topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Box>
          <Box>
            <label htmlFor="blog-order">Sort articles</label>
            <Select
              id="blog-order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              bg="black"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A–Z</option>
            </Select>
          </Box>
        </HStack>
        <Text role="status" mb={4}>
          {visible.length} articles
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {visible.map((post, i) => (
            <Box
              as="article"
              key={post.slug}
              className="glass-card"
              overflow="hidden"
              textAlign="left"
            >
              <NextLink
                href={`/blog/${post.slug}/`}
                aria-label={`Read ${post.title}`}
              >
                <Box position="relative" height="220px">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width:767px) 100vw, (max-width:1023px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                    priority={i === 0}
                  />
                </Box>
                <Box p={5}>
                  <Badge colorScheme="cyan" mb={3}>
                    {post.topic}
                  </Badge>
                  <Heading
                    as="h2"
                    fontFamily="Arial, sans-serif"
                    fontSize="xl"
                    lineHeight="1.4"
                    mb={3}
                  >
                    {post.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.300" mb={3}>
                    <time dateTime={post.date}>{displayDate(post.date)}</time>
                  </Text>
                  <Text lineHeight="1.7">{post.excerpt}</Text>
                  <Text mt={4} color="cyan.200">
                    Read article →
                  </Text>
                </Box>
              </NextLink>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </>
  );
}
export function getStaticProps() {
  return { props: { posts: allPosts() } };
}
