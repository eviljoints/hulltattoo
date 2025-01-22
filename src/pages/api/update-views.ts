// pages/api/update-views.ts

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({ message: "Slug is required" });
  }

  try {
    const existing = await prisma.postView.findUnique({
      where: { slug },
    });

    if (existing) {
      await prisma.postView.update({
        where: { slug },
        data: { views: existing.views + 1 },
      });
    } else {
      await prisma.postView.create({
        data: { slug, views: 1 },
      });
    }

    res.status(200).json({ message: "Views updated" });
  } catch (error) {
    console.error("Error updating views:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
