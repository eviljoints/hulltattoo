// pages/blog/index.tsx

import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import Head from "next/head";
import {
  Box,
  Heading,
  Text,
  Link as ChakraLink,
  Select,
  Spinner,
} from "@chakra-ui/react";
import Image from "next/image"; // Using Next.js Image for better performance
import prisma from "../../../lib/prisma";

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  coverImage?: string;
  views: number;
}

interface BlogIndexProps {
  posts: PostMeta[];
}

const BlogIndex: React.FC<BlogIndexProps> = ({ posts }) => {
  const [sortedPosts, setSortedPosts] = useState<PostMeta[]>(posts);
  const [sortOption, setSortOption] = useState<string>("date-desc");
  const [views, setViews] = useState<Record<string, number>>({});
  const [loadingViews, setLoadingViews] = useState<boolean>(true);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await fetch("/api/get-views");
        if (response.ok) {
          const data = await response.json();
          setViews(data);
        } else {
          console.error("Failed to fetch views:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching views:", error);
      } finally {
        setLoadingViews(false);
      }
    };

    fetchViews();
  }, []);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = e.target.value;
    setSortOption(option);

    const sorted = [...sortedPosts].sort((a, b) => {
      if (option.includes("title")) {
        return option === "title-asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (option.includes("date")) {
        return option === "date-asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

    setSortedPosts(sorted);
  };

  const handlePostClick = async (slug: string) => {
    try {
      const response = await fetch("/api/update-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) {
        console.error(`Failed to update views for ${slug}:`, await response.json());
      } else {
        setViews((prev) => ({
          ...prev,
          [slug]: (prev[slug] || 0) + 1,
        }));
      }
    } catch (error) {
      console.error("Error updating views:", error);
    }
  };

  // Updated SEO variables targeting additional search terms
  const seoTitle =
    "Hull Tattoo Studio Tattoo Blog | Tattoo Apprentice & Tattoo Information";
  const seoDescription =
    "Discover the latest tattoo trends, expert advice, tattoo apprenticeship insights, and comprehensive tattoo information at Hull Tattoo Studio Tattoo Blog. Stay updated with artist stories, booking tips, and aftercare advice.";
  const seoImage = "/images/og-image.webp";
  const siteUrl = "https://www.hulltattoostudio.com/blog";

  // JSON‑LD Structured Data for the Blog page
  const blogStructuredData = {
    "@context": "http://schema.org",
    "@type": "Blog",
    "name": "Hull Tattoo Studio Tattoo Blog",
    "url": siteUrl,
    "description": seoDescription,
  };

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="tattoo blog, tattoo apprentice, Hull Tattoo Studio, tattoo information, tattoo advice, tattoo trends, tattoo tips, tattoo news, tattoo artist insights, tattoo aftercare, tattoo booking"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={seoTitle} />
        <meta
          property="og:description"
          content="Discover the latest tattoo trends, expert advice, and in-depth tattoo apprenticeship insights at Hull Tattoo Studio Tattoo Blog. Stay informed and inspired."
        />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:alt" content="Hull Tattoo Studio Blog Banner" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Hull Tattoo Studio" />
        <meta property="og:locale" content="en_GB" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta
          name="twitter:description"
          content="Explore tattoo tips, artist insights, and the latest tattoo trends on the Hull Tattoo Studio Tattoo Blog."
        />
        <meta name="twitter:image" content={seoImage} />
        <meta name="twitter:image:alt" content="Hull Tattoo Studio Blog Banner" />

        <link rel="canonical" href={siteUrl} />

        {/* JSON‑LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(blogStructuredData),
          }}
        />
      </Head>

      <Box
        minH="100vh"
        py={10}
        px={{ base: 4, md: 8 }}
        bgGradient="radial(rgba(54,39,255,0.6), rgba(128,0,128,0.6), rgba(0,0,0,0.6))"
      >
        <Box maxW="800px" mx="auto">
          <Heading
            as="h1"
            fontSize={{ base: "3xl", md: "4xl" }}
            color="white"
            mb={6}
            textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
            textAlign="center"
          >
            Hull Tattoo Studio Tattoo Blog
          </Heading>

          <Text color="gray.300" mb={8} fontSize="lg" textAlign="center">
            Welcome to Hull Tattoo Studio’s blog – your ultimate resource for tattoo
            tips, artist insights, tattoo apprenticeship advice, and the latest tattoo
            trends.
          </Text>

          <Box mb={6} textAlign="center">
            <Select
              value={sortOption}
              onChange={handleSortChange}
              width={{ base: "100%", md: "50%" }}
              mx="auto"
              bg="black"
              color="white"
              borderColor="gray.400"
              boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
              _hover={{ borderColor: "#ff007f" }}
              fontWeight="bold"
            >
              <option value="date-desc">Date Descending</option>
              <option value="date-asc">Date Ascending</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </Select>
          </Box>

          {sortedPosts.map((post) => (
            <NextLink href={`/blog/${post.slug}`} key={post.slug} passHref>
              <ChakraLink
                _hover={{ textDecoration: "none" }}
                onClick={() => handlePostClick(post.slug)}
              >
                <Box
                  mb={8}
                  p={4}
                  bg="rgba(0,0,0,0.6)"
                  borderRadius="md"
                  boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
                  transition="transform 0.2s"
                  _hover={{ transform: "scale(1.02)" }}
                  sx={{
                    ul: { ml: 6 },
                    ol: { ml: 6 },
                  }}
                >
                  {post.coverImage && (
                    <Box display="flex" justifyContent="center" mb={4}>
                      <Box
                        position="relative"
                        width="100%"
                        maxWidth="500px"
                        height="0"
                        pb="40%" // 16:9 aspect ratio
                        overflow="hidden"
                        borderRadius="md"
                        boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
                      >
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          layout="fill"
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 800px) 40vw, 500px"
                        />
                      </Box>
                    </Box>
                  )}

                  <Heading
                    as="h2"
                    fontSize="2xl"
                    color="white"
                    textShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
                    mb={2}
                  >
                    {post.title}
                  </Heading>

                  <Text color="gray.400" fontSize="sm" mb={2}>
                    <em>{post.date}</em>
                  </Text>

                  {post.excerpt && (
                    <Text color="white" fontSize="md" mb={2}>
                      {post.excerpt}
                    </Text>
                  )}

                  <Text color="gray.400" fontSize="sm">
                    {loadingViews ? (
                      <Spinner size="xs" />
                    ) : (
                      `Views: ${views[post.slug] || post.views}`
                    )}
                  </Text>
                </Box>
              </ChakraLink>
            </NextLink>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default BlogIndex;

export async function getStaticProps() {
  const postsDir = path.join(process.cwd(), "posts");

  try {
    const filenames = await fs.readdir(postsDir);

    const posts: PostMeta[] = await Promise.all(
      filenames.map(async (filename) => {
        const filePath = path.join(postsDir, filename);
        const fileContents = await fs.readFile(filePath, "utf8");
        const { data } = matter(fileContents);

        const slug = filename.replace(/\.mdx?$/, "");

        // Fetch view counts for each post
        const postView = await prisma.postView.findUnique({
          where: { slug },
          select: { views: true },
        });

        return {
          slug,
          title: data.title || "Untitled",
          date: data.date || "",
          excerpt: data.excerpt || "",
          coverImage: data.coverImage || "",
          views: postView?.views || 0,
        };
      })
    );

    // Sort posts by date descending by default
    posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      props: {
        posts,
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error) {
    console.error("Error reading posts:", error);
    return {
      props: {
        posts: [],
      },
      revalidate: 60,
    };
  }
}
