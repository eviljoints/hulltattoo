import NextLink from "next/link";
import { Box, Heading, Text } from "@chakra-ui/react";
import PageSeo from "~/components/PageSeo";
import ContactUsModal from "~/components/ContactUsModal";

export default function Aftercare() {
  return (
    <>
      <PageSeo
        title="Tattoo aftercare advice"
        description="Follow your artist’s instructions for your tattoo and dressing. Read practical aftercare questions and know when to seek medical advice."
        path="/aftercare/"
        image="/images/blog/Aftercare.webp"
      />
      <Box as="main" maxW="900px" mx="auto" px={{ base: 4, md: 8 }} py={10}>
        <Box className="glass-card" p={{ base: 5, md: 10 }}>
          <Heading as="h1" fontSize={{ base: "3xl", md: "5xl" }} mb={8}>
            Tattoo aftercare
          </Heading>
          <div className="article-body">
            <p>
              Follow the instructions your artist gives you for your tattoo and
              dressing. If anything is unclear, contact Hull Tattoo Studio
              before changing the covering or using a new product.
            </p>
            <h2>Cleaning and products</h2>
            <p>
              Wash and dry your hands before touching the tattoo. Ask your
              artist how to clean and dry the area, which product to use and how
              much to apply. Do not pick at peeling skin or scabs.
            </p>
            <h2>Dressings and second skin</h2>
            <p>
              Removal and replacement times depend on the covering used. Follow
              your own artist’s instructions rather than a fixed timetable from
              another tattoo. Tell the artist about any previous reaction to
              adhesives or skincare products.
            </p>
            <h2>Plan around healing</h2>
            <p>
              Ask about swimming, soaking, sun exposure and clothing or
              activities that could rub the area. Healing varies: a set number
              of days is not proof that every tattoo has healed.
            </p>
            <h2>When to get medical advice</h2>
            <p>
              Increasing redness, swelling or pain, or unusual discharge can
              signal a problem. Seek medical advice promptly for suspected
              infection or an allergic reaction. Do not wait for a studio
              message reply if you are concerned about your health.
            </p>
            <p>
              An artist cannot diagnose a medical condition. Do not use an
              antibiotic cream unless a medical professional recommends it, and
              do not stop prescribed medication on the basis of tattoo advice.
            </p>
            <p>
              Read{" "}
              <a href="https://www.torbay.gov.uk/business/licensing/skin-piercing-acupuncture-and-tattooing/tattoo-aftercare/">
                Torbay Council’s tattoo aftercare guidance
              </a>{" "}
              and our{" "}
              <NextLink href="/blog/TattooAftercare/">
                aftercare questions article
              </NextLink>
              . For appointment questions, see the{" "}
              <NextLink href="/#faq-section">FAQ</NextLink>.
            </p>
          </div>
          <Box mt={6}>
            <ContactUsModal />
          </Box>
          <Text mt={4}>
            Studio enquiries: <a href="tel:+447940080790">07940080790</a>
          </Text>
        </Box>
      </Box>
    </>
  );
}
