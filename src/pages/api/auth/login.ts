// src/pages/api/auth/login.ts

import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get secrets from environment variables
  const { ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET } = process.env;

  // Make sure essential env vars are set
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
    return res.status(500).json({ error: "Missing required server environment variables." });
  }

  switch (req.method) {
    case "POST": {
      const { username, password } = req.body;

      // Check credentials
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Generate JWT token
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1d" });
        return res.status(200).json({ token });
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    case "GET":
      // If you just visit /api/auth/login in the browser, return a helpful message
      return res.status(200).json({
        message: "Send a POST request to /api/auth/login with {username, password} in the body to obtain a JWT.",
      });

    default:
      // Method not allowed
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
