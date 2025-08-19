import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/lib/prisma";

/**
 * GET /api/services/for-artist
 * Query:
 *   - artistId?: string
 *   - artistSlug?: string
 *   - artistName?: string   (case-insensitive exact match)
 *   - active?: "0" | "1"    (default "1")
 *
 * Returns only services linked to the artist (ServiceOnArtist.active = true by default)
 * with effective price (override if set, else base).
 * Response:
 * {
 *   artist: { id, name, slug } | null,
 *   items: Array<{
 *     id, title, slug, priceGBP, basePriceGBP, overridePriceGBP,
 *     durationMin, depositGBP, bufferBeforeMin, bufferAfterMin
 *   }>
 * }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const artistIdQ = (req.query.artistId as string | undefined)?.trim();
    const artistSlugQ = (req.query.artistSlug as string | undefined)?.trim();
    const artistNameQ = (req.query.artistName as string | undefined)?.trim();
    const activeOnly = (req.query.active as string | undefined) !== "0";

    // Resolve artist
    let artist = null as null | { id: string; name: string; slug: string | null };

    if (artistIdQ) {
      const a = await prisma.artist.findUnique({
        where: { id: artistIdQ },
        select: { id: true, name: true, slug: true },
      });
      if (a) artist = a;
    } else if (artistSlugQ || artistNameQ) {
      const a = await prisma.artist.findFirst({
        where: {
          AND: [
            artistSlugQ
              ? { slug: { equals: artistSlugQ, mode: "insensitive" } }
              : {},
            artistNameQ
              ? { name: { equals: artistNameQ, mode: "insensitive" } }
              : {},
          ],
        },
        select: { id: true, name: true, slug: true },
      });
      if (a) artist = a;
    }

    if (!artist) {
      return res.status(404).json({ error: "Artist not found", artist: null, items: [] });
    }

    // Pull linked services for this artist
    const links = await prisma.serviceOnArtist.findMany({
      where: {
        artistId: artist.id,
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
      .filter((l) => l.service)
      .map((l) => {
        const base = l.service!.priceGBP;
        const override = l.priceGBP ?? null;
        const effective = override != null ? override : base;
        return {
          id: l.service!.id,
          title: l.service!.title,
          slug: l.service!.slug,
          priceGBP: effective,
          basePriceGBP: base,
          overridePriceGBP: override,
          durationMin: l.service!.durationMin,
          depositGBP: l.service!.depositGBP,
          bufferBeforeMin: l.service!.bufferBeforeMin,
          bufferAfterMin: l.service!.bufferAfterMin,
        };
      });

    return res.status(200).json({ artist, items });
  } catch (err: any) {
    console.error("/api/services/for-artist error", err?.message || err);
    return res.status(500).json({ error: "Internal Server Error", detail: err?.message, artist: null, items: [] });
  }
}
