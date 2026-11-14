# NoirNexus studio shop

This first release is a curated referral shop at `/shop/`, not an independent checkout. The selected products link to the existing NoirNexus Shopify product pages with UTM attribution. Prices, variants, availability and payment remain on Shopify. No Shopify credentials are required and no customer or order data is copied into the studio website.

## Maintaining the selection

Edit `src/data/noirnexus.json` to change the 12 featured products. Images and handles were checked against the connected store on 14 November 2026. This file is a snapshot, not a live API sync. Remove discontinued items or update changed handles when the Shopify catalogue changes. Product cards deliberately omit snapshot prices and purchase availability.

`src/pages/shop.tsx` contains the shop domain and referral-link builder. Update the domain when NoirNexus has its final custom domain, including links in the new gift guide. Keep the introductory prelaunch notice until payments, stock and checkout are verified. Confirm the supplier-dispatch and studio-collection wording before release.

## Before merging

- Review the shop at desktop and mobile widths, including the existing bottom navigation with the extra Shop link.
- Check each external link reaches the intended product, and check delivery and return policies on NoirNexus.
- Review the gift guide and its dated under-£10 claims. Recheck prices before publishing and during future catalogue changes.
- Verify the prelaunch copy remains appropriate. The branch does not remove Shopify password protection or enable sales.

## Next stage

A live catalogue can replace the selection snapshot using a separately configured Shopify Storefront API integration. Set up the sales channel and least-privilege access first; never put an Admin API token into browser code. Then add server-side catalogue refresh, availability handling and error states. A basket and Shopify checkout handover should be a later tested change.

The studio page is an original curated landing page and has a self-referencing canonical URL. It does not duplicate full Shopify product descriptions or publish Offer structured data with potentially stale prices. The gift guide links directly to NoirNexus as well as the local shop page.
