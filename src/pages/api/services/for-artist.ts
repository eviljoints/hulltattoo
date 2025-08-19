// /src/pages/api/services/for-artist.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/lib/prisma";

/**
 * Public, read-only endpoint that returns ONLY the services linked to an artist.
 * - Filters ServiceOnArtist.active === true
 * - Filters Service.active === true (unless active=0 is passed)
 * - Applies per-artist price override (if present), else uses base price
 * Response shape: { items: Array<{ id, title, priceGBP, basePriceGBP, overridePriceGBP, durationMin, depositGBP, bufferBeforeMin, bufferAfterMin, slug }> }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const artistId = (req.query.artistId as string | undefined)?.trim();
    if (!artistId) return res.status(400).json({ error: "artistId is required" });

    const activeOnly = (req.query.active as string | undefined) !== "0";

    const links = await prisma.serviceOnArtist.findMany({
      where: {
        artistId,
        ...(activeOnly ? { active: true } : {}),
        ...(activeOnly ? { service: { active: true } } : {}),
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            durationMin: true,
            priceGBP: true,
            depositGBP: true,
            bufferBeforeMin: true,
            bufferAfterMin: true,
            active: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const items = links
      .filter(l => l.service) // safety
      .map(l => {
        const base = l.service!.priceGBP;
        const override = l.priceGBP ?? null;
        const effective = override != null ? override : base;
        return {
          id: l.service!.id,
          title: l.service!.title,
          slug: l.service!.slug,
          priceGBP: effective,             // effective price (used by UI)
          basePriceGBP: base,              // for transparency if needed
          overridePriceGBP: override,      // null means no override
          durationMin: l.service!.durationMin,
          depositGBP: l.service!.depositGBP,
          bufferBeforeMin: l.service!.bufferBeforeMin,
          bufferAfterMin: l.service!.bufferAfterMin,
        };
      });

    return res.status(200).json({ items });
  } catch (err: any) {
    console.error("/api/services/for-artist error", err?.message || err);
    return res.status(500).json({ error: "Internal Server Error", detail: err?.message });
  }
}
