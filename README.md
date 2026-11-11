# Hull Tattoo Studio website

Next.js Pages Router, React and Chakra UI. Public portfolios and blog content are local; Wix handles services, availability, booking checkout, gift vouchers, contact enquiries and reference-image storage.

## Local development

Use Node 22 and Yarn 1.22.22. Run `yarn install --frozen-lockfile`, then `yarn dev`.

Required public configuration (never put private credentials in NEXT_PUBLIC variables):

- `NEXT_PUBLIC_WIX_CLIENT_ID`
- `NEXT_PUBLIC_WIX_STAFF_MIKE_RESOURCE_ID`
- `NEXT_PUBLIC_WIX_STAFF_HARLEY_RESOURCE_ID`
- `NEXT_PUBLIC_WIX_STAFF_JEN_RESOURCE_ID`
- `NEXT_PUBLIC_WIX_GIFT_CARD_URL` for the existing gift-voucher integration

Server-only: `WIX_CONTACT_SECRET`. Optional endpoint overrides are `WIX_SUBMIT_ENDPOINT` and `WIX_UPLOAD_URLS_ENDPOINT`; otherwise the existing studio Wix functions are used. Configure matching secrets and allowed origins in Wix and Vercel. Local or preview submissions still reach real Wix unless mocked: do not submit test enquiries or bookings against production.

## Validation

- `yarn typecheck`
- `yarn lint`
- `yarn build`
- `yarn test` — production build plus Playwright checks at localhost:3100, with dummy Wix IDs and all browser external traffic mocked/blocked. Requires installed Chrome. No real booking, payment, upload or enquiry is sent. Screenshots and traces go into ignored `test-results/`.

The Playwright build contains dummy public Wix IDs; run `yarn build` again with the intended environment before any separately approved release.

## Content and SEO

Artist portfolios live in `public/images`; homepage card content is in `src/lib/artists.ts`. Articles live in `posts/*.mdx`. Keep existing filename slugs and truthful publication dates. Dates accept `DD.MM.YYYY` or ISO `YYYY-MM-DD`; add `modified` only for substantive edits, with the actual edit date. Each article has a title, excerpt, topic and existing cover image. Keep `public/sitemap.xml` in sync when adding/removing pages; tests verify its retained URLs. Checkout is noindex and omitted from the sitemap. Retired pages return 404 except `/Calendar`, which redirects to booking.

## Deployment

Deploy as a Next.js application on Vercel with Node 22, `yarn install --frozen-lockfile`, and `yarn build`. Do not use static export: the contact proxies and optimized images need server functions. There is no Prisma generation or migration step. Confirm preview/production Wix origins and return URLs. No deployment was performed as part of streamlining.

The preserved Prisma schema and migrations describe historical data, not an active website dependency. `yarn prisma:validate` checks the schema only. See [streamlining notes](docs/streamlining.md) for the booking map, retained data, credentials needing rotation, service retirement and Search Console follow-up.
