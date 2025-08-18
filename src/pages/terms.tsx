// ./src/pages/terms.tsx
import Head from 'next/head';
import { Box } from '@chakra-ui/react';

export default function Terms() {
  const pageUrl = 'https://www.hulltattoostudio.com/terms';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TermsOfService',
    name: 'Terms of Service – Hull Tattoo Studio',
    url: pageUrl,
    provider: {
      '@type': 'Organization',
      name: 'Hull Tattoo Studio',
      url: 'https://www.hulltattoostudio.com',
      telephone: '+44 7940 080790',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '255 Hedon Road',
        addressLocality: 'Hull',
        postalCode: 'HU9 1NQ',
        addressCountry: 'GB',
      },
    },
  };

  return (
    <>
      <Head>
        <title>Terms of Service | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="Terms governing bookings, payments, Google OAuth calendar syncing, and use of Hull Tattoo Studio’s website."
        />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="Terms of Service | Hull Tattoo Studio" />
        <meta
          property="og:description"
          content="Read the terms covering bookings, Stripe payments, Google Calendar syncing, and acceptable use."
        />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <Box as="main" px={{ base: 4, md: 8 }} py={10} maxW="900px" mx="auto" color="white">
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Terms of Service</h1>
        <p><strong>Effective date:</strong> 18 August 2025</p>

        <p>
          These Terms of Service (“Terms”) govern your use of the Hull Tattoo Studio website and booking services (“Services”).
          By using our Services, you agree to these Terms.
        </p>

        <h2>Who we are</h2>
        <p>
          <strong>Hull Tattoo Studio</strong><br />
          255 Hedon Road, Hull, HU9 1NQ, United Kingdom<br />
          Email: <a href="mailto:admin@hulltattoostudio.com">admin@hulltattoostudio.com</a><br />
          Tel: +44 7940 080790
        </p>

        <h2>Eligibility</h2>
        <p>You must be 18+ to book a tattoo appointment. If under 18, a parent/guardian must arrange and attend.</p>

        <h2>Bookings & Payments</h2>
        <ul>
          <li>Prices are shown in GBP and processed via Stripe; we do not store full card details.</li>
          <li>A booking is confirmed after successful payment and our confirmation screen/email.</li>
          <li>If a confirmed slot cannot be honoured, we will reschedule or refund.</li>
        </ul>

        <h3>Cancellations & Changes</h3>
        <p>Contact us as early as possible to change or cancel. We may retain deposits or apply reasonable charges for late cancellations/no-shows. If we cancel, you may request a refund or a new slot.</p>

        <h2>Google OAuth & Calendar Sync</h2>
        <p>
          We use Google OAuth to connect an artist’s Google Calendar so confirmed bookings appear on their schedule.
          We may create a calendar event including your name, appointment time, and a brief internal note.
          You can ask us to update or remove your details from the event at any time.
        </p>
        <p>
          We comply with the Google API Services User Data Policy, including the Limited Use requirements:
          data from Google APIs is used only to provide calendar functionality, is not sold, and is not used for advertising.
        </p>

        <h2>Image Uploads & Content</h2>
        <p>
          You may upload up to three reference images. You must have rights to any content you upload.
          You grant us a limited licence to store and use uploaded images solely to prepare your design and manage your booking.
          We may remove content we believe is unlawful, infringing, or inappropriate.
        </p>

        <h2>Acceptable Use</h2>
        <p>Do not misuse the Services, attempt unauthorised access, upload unlawful content, or engage in fraud. We may suspend or terminate access for violations.</p>

        <h2>Third-Party Services</h2>
        <p>We rely on Stripe (payments), Google (Calendar/OAuth), Vercel (hosting), Neon (database), Vercel Blob (image storage), and our email provider. Their terms apply in addition to these Terms.</p>

        <h2>Privacy</h2>
        <p>See our <a href="/privacy">Privacy Policy</a> for information on personal data and your rights.</p>

        <h2>Availability & Changes</h2>
        <p>We do not guarantee uninterrupted service. We may modify or discontinue features with reasonable notice where practical.</p>

        <h2>Disclaimers</h2>
        <p>Except as expressly stated, the Services are provided “as is” without warranties of any kind.</p>

        <h2>Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, Hull Tattoo Studio is not liable for indirect or consequential losses. Our total liability will not exceed the amount you paid for the relevant booking.</p>

        <h2>Indemnity</h2>
        <p>You agree to indemnify Hull Tattoo Studio from claims arising out of your breach of these Terms or misuse of the Services.</p>

        <h2>Governing Law</h2>
        <p>These Terms are governed by the laws of England and Wales. The courts of England and Wales have exclusive jurisdiction.</p>

        <h2>Changes</h2>
        <p>We may update these Terms. We’ll post the latest version here with a new Effective date. Continued use means you accept the changes.</p>

        <p><strong>Contact:</strong> <a href="mailto:admin@hulltattoostudio.com">admin@hulltattoostudio.com</a></p>
      </Box>
    </>
  );
}
