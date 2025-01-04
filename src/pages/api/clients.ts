//src\pages\api\clients.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { name, clientId } = req.query;

    const client = await prisma.client.findFirst({
      where: { name: String(name), clientId: String(clientId) },
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    return res.status(200).json(client);
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
