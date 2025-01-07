// src\pages\api\admin\reviews.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { authenticateAdmin } from "../../../../auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!authenticateAdmin(req, res)) return;

  try {
    switch (req.method) {
      case "GET": {
        const { status } = req.query;

        // Fetch reviews by status
        const reviews = await prisma.review.findMany({
          where: { status: status ? String(status) : undefined },
          orderBy: { createdAt: "desc" },
        });

        return res.status(200).json(reviews);
      }

      case "PATCH": {
        const { id, action } = req.body;

        if (!id || !["approve", "reject"].includes(action)) {
          return res.status(400).json({ error: "Invalid ID or action." });
        }

        const updatedReview = await prisma.review.update({
          where: { id: Number(id) },
          data: { status: action === "approve" ? "approved" : "rejected" },
        });

        return res.status(200).json(updatedReview);
      }

      case "DELETE": {
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: "ID is required to delete a review." });
        }

        await prisma.review.delete({
          where: { id: Number(id) },
        });

        return res.status(204).end();
      }

      default: {
        res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
