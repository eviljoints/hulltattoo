// ./src/pages/api/artists.ts

import { NextApiRequest, NextApiResponse } from 'next';

interface Stripe {
  left: string;
  width: string;
  color: string;
}

interface Artist {
  name: string;
  role: string;
  image: string;
  gallery: string;
  facebook?: string;
  instagram?: string;
  artsPage: string;
  stripes: Stripe[];
}

const generateStripes = (): Stripe[] => {
  return [
    { left: "10%", width: "2px", color: "#ff007f" },
    { left: "30%", width: "3px", color: "#00ff7f" },
    { left: "50%", width: "1px", color: "#00d4ff" },
    { left: "70%", width: "2px", color: "#ff007f" },
    { left: "90%", width: "3px", color: "#00ff7f" },
  ];
};

const artists: Artist[] = [
  {
    name: "Mike",
    role: "Sponsored Realism Tattoo Artist",
    image: "/images/mike.png",
    gallery: "/images/mike-gallery.png",
    facebook: "https://facebook.com/Hulltattoostudio",
    instagram: "https://instagram.com/egg_tattooer",
    artsPage: "/mike",
    stripes: generateStripes(),
  },
  {
    name: "Poppy",
    role: "Apprentice Tattoo Artist",
    image: "/images/poppy.png",
    gallery: "/images/poppy-gallery.png",
    instagram: "https://instagram.com/macabre_tattooz",
    artsPage: "/poppy",
    stripes: generateStripes(),
  },
  {
    name: "Harley",
    role: "Apprentice Tattoo Artist",
    image: "/images/harley.png",
    gallery: "/images/harley-gallery.png",
    instagram: "https://instagram.com/harleybovilltattoos",
    artsPage: "/harley",
    stripes: generateStripes(),
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ artists });
}
