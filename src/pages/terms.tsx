// ./src/pages/terms.tsx
import Head from "next/head";
import NextLink from "next/link";
import { Box, Link as ChakraLink } from "@chakra-ui/react";

export default function Terms() {
  const pageUrl = "https://www.hulltattoostudio.com/terms/";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service – Hull Tattoo Studio",
    url: pageUrl,
    provider: {
      "@type": "Organization",
      name: "Hull Tattoo Studio",
      url: "https://www.hulltattoostudio.com",
      telephone: "+44 7940 080790",
      address: {
        "@type": "PostalAddress",
        streetAddress: "255 Hedon Road",
        addressLocality: "Hull",
        postalCode: "HU9 1NQ",
        addressCountry: "GB",
      },
    },
  };

  return (
    <>
      <Head>
        <title>Terms of Service | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="Terms governing bookings, payments, reference-image uploads, and use of Hull Tattoo Studio’s website."
        />
        <link rel="canonical" href={pageUrl} />
        <meta
          property="og:title"
          content="Terms of Service | Hull Tattoo Studio"
        />
        <meta
          property="og:description"
          content="Read the terms covering bookings, Wix checkout, reference images and acceptable use."
        />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <Box
        as="main"
        px={{ base: 4, md: 8 }}
        py={10}
        maxW="900px"
        mx="auto"
        color="white"
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          Terms of Service
        </h1>
        <p>
          <strong>Effective date:</strong> 11 November 2026
        </p>

        <p>
          These Terms of Service (“Terms”) govern your use of the Hull Tattoo
          Studio website and booking services (“Services”). By using our
          Services, you agree to these Terms.
        </p>

        <h2>Who we are</h2>
        <p>
          <strong>Hull Tattoo Studio</strong>
          <br />
          255 Hedon Road, Hull, HU9 1NQ, United Kingdom
          <br />
          Email:{" "}
          <a href="mailto:admin@hulltattoostudio.com">
            admin@hulltattoostudio.com
          </a>
          <br />
          Tel: +44 7940 080790
        </p>

        <h2>Eligibility</h2>
        <p>Tattoo appointments are for adults aged 18 and over.</p>

        <h2>Bookings & Payments</h2>
        <ul>
          <li>
            Final prices and payment options are shown in Wix checkout. Our
            website forms do not collect card details.
          </li>
          <li>
            Check your Wix booking confirmation. Returning to this website after
            checkout does not itself confirm payment or a booking.
          </li>
          <li>
            If a confirmed slot cannot be honoured, we will reschedule or
            refund.
          </li>
        </ul>

        <h3>Cancellations & Changes</h3>
        <p>
          Contact us as early as possible to change or cancel. We may retain
          deposits or apply reasonable charges for late cancellations/no-shows.
          If we cancel, you may request a refund or a new slot.
        </p>

        <h2>Image Uploads & Content</h2>
        <p>
          You may upload up to ten reference images, each no larger than 5 MB.
          You must have rights to any content you upload. You grant us a limited
          licence to store and use uploaded images solely to prepare your design
          and manage your booking. We may remove content we believe is unlawful,
          infringing, or inappropriate.
        </p>

        <h2>Acceptable Use</h2>
        <p>
          Do not misuse the Services, attempt unauthorised access, upload
          unlawful content, or engage in fraud. We may suspend or terminate
          access for violations.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          We use Wix for booking, checkout, enquiries and reference-image
          uploads, and Vercel for hosting and performance measurement. Embedded
          content and linked third-party services have their own terms. Their
          terms apply in addition to these Terms.
        </p>

        <h2>Privacy</h2>
        <p>
          See our{" "}
          <ChakraLink as={NextLink} href="/privacy">
            Privacy Policy
          </ChakraLink>{" "}
          for information on personal data and your rights.
        </p>

        <h2>Availability & Changes</h2>
        <p>
          We do not guarantee uninterrupted service. We may modify or
          discontinue features with reasonable notice where practical.
        </p>

        <h2>Disclaimers</h2>
        <p>
          Except as expressly stated, the Services are provided “as is” without
          warranties of any kind.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, Hull Tattoo Studio is not
          liable for indirect or consequential losses. Our total liability will
          not exceed the amount you paid for the relevant booking.
        </p>

        <h2>Indemnity</h2>
        <p>
          You agree to indemnify Hull Tattoo Studio from claims arising out of
          your breach of these Terms or misuse of the Services.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms are governed by the laws of England and Wales. The courts
          of England and Wales have exclusive jurisdiction.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these Terms. We’ll post the latest version here with a
          new Effective date. Continued use means you accept the changes.
        </p>

        <p>
          <strong>Contact:</strong>{" "}
          <a href="mailto:admin@hulltattoostudio.com">
            admin@hulltattoostudio.com
          </a>
        </p>
      </Box>
    </>
  );
}
