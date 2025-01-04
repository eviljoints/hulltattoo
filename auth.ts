import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export const authenticateAdmin = (req: NextApiRequest, res: NextApiResponse): boolean => {
  const token = req.headers.authorization?.split(" ")[1];
  const secretKey = process.env.JWT_SECRET;

  if (!token || !secretKey) {
    res.status(401).json({ error: "Unauthorized: Missing token or secret key" });
    return false;
  }

  try {
    jwt.verify(token, secretKey); // Verify token with the secret key
    return true;
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
    return false;
  }
};
