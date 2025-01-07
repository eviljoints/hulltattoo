// pages/blog/index.tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import React from "react";
import NextLink from "next/link";
import {
  Box,
  Heading,
  Text,
  Image,
  Link as ChakraLink,
} from "@chakra-ui/react";

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  coverImage?: string;
}

export default function BlogIndex({ posts }: { posts: PostMeta[] }) {
  return (
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
          Our Blog
        </Heading>

        <Text
          color="gray.300"
          mb={8}
          fontSize="lg"
          textAlign="center"
        >
          Welcome to our Hull Tattoo Studio blog!
        </Text>

        {posts.map((post) => (
          <Box
            key={post.slug}
            mb={8}
            p={4}
            bg="rgba(0,0,0,0.6)"
            borderRadius="md"
            boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
          >
            {/* Cover Image (scaled to ~47%) */}
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
        ))}
      </Box>
    </Box>
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

  // Sort posts by date descending (optional)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    props: {
      posts,
    },
  };
}
