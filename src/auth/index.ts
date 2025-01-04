// /src/auth/index.ts
import { NextApiRequest, NextApiResponse } from "next";

export const authenticateAdmin = (req: NextApiRequest, res: NextApiResponse) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.setHeader("WWW-Authenticate", "Basic realm='Admin Access'");
    res.status(401).end("Unauthorized: Please provide valid credentials");
    return false;
  }

  const token = authHeader.split(" ")[1];
  const decoded = Buffer.from(token, "base64").toString("utf-8");
  const [username, password] = decoded.split(":");

  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "HTC";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "PoppySmellz";

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return true;
  }

  res.status(401).end("Unauthorized: Invalid credentials");
  return false;
};
