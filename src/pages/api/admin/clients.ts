import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { authenticateAdmin } from "../../../../auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure caller is authenticated (JWT-based or whichever method you use)
  if (!authenticateAdmin(req, res)) return;

  try {
    switch (req.method) {
      case "GET": {
        // Fetch clients, ordering by newest sign-ups first
        const clients = await prisma.client.findMany({
          orderBy: { signUpDate: "desc" }, 
        });
        return res.status(200).json(clients);
      }

      case "POST": {
        const { name, clientId, signUpDate } = req.body;

        if (!name || !clientId) {
          return res.status(400).json({ error: "Name and Client ID are required." });
        }

        // Explicitly set signUpDate or rely on your schema default
        const newClient = await prisma.client.create({
          data: {
            name,
            clientId,
            hours: 0,
            stamps: 0,
            // You can rely on the Prisma default, or override it here:
            signUpDate: signUpDate ? new Date(signUpDate) : new Date(),
          },
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

        // Recalculate stamps based on hours (1 stamp per 4 hours)
        const updatedClient = await prisma.client.update({
          where: { id: Number(id) },
          data: {
            hours: Number(hours),
            stamps: Math.floor(Number(hours) / 4),
          },
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
        // Handle "Record not found" errors gracefully
        return res.status(404).json({ error: "Client not found." });
      }
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
}
