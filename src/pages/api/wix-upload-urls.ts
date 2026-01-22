// src/pages/api/wix-upload-urls.ts
import type { NextApiRequest, NextApiResponse } from "next";

const WIX_UPLOAD_URLS_ENDPOINT =
  process.env.WIX_UPLOAD_URLS_ENDPOINT ||
  "https://hulltattoostudio.co.uk/_functions/contactUploadUrls";

const WIX_CONTACT_SECRET = process.env.WIX_CONTACT_SECRET || "bob123";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const wixResp = await fetch(WIX_UPLOAD_URLS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-contact-secret": WIX_CONTACT_SECRET,
      },
      body: JSON.stringify(req.body),
    });

    const text = await wixResp.text();

    console.log("[wix-upload-urls] status:", wixResp.status);
    console.log("[wix-upload-urls] body:", text);

    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    return res.status(wixResp.status).json(data);
  } catch (e: any) {
    console.error("[wix-upload-urls] proxy error:", e?.message);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
