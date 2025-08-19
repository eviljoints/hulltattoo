// ./src/pages/api/artists.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Stripe = { left: string; width: string; color: string };
type Artist = {
  slug: string;
  name: string;
  role: string;
  description: string;
  image: string;
  gallery: string;
  facebook?: string;
  instagram?: string;
  artsPage: string;
  stripes: Stripe[];
};

const artists: Artist[] = [
  {
    slug: "mike",
    name: "Mike",
    role: "Black & Grey / Colour Realism",
    description:
      "≈12 years’ experience. Specialises in realism and custom pieces.",
    image: "/images/mike.webp",
    gallery: "/images/mike-gallery.webp",
    facebook: "https://www.facebook.com/Hulltattoostudio",
    instagram: "https://www.instagram.com/hull_tattoo_studio/",
    artsPage: "/mike",
    stripes: [
      { left: "10%", width: "10px", color: "#ff007f" },
      { left: "30%", width: "15px", color: "#00d4ff" },
    ],
  },
  {
    slug: "harley",
    name: "Harley",
    role: "Blackwork / Pointillism (Developing)",
    description:
      "Developing artist focusing on blackwork, dotwork and illustrative styles.",
    image: "/images/harley.webp",
    gallery: "/images/harley-gallery.webp",
    instagram: "https://www.instagram.com/hull_tattoo_studio/",
    artsPage: "/harley",
    stripes: [
      { left: "15%", width: "12px", color: "#ff007f" },
      { left: "35%", width: "14px", color: "#00d4ff" },
    ],
  },
  {
    slug: "jen",
    name: "Jen",
    role: "Apprentice of full colour neo traditional",
    description:
      "Developing artist focusing on Neo Trad and full colour work.",
    image: "images/jen/display.webp",
    gallery: "/images/jen-gallery.webp",
    facebook: "https://www.facebook.com/profile.php?id=61575953590191",
    instagram: "https://www.instagram.com/theplanetthieftattoo/",
    artsPage: "/jen",
    stripes: [
      { left: "10%", width: "10px", color: "#ff007f" },
      { left: "30%", width: "15px", color: "#00d4ff" },
    ],
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Cache for 60s at the edge; allow SWR for 5 min
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.status(200).json({ artists });
}
