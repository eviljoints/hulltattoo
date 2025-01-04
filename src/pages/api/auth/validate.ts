import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(" ")[1];
  const secretKey = process.env.JWT_SECRET;

  if (!token || !secretKey) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  try {
    jwt.verify(token, secretKey);
    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}
