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
  description: string;
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
    description: "Mike is a highly skilled tattoo artist with over 8 years of experience specializing in black and gray realism as well as color realism. His precision and artistic eye make him one of the most sought-after tattooists in Hull. As a sponsored artist by Apollo Tattoo Aftercare, Mike ensures top-quality results with exceptional care and professionalism.",
    image: "/images/mike.webp",
    gallery: "/images/mike-gallery.webp",
    facebook: "https://facebook.com/Hulltattoostudio",
    instagram: "https://instagram.com/egg_tattooer",
    artsPage: "/mike",
    stripes: generateStripes(),
  },
  {
    name: "Poppy",
    role: "Apprentice Tattoo Artist",
    description: "Poppy is an emerging talent in the tattoo industry with a passion for blackwork and minimalist designs. She enjoys creating pieces that combine clean lines with artistic flair. Friendly and approachable, Poppy loves working with clients to bring their ideas to life in a unique and meaningful way.",
    image: "/images/poppy.webp",
    gallery: "/images/poppy-gallery.webp",
    instagram: "https://instagram.com/macabre_tattooz",
    artsPage: "/poppy",
    stripes: generateStripes(),
  },
  
  {
    name: "Harley",
    role: "Apprentice Tattoo Artist",
    description: "Harley is the newest addition to the Hull Tattoo Studio team, currently perfecting her skills on fake skin. Her goal is to specialize in blackwork and pointillism tattoos, creating intricate and detailed designs. Harley's dedication to her craft and eagerness to learn make her a promising talent to watch as she hones her artistry.",
    image: "/images/harley.webp",
    gallery: "/images/harley-gallery.webp",
    instagram: "https://www.instagram.com/harleybovilltattoos/",
    artsPage: "/harley",
    stripes: generateStripes(),
  }
  
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ artists });
}
