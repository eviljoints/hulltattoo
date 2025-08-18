// ./src/pages/index.tsx

import React from "react";
import { Box, Grid, Spinner, Center, Flex } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import MotionSection from "../components/MotionSection";
import ArtistCard from "../components/ArtistCard";
import TextCard from "../components/TextCard";
import SEOOptimizedContent from "~/components/Seo";
import HeroTextCard from "~/components/HeroTextCard";

// Dynamically import non-critical components
const ReviewsModal = dynamic(() => import("~/components/ReviewsModal"), { ssr: false });
const ContactUsModal = dynamic(() => import("~/components/ContactUsModal"), { ssr: false });
const FindUsLazy = dynamic(() => import("../components/FindUS"), { ssr: false });
const FAQSection = dynamic(() => import("../components/FAQSection"), { ssr: false });

// Data Interfaces
interface Stripe {
  left: string;
  width: string;
  color: string;
}

interface Artist {
  slug: string; // slugs are strings
  name: string;
  role: string;
  description: string;
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
        <Box color="red.500" fontSize="xl">{error}</Box>
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

  // === JSON‑LD Structured Data ===
  const sameAs = [
    "https://www.instagram.com/hull_tattoo_studio/",
    "https://www.facebook.com/Hulltattoostudio",
    "https://www.youtube.com/@Hulltattoostudio",
    "https://www.tiktok.com/@hulltattoostudio_",
  ];

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    "@id": "https://www.hulltattoostudio.com/#parlor",
    "name": "Hull Tattoo Studio",
    "url": "https://www.hulltattoostudio.com",
    "description":
      "Professional tattoo studio in Hull specialising in black & grey realism, blackwork, fine line, anime, traditional and cover‑ups. Open 7 days: Mon–Fri 09:30–17:00; Sat–Sun 11:30–19:00.",
    "image": "https://www.hulltattoostudio.com/images/og-image.jpg",
    "logo": "https://www.hulltattoostudio.com/images/logo.png",
    "telephone": "+44 7940 080790",
    "priceRange": "££",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "255 Hedon Road",
      "addressLocality": "Hull",
      "postalCode": "HU9 1NQ",
      "addressCountry": "GB"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": 53.744, "longitude": -0.332 },
    "sameAs": sameAs,
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:30",
        "closes": "17:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday", "Sunday"],
        "opens": "11:30",
        "closes": "19:00"
      }
    ],
    "areaServed": "Kingston upon Hull, East Yorkshire"
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.hulltattoostudio.com/#website",
    "url": "https://www.hulltattoostudio.com",
    "name": "Hull Tattoo Studio",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.hulltattoostudio.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.hulltattoostudio.com" },
    { "@type": "ListItem", "position": 2, "name": "Artists", "item": "https://www.hulltattoostudio.com/artists" },
    { "@type": "ListItem", "position": 3, "name": "FAQ", "item": "https://www.hulltattoostudio.com/#faq-section" },
    { "@type": "ListItem", "position": 4, "name": "Blog", "item": "https://www.hulltattoostudio.com/blog" }
  ]
};

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do you take walk‑ins?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We recommend booking to secure your slot, but walk‑ins may be available depending on the day."
        }
      },
      {
        "@type": "Question",
        "name": "How should I care for a new tattoo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Wash gently with mild soap, pat dry, and apply a thin layer of approved aftercare. Avoid soaking and direct sun while healing."
        }
      },
      {
        "@type": "Question",
        "name": "Do you do cover‑ups?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Bring or send clear photos of the existing tattoo and we’ll advise on design, size and expectations."
        }
      }
    ]
  };

  const servicesSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Tattoo Cover‑up",
      "provider": { "@type": "Organization", "name": "Hull Tattoo Studio", "url": "https://www.hulltattoostudio.com" },
      "areaServed": "Hull, East Yorkshire",
      "url": "https://www.hulltattoostudio.com/cover-ups"
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Tattoo Apprenticeship",
      "provider": { "@type": "Organization", "name": "Hull Tattoo Studio", "url": "https://www.hulltattoostudio.com" },
      "url": "https://www.hulltattoostudio.com/blog/Apprenticeship"
    }
  ];

  return (
    <>
      <Head>
        <title>Hull Tattoo Studio | Black & Grey Realism, Blackwork & Cover‑Ups in Hull</title>
        <meta
          name="description"
          content="Hull Tattoo Studio specialises in black & grey realism, blackwork, fine line, anime, traditional and cover‑ups. Open 7 days: Mon–Fri 09:30–17:00; Sat–Sun 11:30–19:00."
        />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        {/* Social / OG */}
        <meta property="og:title" content="Hull Tattoo Studio | Black & Grey Realism, Blackwork & Cover‑Ups in Hull" />
        <meta property="og:description" content="Open 7 days in Hull — Mon–Fri 09:30–17:00; Sat–Sun 11:30–19:00. Book your consultation today." />
        <meta property="og:image" content="https://www.hulltattoostudio.com/images/og-image.jpg" />
        <meta property="og:url" content="https://www.hulltattoostudio.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hull Tattoo Studio | Black & Grey Realism, Blackwork & Cover‑Ups in Hull" />
        <meta name="twitter:description" content="Open 7 days — Mon–Fri 09:30–17:00; Sat–Sun 11:30–19:00." />
        <meta name="twitter:image" content="https://www.hulltattoostudio.com/images/og-image.jpg" />
        <link rel="canonical" href="https://www.hulltattoostudio.com" />
        <link rel="alternate" hrefLang="en-gb" href="https://www.hulltattoostudio.com" />
<link rel="alternate" hrefLang="x-default" href="https://www.hulltattoostudio.com" />


        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchemas[0]) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchemas[1]) }} />
      </Head>

      <MotionSection initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} marginBottom={30} marginTop={30}>
        <HeroTextCard title="WELCOME TO HULL TATTOO STUDIO" />
      </MotionSection>

      <MotionSection initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} marginBottom={16}>
        <TextCard
          title="Custom Tattoos in Hull, Designed Around You"
          description={`
            <p>
              At <strong>Hull Tattoo Studio</strong>, we create meaningful, lasting artwork that reflects your style and vision. Our artists specialise in <strong>black & grey realism</strong>, <strong>blackwork</strong>, <strong>fine line</strong>, <strong>anime</strong>, and <strong>traditional</strong> tattoos, plus expert <strong>cover‑ups</strong>.
            </p>
            <p><em>Open 7 days — Mon–Fri 09:30–17:00; Sat–Sun 11:30–19:00.</em></p>
            <h2 style="color:#ff007f; margin-top: 15px;">Our Services</h2>
            <ul>
              <li>🎨 <strong>Custom Designs</strong> — One‑of‑a‑kind tattoos tailored to you.</li>
              <li>🖤 <strong>Black & Grey Realism</strong> — Depth, shading and intricate detail.</li>
              <li>⚡ <strong>Blackwork & Fine Line</strong> — High‑contrast or delicate precision.</li>
              <li>🖌 <strong>Anime & Traditional</strong> — Bold colour and classic styles.</li>
              <li>🛠 <a href="blog/coverup" style="color:#00d4ff;"><strong>Cover‑Ups & Refreshes</strong></a> — Transform old tattoos.</li>
              <li>📚 <a href="/blog/Apprenticeship" style="color:#00d4ff;"><strong>Tattoo Apprenticeships</strong></a> — Learn with experienced artists.</li>
            </ul>
            <p style="text-align:center; margin-top: 10px;">
              <a href="/mike" style="display:inline-block; padding:10px 20px; background-color:#ff007f; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">
                Book Your Tattoo Consultation Now
              </a>
            </p>
          `}
          footer="Mon–Fri 09:30–17:00 · Sat–Sun 11:30–19:00"
          stripes={[ { left: "10%", width: "10px", color: "#ff007f" }, { left: "30%", width: "15px", color: "#00d4ff" } ]}
        />
      </MotionSection>

      <Center marginBottom={10}>
        <Flex gap={4} flexWrap="wrap" justifyContent="center" width="100%" maxWidth="500px">
          <ReviewsModal
            buttonProps={{
              width: "200px",
              colorScheme: "blue",
              boxShadow: "0 0 10px #00d4ff",
              _hover: { boxShadow: "0 0 20px #00d4ff, 0 0 40px #ff007f", transform: "scale(1.05)" },
              "aria-label": "Read Reviews",
            }}
          />
          <ContactUsModal
            buttonProps={{
              width: "200px",
              colorScheme: "pink",
              boxShadow: "0 0 10px #ff007f",
              _hover: { boxShadow: "0 0 20px #ff007f, 0 0 40px #00d4ff", transform: "scale(1.05)" },
              "aria-label": "Contact Us",
            }}
          />
        </Flex>
      </Center>

      <Box as="main" position="relative" color="pink" width="100%" padding={8} paddingX={{ base: 4, md: 8 }} minHeight="100vh" bg="transparent">
        <Box bgGradient="linear(rgba(54, 0, 92, 0.6), rgba(128, 0, 128, 0.6), rgba(0, 0, 0, 0.6))" borderRadius="md" padding={8} boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5">
          <MotionSection initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.3 }} viewport={{ once: true }} marginBottom={16} marginTop={16}>
            <TextCard
              title="Meet Our Artists"
              description={`
                <p>Meet our talented team at Hull Tattoo Studio—your premier destination for tattoos in Hull.</p>
                <br />
                <p>
                  <strong>Eggtattooer (Mike)</strong> specialises in black & grey and colour realism tattoos (≈12 years’ experience). Sponsored by 
                 <a href="https://fgx1kp-1i.myshopify.com/" style="color:#00d4ff;"><strong> Ink Drop Shop</strong></a>.
                </p>
                <br />
                <p>
                  <strong>Harley</strong> is developing in blackwork and pointillism. Follow her progress on 
                  <a href="/harley" style="color:#00d4ff;">Harley’s Page</a>.
                </p>
              `}
              stripes={[ { left: "10%", width: "10px", color: "#ff007f" }, { left: "30%", width: "15px", color: "#00d4ff" } ]}
            />

            <Box marginTop={10}>
              <TextCard
                title="Apprenticeships & Advice"
                description={`Read practical guidance on our <a href="/blog" style="color:#00d4ff;">blog</a> and start with our <a href="/blog/Apprenticeship" style="color:#00d4ff;">Apprenticeship guide</a>.`}
                stripes={[ { left: "10%", width: "10px", color: "#ff007f" }, { left: "30%", width: "15px", color: "#00d4ff" } ]}
              />
            </Box>

            <Box marginTop={10}>
              <TextCard
                title="Frequently Asked Questions"
                description={`Have questions about services, aftercare, or bookings? Visit our <a href="/#faq-section" style="color:#00d4ff;">FAQ page</a>.`}
                stripes={[ { left: "10%", width: "10px", color: "#ff007f" }, { left: "30%", width: "15px", color: "#00d4ff" } ]}
              />
            </Box>

            <Grid
              templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(auto-fit, minmax(250px, 1fr))" }}
              gap={10}
              marginTop={8}
            >
              {artists?.map((artist, index) => (
                <ArtistCard
                  key={artist.slug || String(index)}
                  name={artist.name}
                  role={artist.role}
                  description={artist.description}
                  image={artist.image}
                  alt={`Portrait of ${artist.name}, tattoo artist at Hull Tattoo Studio in Hull`}
                  gallery={artist.gallery}
                  facebook={artist.facebook}
                  instagram={artist.instagram}
                  artsPage={artist.artsPage}
                  stripes={artist.stripes}
                  priority={index === 0}
                />
              ))}
            </Grid>
          </MotionSection>
        </Box>

        <br />
        <SEOOptimizedContent />

        <Box marginTop={16}>
          <FindUsLazy />
        </Box>
        <Box marginTop={16} id="faq-section">
          <FAQSection />
        </Box>
      </Box>
    </>
  );
};

export const getStaticProps = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/artists`, { headers: { "cache-control": "no-cache" } });
    const data = await res.json();
    return {
      props: { artists: data?.artists ?? [] },
      revalidate: 60,
    };
  } catch (err) {
    console.error(err);
    return {
      props: { artists: [], error: "Failed to load artist data." },
      revalidate: 3600,
    };
  }
};

export default HomePage;
