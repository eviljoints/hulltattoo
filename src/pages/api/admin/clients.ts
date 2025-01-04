import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { authenticateAdmin } from "../../../../auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!authenticateAdmin(req, res)) return;

  try {
    switch (req.method) {
      case "GET": {
        const clients = await prisma.client.findMany({
          orderBy: { createdAt: "desc" }, // Order by creation date for better readability
        });
        return res.status(200).json(clients);
      }

      case "POST": {
        const { name, clientId } = req.body;

        if (!name || !clientId) {
          return res.status(400).json({ error: "Name and Client ID are required." });
        }

        const newClient = await prisma.client.create({
          data: { name, clientId, hours: 0, stamps: 0 },
        });
        return res.status(201).json(newClient);
      }

      case "PATCH": {
        const { id, hours } = req.body;

        if (!id || hours === undefined) {
          return res
            .status(400)
            .json({ error: "ID and hours are required for updating a client." });
        }

        const updatedClient = await prisma.client.update({
          where: { id: Number(id) },
          data: { hours: Number(hours), stamps: Math.floor(Number(hours) / 4) }, // Update stamps based on hours
        });
        return res.status(200).json(updatedClient);
      }

      case "DELETE": {
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: "ID is required to delete a client." });
        }

        await prisma.client.delete({
          where: { id: Number(id) },
        });
        return res.status(204).end();
      }

      default: {
        res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        // Handle not found errors gracefully
        return res.status(404).json({ error: "Client not found." });
      }
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
}
