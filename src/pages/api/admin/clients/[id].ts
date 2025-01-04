import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { authenticateAdmin } from "../../../../../auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!authenticateAdmin(req, res)) return;

  const { id } = req.query;

  try {
    if (req.method === "DELETE") {
      await prisma.client.delete({
        where: { id: Number(id) },
      });
      return res.status(204).end();
    }

    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
