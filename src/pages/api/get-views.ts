// pages/api/get-views.ts

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const postViews = await prisma.postView.findMany();
    const viewMap: Record<string, number> = {};
    postViews.forEach((pv) => {
      viewMap[pv.slug] = pv.views;
    });
    res.status(200).json(viewMap);
  } catch (error) {
    console.error("Error fetching views:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
