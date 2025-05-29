// components/FAQSection.tsx
import React from 'react'
import { Box, VStack, Text, Heading, Link, OrderedList, ListItem } from '@chakra-ui/react'
import MotionSection from './MotionSection'
import NextLink from 'next/link'

const faqs = [
  {
    question: "How do I book an appointment at Hull Tattoo Studio?",
    answer: (
      <>
        You can book your tattoo appointment through multiple convenient methods:
        <OrderedList styleType="decimal" mt={2} mb={2}>
          <ListItem>
            <strong>Book in Person:</strong> Visit our studio at <strong>255 Hedon Road, HU9 1NQ</strong> during our opening hours to discuss your tattoo idea and receive personalized advice.
          </ListItem>
          <ListItem>
            <strong>Message Us on Social Media:</strong> Reach out via our <strong>Facebook</strong> or <strong>Instagram</strong> pages with a detailed description, reference images, and your preferred tattoo size and placement.
          </ListItem>
          <ListItem>
            <strong>Use Our Online Booking Form:</strong> Fill out the form available on each artist’s page to select your preferred date, time, and appointment length. Payments can be made via card, PayPal, or Klarna.
          </ListItem>
        </OrderedList>
        For more detailed information, please refer to our{' '}
        <NextLink href="/blog/Booking" passHref>
          <Link color="teal.500">blog post on booking appointments</Link>
        </NextLink>
        .
      </>
    ),
  },
  {
    question: "What are the requirements to become a tattoo apprentice at Hull Tattoo Studio?",
    answer: (
      <>
        Aspiring tattoo artists must meet the following criteria to apply for an apprenticeship:
        <OrderedList styleType="decimal" mt={2} mb={2}>
          <ListItem>
            <strong>Portfolio:</strong> Submit at least 10 fully finished pieces of artwork demonstrating your drawing skills, understanding of tattoo fundamentals, and variety in styles.
          </ListItem>
          <ListItem>
            <strong>Expectations:</strong> Be prepared to work full-time without pay for the duration of the apprenticeship, typically one to two years.
          </ListItem>
          <ListItem>
            <strong>Research:</strong> Ensure you’ve researched Hull Tattoo Studio’s reputation and artistic standards.
          </ListItem>
          <ListItem>
            <strong>Approach:</strong> Contact us via email at{' '}
            <Link href="mailto:admin@hulltattoostudio.com" color="teal.500">
              admin@hulltattoostudio.com
            </Link>{' '}
            with your portfolio and express your interest.
          </ListItem>
        </OrderedList>
        Learn more in our detailed guide:{' '}
        <NextLink href="/blog/Apprenticeship" passHref>
          <Link color="teal.500">How to Become a Tattoo Apprentice</Link>
        </NextLink>
        .
      </>
    ),
  },
  {
    question: "Can I cover up an existing tattoo at Hull Tattoo Studio?",
    answer: (
      <>
        Yes, we specialize in tattoo cover-ups. Our approach ensures that your new tattoo effectively conceals the old one while reflecting your desired design and style. Factors we consider include the darkness and distinctiveness of the original tattoo, its location, and the design of the new tattoo.
        <br />
        For more insights, check out our{' '}
        <NextLink href="/blog/coverup" passHref>
          <Link color="teal.500">blog post on tattoo cover-ups</Link>
        </NextLink>
        .
      </>
    ),
  },
  {
    question: "What is the aftercare process for a new tattoo?",
    answer: (
      <>
        Proper aftercare is essential for optimal healing and longevity of your tattoo. Follow these steps:
        <OrderedList styleType="decimal" mt={2} mb={2}>
          <ListItem>
            <strong>Initial Cleaning:</strong> After getting your tattoo, we clean it with Apollo Aftercare Cleansing Wash and wrap it in clingfilm for at least an hour.
          </ListItem>
          <ListItem>
            <strong>Washing:</strong> Gently wash the tattoo with lukewarm water and unscented antibacterial soap using your hands.
          </ListItem>
          <ListItem>
            <strong>Drying:</strong> Pat the tattoo dry with a clean towel and allow it to air dry for about 15 minutes.
          </ListItem>
          <ListItem>
            <strong>Applying Cream:</strong> Apply a thin layer of Apollo Aftercare Butter once a day until fully healed.
          </ListItem>
        </OrderedList>
        Avoid activities such as swimming, excessive sweating, and direct sunlight during the healing process. For comprehensive aftercare instructions, visit our{' '}
        <NextLink href="/aftercare" passHref>
          <Link color="teal.500">Tattoo Aftercare page</Link>
        </NextLink>{' '}
        or read our{' '}
        <NextLink href="/blog/TattooAftercare" passHref>
          <Link color="teal.500">Tattoo Aftercare & Healing</Link>
        </NextLink>{' '}
        blog post.
      </>
    ),
  },
  {
    question: "Do you accept walk-ins at Hull Tattoo Studio?",
    answer:
      "Yes, we accept walk-ins when our artists are available. However, we highly recommend booking an appointment in advance to ensure you secure your preferred time and artist.",
  },
  {
    question: "What payment methods are accepted at Hull Tattoo Studio?",
    answer: (
      <>
        We accept a variety of payment methods including cash, bank transfers, card payments, PayPal, and Klarna. Klarna payments are available both in-store and through our social media platforms, with plans to integrate it into our online booking system soon.
      </>
    ),
  },
  {
    question: "How should I prepare for my tattoo appointment?",
    answer: (
      <>
        To ensure the best experience, follow these preparation tips:
        <OrderedList styleType="decimal" mt={2} mb={2}>
          <ListItem>Get a good night&apos;s sleep before your session.</ListItem>
          <ListItem>Stay hydrated and have a meal beforehand.</ListItem>
          <ListItem>Avoid alcohol and drugs prior to getting tattooed.</ListItem>
          <ListItem>Dress comfortably to provide easy access to the tattoo area.</ListItem>
        </OrderedList>
        For more detailed preparation advice, refer to our{' '}
        <NextLink href="/blog/Booking" passHref>
          <Link color="teal.500">booking appointments blog post</Link>
        </NextLink>
        .
      </>
    ),
  },
  {
    question: "What are the steps to become a tattoo apprentice?",
    answer: (
      <>
        Becoming a tattoo apprentice at Hull Tattoo Studio involves several key steps:
        <OrderedList styleType="decimal" mt={2} mb={2}>
          <ListItem>
            <strong>Have the Right Designs in Your Portfolio:</strong> Submit at least 10 fully finished pieces demonstrating your drawing skills and understanding of tattoo fundamentals.
          </ListItem>
          <ListItem>
            <strong>Have the Right Expectations:</strong> Be prepared to work full-time without pay for one to two years.
          </ListItem>
          <ListItem>
            <strong>Research the Right Studios/Mentors:</strong> Ensure Hull Tattoo Studio aligns with your artistic goals.
          </ListItem>
          <ListItem>
            <strong>Approach the Tattoo Shops:</strong> Contact us with your portfolio and express your interest.
          </ListItem>
          <ListItem>
            <strong>During the Apprenticeship:</strong> Engage actively in learning and contribute to the studio&apos;s operations.
          </ListItem>
        </OrderedList>
        For an in-depth guide, read our{' '}
        <NextLink href="/blog/Apprenticeship" passHref>
          <Link color="teal.500">How to Become a Tattoo Apprentice</Link>
        </NextLink>{' '}
        blog post.
      </>
    ),
  },
  {
    question: "Who is Mike at Hull Tattoo Studio?",
    answer: (
      <>
        Mike is one of our lead artists at Hull Tattoo Studio, renowned for his expertise in various styles such as black and grey realism and neo-traditional tattoos. With years of experience and a passion for tattoo artistry, Mike also mentors apprentices and ensures each tattoo meets our high quality standards.
        <br />
        Learn more about Mike on our{' '}
        <NextLink href="/mike" passHref>
          <Link color="teal.500">Mike&apos;s profile page</Link>
        </NextLink>
        .
      </>
    ),
  },
  {
    question: "Where can I find detailed aftercare instructions?",
    answer: (
      <>
        Comprehensive aftercare instructions are available on our{' '}
        <NextLink href="/aftercare" passHref>
          <Link color="teal.500">Tattoo Aftercare page</Link>
        </NextLink>
        . Additionally, our{' '}
        <NextLink href="/blog/TattooAftercare" passHref>
          <Link color="teal.500">Tattoo Aftercare & Healing</Link>
        </NextLink>{' '}
        blog post provides an in-depth guide to ensure your tattoo heals beautifully.
      </>
    ),
  },
]

const FAQSection: React.FC = () => (
  <Box
    as="section"
    bg="transparent"
    color="white"
    w="100%"
    p={8}
    px={{ base: 4, md: 8 }}
    overflowX="hidden"
  >
    <MotionSection
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <Heading
        as="h2"
        size="2xl"
        color="white"
        textAlign="center"
        mb={8}
        textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
      >
        Frequently Asked Questions
      </Heading>
    </MotionSection>

    <VStack spacing={6} align="stretch" maxW="800px" mx="auto">
      {faqs.map((faq, i) => (
        <Box
          key={i}
          bg="rgba(0, 0, 0, 0.5)"
          p={6}
          borderRadius="md"
          boxShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
        >
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            Q: {faq.question}
          </Text>
          <Text fontSize="md" lineHeight="1.8">
            {faq.answer}
          </Text>
        </Box>
      ))}
    </VStack>
  </Box>
)

export default FAQSection
