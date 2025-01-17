// src/pages/blog/index.tsx

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import React from "react";
import NextLink from "next/link";
import Head from "next/head";
import {
  Box,
  Heading,
  Text,
  Image,
  Link as ChakraLink,
} from "@chakra-ui/react";
import Ad from '../../components/Ad'; // Adjust the path accordingly

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  coverImage?: string;
}

// Define your Ad slot ID here
const adSlot = "9465374206"; // Replace with your actual Ad slot ID

export default function BlogIndex({ posts }: { posts: PostMeta[] }) {
  const seoTitle = "Blog | Hull Tattoo Studio";
  const seoDescription =
    "Discover the latest updates, insights, and tattoo advice from Hull Tattoo Studio. Explore our blog to learn about our artists, booking tips, aftercare, and more.";
  const seoImage = "/images/og-image.webp"; 
  const siteUrl = "https://www.hulltattoostudio.com/blog"; 

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="google-adsense-account" content="ca-pub-6959045179650835" />
        <meta name="keywords" content="Tattoo Blog, Hull Tattoo Studio Blog, Tattoo Tips, Aftercare Advice, Artist Stories, Booking Tips, Tattoo Insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph / Facebook Metadata */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content="Discover the latest updates, insights, and tattoo advice from Hull Tattoo Studio. Stay informed and inspired." />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:alt" content="Hull Tattoo Studio Blog Banner" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Hull Tattoo Studio" />
        <meta property="og:locale" content="en_GB" />

        {/* Twitter Metadata */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content="Discover tattoo tips, artist insights, and the latest updates from Hull Tattoo Studio. Explore our blog today!" />
        <meta name="twitter:image" content={seoImage} />
        <meta name="twitter:image:alt" content="Hull Tattoo Studio Blog Banner" />

        {/* Canonical Link */}
        <link rel="canonical" href={siteUrl} />
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
            Hull Tattoo Studio Blog
          </Heading>

          <Text
  color="gray.300"
  mb={8}
  fontSize="lg"
  textAlign="center"
>
  Welcome to Hull Tattoo Studio&rsquo;s blog! Where we&rsquo;ll cover lots of different
  tattoo topics and answer the questions you&rsquo;ve been wanting to ask.
</Text>


          {posts.map((post, index) => (
            <React.Fragment key={post.slug}>
              <Box
                mb={8}
                p={4}
                bg="rgba(0,0,0,0.6)"
                borderRadius="md"
                boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
              >
                {post.coverImage && (
                  <Box display="flex" justifyContent="center" mb={4}>
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      maxW="47%"
                      borderRadius="md"
                      boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
                    />
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
                  <Text color="white" fontSize="md" mb={4}>
                    {post.excerpt}
                  </Text>
                )}

                <ChakraLink
                  as={NextLink}
                  href={`/blog/${post.slug}`}
                  color="#ff007f"
                  fontWeight="bold"
                  _hover={{
                    textDecoration: "underline",
                    color: "#00d4ff",
                  }}
                >
                  Read More
                </ChakraLink>
              </Box>

              {/* Insert Ad after the second post */}
              {index === 1 && (
                <Ad slot={adSlot} />
              )}
            </React.Fragment>
          ))}
        </Box>
      </Box>
    </>
  );
}

// Read frontmatter from each file in /posts
export async function getStaticProps() {
  const postsDir = path.join(process.cwd(), "posts");
  const filenames = fs.readdirSync(postsDir);

  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDir, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);

    // The slug is the filename without .mdx
    const slug = filename.replace(/\.mdx?$/, "");

    return {
      slug,
      title: data.title || "Untitled",
      date: data.date || "",
      excerpt: data.excerpt || "",
      coverImage: data.coverImage || "",
    };
  });

  // Sort posts by date descending
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    props: {
      posts,
    },
  };
}
