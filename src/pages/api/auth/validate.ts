// src/pages/api/auth/validate.ts

import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    return res.status(500).json({ error: "Missing JWT_SECRET in environment variables." });
  }

  // Suppose we only allow GET requests for validation
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Typically, you'd set header as 'Authorization: Bearer <token>'
  // or even just 'Authorization: <token>'. Adjust accordingly.
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: No Authorization header provided" });
  }

  // If using Bearer scheme: "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Invalid Authorization header format" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    // If successful, return some data or a success message
    return res.status(200).json({ message: "Token is valid", decoded });
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}
