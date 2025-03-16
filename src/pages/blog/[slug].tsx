import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import React from "react";
import {
  Box,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";

// Import your ContactUsModal component
import ContactUsModal from "../../components/ContactUsModal";

interface PostFrontmatter {
  title: string;
  date: string;
  excerpt?: string;
  coverImage?: string;
}

interface BlogPostProps {
  source: MDXRemoteSerializeResult;
  frontMatter: PostFrontmatter;
}

// 1. Chakra (and custom) components to override MDX elements
//    so your headings, paragraphs, etc., match the site style.
//    Plus, we map <ContactUsModal> to allow usage in MDX.
const MDXComponents = {
  // Override <h1> in MDX
  h1: (props: any) => (
    <Heading
      as="h1"
      fontSize={{ base: "3xl", md: "4xl" }}
      color="white"
      mb={4}
      textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
      {...props}
    />
  ),
  // Override <h2> in MDX
  h2: (props: any) => (
    <Heading
      as="h2"
      fontSize={{ base: "2xl", md: "3xl" }}
      color="#ff007f"
      mt={8}
      mb={4}
      textShadow="0 0 5px #00d4ff, 0 0 10px #ff007f"
      {...props}
    />
  ),
  // Override <h3> in MDX
  h3: (props: any) => (
    <Heading
      as="h3"
      fontSize={{ base: "xl", md: "2xl" }}
      color="#00d4ff"
      mt={6}
      mb={3}
      textShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
      {...props}
    />
  ),
  // Override <p> in MDX
  p: (props: any) => (
    <Text
      fontSize="lg"
      color="white"
      mb={4}
      lineHeight="1.8"
      {...props}
    />
  ),
  // Expose <ContactUsModal> to MDX, so <ContactUsModal /> works in your .mdx
  ContactUsModal,
};

export default function BlogPost({ source, frontMatter }: BlogPostProps) {
  return (
    <>
      <Head>
        <title>
          {Array.isArray(frontMatter.title)
            ? frontMatter.title.join(" ")
            : frontMatter.title}{" "}
          | Hull Tattoo Studio
        </title>
        <meta 
          name="description" 
          content={
            frontMatter.excerpt 
              ? frontMatter.excerpt 
              : "Hull Tattoo Studio - quality tattoo services and industry insights."
          } 
        />
        <meta name="robots" content="index, follow" />
      </Head>
      <Box
        // Outer container with radial background
        minH="100vh"
        py={10}
        px={{ base: 4, md: 8 }}
        bgGradient="radial(rgba(54,39,255,0.6), rgba(128,0,128,0.6), rgba(0,0,0,0.6))"
      >
        <Box
          // Inner container for the post content
          maxW="800px"
          mx="auto"
          p={{ base: 4, md: 8 }}
          bg="rgba(0,0,0,0.6)"
          borderRadius="md"
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
        >
          {/* Title (optional if your MDX also has <h1>) */}
          <Heading
            as="h1"
            fontSize={{ base: "3xl", md: "4xl" }}
            color="white"
            textAlign="center"
            mb={4}
            textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
          >
            {frontMatter.title}
          </Heading>

          {/* Optional cover image */}
          {frontMatter.coverImage && (
            <Image
              src={frontMatter.coverImage}
              alt={frontMatter.title}
              width="100%"
              maxH="400px"
              objectFit="cover"
              borderRadius="md"
              my={4}
              boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
            />
          )}

          {/* Date */}
          <Text color="gray.300" fontSize="md" mb={6} textAlign="center">
            {frontMatter.date}
          </Text>

          {/* The actual MDX content with custom Chakra components, including ContactUsModal */}
          <MDXRemote {...source} components={MDXComponents} />
        </Box>
      </Box>
    </>
  );
}

// Dynamically build /blog/[slug] paths from your /posts folder
export const getStaticPaths: GetStaticPaths = async () => {
  const postsDir = path.join(process.cwd(), "posts");
  const filenames = fs.readdirSync(postsDir);

  const paths = filenames.map((name) => {
    const slug = name.replace(/\.mdx?$/, "");
    return { params: { slug } };
  });

  return {
    paths,
    fallback: false, // Return 404 if no matching slug
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  // Read MDX file
  const filePath = path.join(process.cwd(), "posts", slug + ".mdx");
  const fileContents = fs.readFileSync(filePath, "utf8");

  // Parse frontmatter and content
  const { content, data } = matter(fileContents);

  // Serialize MDX
  const mdxSource = await serialize(content, { scope: data });

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
    },
  };
};
