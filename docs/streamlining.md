# Website streamlining

No deployment, database changes, remote media deletion or live submissions are part of this work.

## Stage 1: backend cleanup

Portfolios use local files in `public/images`. Homepage cards use the static artist list, now shared in `src/lib/artists.ts`, without a build-time request to a deployed site. Neither uses TattooDesign or Review records. The homepage Google reviews link remains; internal review submission/moderation is retired.

Removed: website loyalty and customer registration/lookup; old admin/auth and database artist/service CRM; incomplete local booking/Stripe flow; ICS calendars and AI marketing generation; Google OAuth; Blob write/management endpoints; Acuity proxy/embed; Redis; unused email/invitation helpers and dependencies. Removed URLs return ordinary 404 responses. `/Calendar` has a relevant redirect to `/book/`. No blanket homepage redirects.

Also removed the disconnected Capacitor wrapper configuration (no native project was present), unused visual components and the example raffle, whose selection state had no real reservation/payment backend. The schema, migrations and existing media remain in place.

The schema and every migration remain unchanged. Historical User, Artist (including Google tokens), Service, ServiceOnArtist, Booking, AvailabilityTemplate, AvailabilityOverride, TattooDesign, Review and LoyaltyClient records may remain remotely. The retained site needs no database connection or migration. Back up and establish retention requirements before a separate, explicitly authorized archival/decommissioning task. Stored media and environment files are untouched.

## Wix flow mapped before edits

`/book?artist=jen|harley|mike` and the profiles use `WixArtistBookingWidget`. Public `NEXT_PUBLIC_WIX_STAFF_*_RESOURCE_ID` values, Wix service UUIDs and staff assignments are preserved. `queryServices().find()` loads services; `availabilityCalendar.queryAvailability({filter:{serviceId:[id],startDate,endDate,resourceId:[staffId]}},{timezone:'Europe/London'})` loads slots. The complete availability entry is stored as `HTS_WIX_CHECKOUT_PAYLOAD` in sessionStorage. `/checkout` passes it unchanged as `bookingsCheckout.slotAvailability` to `redirects.createRedirectSession`, with the same timezone, origin and `/checkout/return` callback. After a mobile preview report, checkout now explicitly requests `useGenericWixPages: true` and `checkIfPublish: false` so Wix uses its standard headless checkout rather than selecting a published full-site page. Final pricing, availability, payment and confirmation remain Wix responsibilities.

Contact: browser POSTs image metadata to `/api/wix-upload-urls`, then PUTs bytes directly to Wix URLs with the original filename parameter. `/api/contact` forwards the enquiry and `{fileId,fileType,displayName}` attachments. Original default Wix function URLs and endpoint variable names remain. The shared secret must be configured server-side. Gift-voucher URLs and artist query parameters are unchanged.

## Manual security/service work

- Rotate the formerly hardcoded private Google ICS feed credential and any fallback admin/Wix credentials ever deployed. No values are recorded here. Revoke historical admin tokens and Google OAuth grants as appropriate.
- Keep Wix client/staff IDs, gift-card URL, `WIX_CONTACT_SECRET`, and `WIX_SUBMIT_ENDPOINT`/`WIX_UPLOAD_URLS_ENDPOINT` where configured. Rotate the contact secret at both ends together.
- After checking older deployments, other integrations and archival requirements, retire unused database, Blob write, Google OAuth, Stripe, SMTP, OpenAI and Redis credentials/services. This branch does not authorize deleting their data or cancelling services.
- Contact rate limiting is best-effort per function instance. Add shared Vercel WAF/rate limits. Verify Wix validates file contents and upload sizes; submitted metadata alone cannot enforce bytes at Wix.
- Verify production/preview Wix allowed origins and return URLs. No real checkout, upload or enquiry was submitted.

## SEO and editorial verification

The 11 original article slugs and publication dates are preserved. Modification dates apply only to substantive content updates. Check the preferred www domain and redirects in Vercel. After an approved deployment, submit the sitemap and inspect representative URLs in Google Search Console. Local checks do not prove rankings, indexing, Core Web Vitals or rich-result eligibility.

Owner checks before release: current opening hours, artist biographies/styles, apprenticeship availability and payment/cancellation terms. Historical-data retention and final policy text need owner review.

## Validation and dependency notes

The framework is now Next.js 15.5.29 (Pages Router retained), with Node 22 configured for Vercel. Image optimization is enabled for local assets and the retained Wix image hosts. Direct Wix bookings/redirect SDK versions are unchanged; staff IDs, services and original slot-entry checkout contracts are preserved. Targeted resolutions patch vulnerable compatible transitive packages (PostCSS/source maps, YAML/MDX and Babel runtime); Sharp and js-cookie are updated for security fixes. Keep these resolutions under review when upgrading their parent packages.

Production-build Playwright coverage uses dummy Wix identifiers and intercepts all external browser traffic. It covers artist/service/appointment selection, the original checkout entry and callback, each profile's staff filtering, gift-voucher destination, service retry, checkout failure/return messaging, contact image/enquiry contracts, all 21 sitemap URLs and eleven articles, removal responses, and desktop/mobile screenshots and horizontal-overflow checks. Direct proxy tests mock fetch and cover validation, forwarding, missing credentials, upstream failure, origin checks and burst limits. Tests never send real bookings, payments, files or messages.

TypeScript, lint, production build and schema validation are checked locally. Production dependency audit is clean at this review; the full audit still reports development-tooling advisories in the ESLint dependency tree. These are not evidence of a deployed exploit, and should be addressed in a separately tested lint-toolchain update. The previous production audit and full-tree audit have different scopes; do not compare their counts as identical measures.

Screenshots/traces are ignored local test artifacts. Live Wix account configuration, real checkout/payment/confirmation, remote upload enforcement, Google Search Console and deployed performance were not tested. Next.js 15 maintenance support is currently scheduled through January 2027; plan the next framework upgrade before then.

Guidance: [Google Article](https://developers.google.com/search/docs/appearance/structured-data/article), [LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business), [structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [Torbay Council aftercare](https://www.torbay.gov.uk/business/licensing/skin-piercing-acupuncture-and-tattooing/tattoo-aftercare/).
