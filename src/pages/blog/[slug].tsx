import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import NextLink from "next/link";
import Image from "next/image";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import sharp from "sharp";
import path from "path";
import { Box, Heading, Text, SimpleGrid } from "@chakra-ui/react";
import ContactUsModal from "~/components/ContactUsModal";
import PageSeo from "~/components/PageSeo";
import { allPosts, readPost, remarkHeadingIds, PostMeta } from "~/lib/blog";
import { displayDate } from "~/lib/dates";
import { canonical, SITE_URL, jsonLd } from "~/lib/site";

type Props = {
  source: MDXRemoteSerializeResult;
  post: PostMeta;
  related: PostMeta[];
  toc: { title: string; id: string }[];
  images: Record<string, { width: number; height: number }>;
};
export default function BlogPost({
  source,
  post,
  related,
  toc,
  images,
}: Props) {
  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [SITE_URL + post.coverImage],
    datePublished: post.date,
    ...(post.modified ? { dateModified: post.modified } : {}),
    author: {
      "@type": "Organization",
      name: "Hull Tattoo Studio",
      url: canonical("/"),
    },
    publisher: {
      "@type": "Organization",
      name: "Hull Tattoo Studio",
      url: canonical("/"),
    },
    mainEntityOfPage: canonical(`/blog/${post.slug}`),
  };
  const components = {
    ContactUsModal,
    img: ({ src, alt }: any) => {
      const size = images[src];
      return size ? (
        <Image
          src={src}
          alt={alt || "Tattoo artwork from Hull Tattoo Studio"}
          width={size.width}
          height={size.height}
          sizes="(max-width:800px) 100vw, 760px"
          style={{ height: "auto", width: "100%" }}
        />
      ) : (
        <span>{alt}</span>
      );
    },
  };
  return (
    <>
      <PageSeo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}/`}
        image={post.coverImage}
        article
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(article) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: canonical("/"),
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Blog",
                  item: canonical("/blog"),
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: post.title,
                  item: canonical(`/blog/${post.slug}`),
                },
              ],
            }),
          }}
        />
      </Head>
      <Box
        className="blog-page"
        as="main"
        maxW="1040px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={8}
      >
        <nav aria-label="Breadcrumb">
          <NextLink href="/">Home</NextLink> /{" "}
          <NextLink href="/blog/">Blog</NextLink> / <span>{post.topic}</span>
        </nav>
        <Box as="article" className="glass-card" mt={5} p={{ base: 5, md: 10 }}>
          <Text color="cyan.200" mb={3}>
            {post.topic}
          </Text>
          <Heading
            as="h1"
            fontSize={{ base: "3xl", md: "5xl" }}
            lineHeight="1.2"
            mb={5}
          >
            {post.title}
          </Heading>
          <Text color="gray.300" mb={3}>
            By Hull Tattoo Studio · Published{" "}
            <time dateTime={post.date}>{displayDate(post.date)}</time>
            {post.modified && (
              <>
                {" "}
                · Updated{" "}
                <time dateTime={post.modified}>
                  {displayDate(post.modified)}
                </time>
              </>
            )}
          </Text>
          <Text fontSize="lg" lineHeight="1.8" mb={6}>
            {post.excerpt}
          </Text>
          <Box
            position="relative"
            height={{ base: "230px", md: "400px" }}
            mb={8}
          >
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width:800px) 100vw, 900px"
              style={{ objectFit: "cover", borderRadius: 12 }}
            />
          </Box>
          {toc.length > 0 && (
            <Box
              as="nav"
              aria-label="In this article"
              className="article-toc"
              mb={8}
            >
              <Text fontWeight="bold" mb={3}>
                In this article
              </Text>
              <ul>
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.title}</a>
                  </li>
                ))}
              </ul>
            </Box>
          )}
          <div className="article-body">
            <MDXRemote {...source} components={components} />
          </div>
          <Box
            as="aside"
            borderTop="1px solid #444"
            mt={8}
            pt={6}
            textAlign="left"
          >
            <Heading as="h2" fontSize="2xl" mb={3}>
              Plan your next step
            </Heading>
            <Text lineHeight="1.8">
              Explore{" "}
              <NextLink href="/mike/">Mike’s realism and cover-ups</NextLink>,{" "}
              <NextLink href="/harley/">Harley’s dotwork</NextLink> and{" "}
              <NextLink href="/jen/">
                Jen’s colour neo traditional work
              </NextLink>
              . Discuss your idea before choosing a slot on our{" "}
              <NextLink href="/book/">booking page</NextLink>. For practical
              questions, visit the <NextLink href="/#faq-section">FAQ</NextLink>{" "}
              and <NextLink href="/aftercare/">aftercare guide</NextLink>.
            </Text>
            <Box mt={4}>
              <ContactUsModal />
            </Box>
          </Box>
        </Box>
        <Box as="section" mt={10} aria-labelledby="related-heading">
          <Heading id="related-heading" as="h2" fontSize="2xl" mb={5}>
            Related reading
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            {related.map((p) => (
              <Box key={p.slug} className="glass-card" p={5} textAlign="left">
                <NextLink href={`/blog/${p.slug}/`}>
                  <Text color="cyan.200" fontSize="sm">
                    {p.topic}
                  </Text>
                  <Heading as="h3" fontSize="lg" my={3}>
                    {p.title}
                  </Heading>
                  <Text>{p.excerpt}</Text>
                </NextLink>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
        <Box mt={8}>
          <NextLink href="/blog/">← All articles</NextLink>
        </Box>
      </Box>
    </>
  );
}
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: allPosts().map((p) => ({ params: { slug: p.slug } })),
  fallback: false,
});
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { meta: post, body, toc } = readPost(params.slug as string);
  const posts = allPosts().filter((p) => p.slug !== post.slug);
  const related = [
    ...posts.filter((p) => p.topic === post.topic),
    ...posts.filter((p) => p.topic !== post.topic),
  ].slice(0, 3);
  const images: Props["images"] = {};
  for (const match of body.matchAll(/!\[[^\]]*\]\((\/[^)]+)\)/g)) {
    const src = match[1];
    const file = path.resolve("public", "." + src);
    if (!file.startsWith(path.resolve("public") + path.sep)) continue;
    const metadata = await sharp(file).metadata();
    images[src] = { width: metadata.width, height: metadata.height };
  }
  return {
    props: {
      post,
      related,
      toc,
      images,
      source: await serialize(body, {
        mdxOptions: { remarkPlugins: [remarkHeadingIds] },
      }),
    },
  };
};
