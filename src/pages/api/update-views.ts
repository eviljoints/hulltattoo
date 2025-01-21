// pages/api/update-views.ts

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { slug } = req.body;

    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "Invalid or missing 'slug' in request body." });
    }

    try {
      // Upsert the PostView record: create if it doesn't exist, otherwise increment views
      const postView = await prisma.postView.upsert({
        where: { slug },
        update: { views: { increment: 1 } },
        create: { slug, views: 1 },
      });

      console.log(`Views updated for '${slug}': ${postView.views}`);

      return res.status(200).json({ message: "Views updated successfully", views: postView.views });
    } catch (error) {
      console.error(`Error updating views for '${slug}':`, error);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    // Method Not Allowed
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
