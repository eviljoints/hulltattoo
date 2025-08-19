// /src/pages/api/admin/clients.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/lib/prisma";
import { requireAdmin } from "~/lib/adminAuth";

/**
 * Idempotent backfill from User (CUSTOMER) -> LoyaltyClient.
 * - clientId: prefers user.email, falls back to "USER-{user.id}"
 * - name: user's name or email or "Customer"
 * - signUpDate: user's createdAt
 */
async function backfillUsersToLoyalty() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (customers.length === 0) return;

  await Promise.all(
    customers.map((u) => {
      const clientId = u.email?.trim()
        ? u.email.trim().toLowerCase()
        : `USER-${u.id}`;
      const name =
        (u.name && u.name.trim()) ||
        (u.email && u.email.trim()) ||
        "Customer";

      return prisma.loyaltyClient.upsert({
        where: { clientId },
        update: {}, // keep existing loyalty fields intact
        create: {
          name,
          clientId,
          signUpDate: u.createdAt,
        },
      });
    })
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdmin(req, res))) return;

  try {
    switch (req.method) {
      case "GET": {
        // Ensure any pre-existing customers show up in the new table
        await backfillUsersToLoyalty();

        const q = (req.query.q as string | undefined)?.trim();
        const items = await prisma.loyaltyClient.findMany({
          where: q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { clientId: { contains: q, mode: "insensitive" } },
                ],
              }
            : undefined,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            clientId: true,
            hours: true,
            stamps: true,
            signUpDate: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // IMPORTANT: return an ARRAY (so clients.map works)
        return res.status(200).json(items);
      }

      case "POST": {
        const { name, clientId, signUpDate } = req.body || {};
        if (!name || !clientId) {
          return res
            .status(400)
            .json({ error: "name and clientId are required" });
        }
        const created = await prisma.loyaltyClient.create({
          data: {
            name,
            clientId,
            signUpDate: signUpDate ? new Date(signUpDate) : undefined,
          },
          select: {
            id: true,
            name: true,
            clientId: true,
            hours: true,
            stamps: true,
            signUpDate: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return res.status(201).json(created);
      }

      case "PATCH": {
        const { id, hours, stamps } = req.body || {};
        if (typeof id === "undefined") {
          return res.status(400).json({ error: "id is required" });
        }

        const payload: Record<string, number> = {};
        if (typeof hours === "number" && hours >= 0) payload.hours = hours;
        if (typeof stamps === "number" && stamps >= 0) payload.stamps = stamps;

        const updated = await prisma.loyaltyClient.update({
          where: { id: Number(id) },
          data: payload,
          select: {
            id: true,
            name: true,
            clientId: true,
            hours: true,
            stamps: true,
            signUpDate: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return res.status(200).json(updated);
      }

      case "DELETE": {
        const { id } = req.body || {};
        if (typeof id === "undefined") {
          return res.status(400).json({ error: "id is required" });
        }
        await prisma.loyaltyClient.delete({ where: { id: Number(id) } });
        return res.status(200).json({ ok: true });
      }

      default: {
        res.setHeader("Allow", "GET, POST, PATCH, DELETE");
        return res.status(405).json({ error: "Method Not Allowed" });
      }
    }
  } catch (err: any) {
    console.error("/api/admin/clients error", err?.message || err);
    if (err?.code === "P2002") {
      // unique constraint (e.g., clientId)
      return res.status(409).json({ error: "Record already exists" });
    }
    return res.status(500).json({ error: "Internal Server Error", detail: err?.message });
  }
}
