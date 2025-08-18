// ./src/pages/privacy.tsx
import Head from 'next/head';
import { Box } from '@chakra-ui/react';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="How Hull Tattoo Studio collects, uses, and protects your personal data. Learn about bookings, payments, calendar syncing, and your privacy rights."
        />
        <link rel="canonical" href="https://www.hulltattoostudio.com/privacy" />
        <meta property="og:title" content="Privacy Policy | Hull Tattoo Studio" />
        <meta property="og:description" content="Learn how we handle your data, including bookings, payments (Stripe) and calendar syncing (Google)." />
        <meta property="og:type" content="website" />
      </Head>
      <Box as="main" px={{ base: 4, md: 8 }} py={10} maxW="900px" mx="auto" color="white">
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Privacy Policy</h1>
        <p><strong>Effective date:</strong> 18 August 2025</p>
        <p>
          Hull Tattoo Studio (“we”, “us”, “our”) respects your privacy. This notice explains what personal data we collect,
          how we use it, and your rights under UK data protection law (UK GDPR and the Data Protection Act 2018).
        </p>

        <h2>Who we are (Data Controller)</h2>
        <p>
          <strong>Hull Tattoo Studio</strong><br />
          255 Hedon Road, Hull, HU9 1NQ, United Kingdom<br />
          Email: <a href="mailto:admin@hulltattoostudio.com">admin@hulltattoostudio.com</a><br />
          Tel: +44 7940 080790
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>Booking details: name, email, artist, service, appointment time, notes.</li>
          <li>Reference images (optional): up to three images you upload to describe your idea.</li>
          <li>Payment metadata: booking ID, amount, currency, Stripe IDs (no card numbers stored).</li>
          <li>Communications: emails we exchange with you.</li>
          <li>Website logs: IP, user-agent, timestamps (security/performance).</li>
          <li>Artist calendar data: appointment info synced to the artist’s Google Calendar.</li>
        </ul>

        <h2>How we use your data (lawful bases)</h2>
        <ul>
          <li><strong>Provide and manage bookings</strong> (Contract).</li>
          <li><strong>Payments</strong> via Stripe (Contract/Legal obligation).</li>
          <li><strong>Artist scheduling</strong> via Google Calendar (Legitimate interests/Contract).</li>
          <li><strong>Customer support</strong> (Legitimate interests).</li>
          <li><strong>Legal and security</strong> (Legal obligation/Legitimate interests).</li>
        </ul>

        <h2>Where your data is stored and shared</h2>
        <p>We use: Stripe (payments), Google (Calendar/OAuth), Vercel (hosting), Neon (database), Vercel Blob (image storage), and our email provider. International transfers may occur with appropriate safeguards. We never sell your data.</p>

        <h2>Retention</h2>
        <ul>
          <li>Bookings & payments: up to 6 years (tax/accounting).</li>
          <li>Uploaded images: up to 12 months after your appointment or upon deletion request.</li>
          <li>Emails/enquiries: typically up to 24 months.</li>
        </ul>

        <h2>Your rights</h2>
        <p>You can request access, rectification, erasure, restriction, portability, and object to certain processing. You can also withdraw consent where applicable.</p>
        <p>Contact: <a href="mailto:admin@hulltattoostudio.com">admin@hulltattoostudio.com</a></p>
        <p>
          If you’re unhappy with our response, complain to the ICO:&nbsp;
          <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noreferrer">ico.org.uk/make-a-complaint/</a>
        </p>

        <h2>Cookies</h2>
        <p>We use essential cookies (e.g., for payments and admin sessions). We do not use advertising cookies. If we enable analytics in future, we’ll update this notice and request consent where required.</p>

        <h2>Google Calendar syncing</h2>
        <p>
          Confirmed appointments may be added to the assigned artist’s Google Calendar (time, name, brief). We store artist
          OAuth tokens securely for syncing. Ask us anytime to remove or update your event details.
        </p>

        <h2>Children</h2>
        <p>Services are intended for persons 18+. If under 18, a parent/guardian must arrange the booking and attend.</p>

        <h2>Security</h2>
        <p>We use technical and organisational measures to protect your data, including encryption in transit, access controls, and hardened infrastructure.</p>

        <h2>Changes</h2>
        <p>We may update this policy. We’ll post the latest version on this page with a new Effective date.</p>

        <p><strong>Contact:</strong> <a href="mailto:admin@hulltattoostudio.com">admin@hulltattoostudio.com</a></p>
      </Box>
    </>
  );
}
