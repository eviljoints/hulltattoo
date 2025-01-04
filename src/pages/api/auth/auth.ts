// src/pages/api/auth/auth.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

/**
 * Returns `true` if the token is valid; otherwise sends a 401 response and returns `false`.
 */
export const authenticateAdmin = (
  req: NextApiRequest,
  res: NextApiResponse
): boolean => {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    res.status(500).json({ error: "Missing JWT_SECRET in environment variables." });
    return false;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized: No Authorization header provided" });
    return false;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized: Bearer token missing" });
    return false;
  }

  try {
    jwt.verify(token, secretKey);
    return true; // Token is valid
  } catch (err) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
    return false;
  }
};
