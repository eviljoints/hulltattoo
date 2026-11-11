import NextLink from "next/link";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

const questions = [
  {
    title: "How do I book?",
    answer: (
      <>
        Discuss the design, placement and time needed with your artist, then
        choose an artist, service and available slot on the{" "}
        <NextLink href="/book/">booking page</NextLink>. Final prices and
        payment options are shown in Wix checkout. Read the{" "}
        <NextLink href="/blog/Booking/">booking guide</NextLink>.
      </>
    ),
  },
  {
    title: "Where is the studio?",
    answer: (
      <>
        Find us at 255 Hedon Road, Hull, HU9 1NQ. Call{" "}
        <a href="tel:+447940080790">07940080790</a> before making a special trip
        if you need to check artist availability.
      </>
    ),
  },
  {
    title: "Which artist should I choose?",
    answer: (
      <>
        Compare <NextLink href="/mike/">Mike’s realism and cover-ups</NextLink>,{" "}
        <NextLink href="/harley/">
          Harley’s developing dotwork and pointillism
        </NextLink>{" "}
        and{" "}
        <NextLink href="/jen/">Jen’s full-colour neo traditional work</NextLink>
        . Send reference images and ask whether the idea suits the artist before
        booking.
      </>
    ),
  },
  {
    title: "Can you cover an existing tattoo?",
    answer: (
      <>
        A cover-up needs an individual assessment. Send a clear photo,
        approximate size and ideas for the new piece. See{" "}
        <NextLink href="/blog/coverup/">our cover-up guide</NextLink> and Mike’s
        portfolio.
      </>
    ),
  },
  {
    title: "What should I do after my appointment?",
    answer: (
      <>
        Follow the instructions for your tattoo and dressing. Read the{" "}
        <NextLink href="/aftercare/">aftercare guide</NextLink> and ask your
        artist if anything is unclear. Seek medical advice for suspected
        infection or an allergic reaction.
      </>
    ),
  },
  {
    title: "Can I enquire about an apprenticeship?",
    answer: (
      <>
        Read our{" "}
        <NextLink href="/blog/Apprenticeship/">
          portfolio preparation guide
        </NextLink>{" "}
        and email the studio about current opportunities. Discuss supervision,
        hours, payment and costs before committing; availability is not
        guaranteed.
      </>
    ),
  },
  {
    title: "Does returning from checkout confirm my booking?",
    answer: (
      <>
        No. Check your Wix booking confirmation email. If payment or
        confirmation is unclear, contact the studio before booking again.
      </>
    ),
  },
];
export default function FAQSection() {
  return (
    <Box as="section" maxW="850px" mx="auto" px={4} py={8}>
      <Heading as="h2" fontSize={{ base: "3xl", md: "4xl" }} mb={8}>
        Frequently asked questions
      </Heading>
      <VStack spacing={5} align="stretch">
        {questions.map((q) => (
          <Box
            key={q.title}
            className="glass-card"
            p={{ base: 5, md: 7 }}
            textAlign="left"
          >
            <Heading as="h3" fontSize="xl" mb={3}>
              {q.title}
            </Heading>
            <Text lineHeight="1.8">{q.answer}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
