import type { NextApiRequest, NextApiResponse } from "next";
import { allowContactRequest, proxyToWix, shortText } from "~/lib/wixProxy";
export const config = { api: { bodyParser: { sizeLimit: "128kb" } } };
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!allowContactRequest(req, res)) return;
  const {
    firstName,
    lastName,
    email,
    phone,
    message,
    uploads = [],
  } = req.body || {};
  if (
    !shortText(firstName, 100) ||
    !shortText(lastName, 100) ||
    !shortText(email, 254) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !shortText(message, 10000) ||
    (phone !== undefined && (typeof phone !== "string" || phone.length > 40)) ||
    !Array.isArray(uploads) ||
    uploads.length > 10 ||
    uploads.some(
      (u) =>
        !u ||
        !shortText(u.fileId, 500) ||
        !shortText(u.fileType, 100) ||
        !u.fileType.startsWith("image/") ||
        !shortText(u.displayName, 255)
    )
  ) {
    return res
      .status(400)
      .json({
        error: "Please check your name, email, message and image attachments.",
      });
  }
  return proxyToWix(
    process.env.WIX_SUBMIT_ENDPOINT ||
      "https://hulltattoostudio.co.uk/_functions/contactSubmission",
    {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone,
      message: message.trim(),
      uploads: uploads.map(({ fileId, fileType, displayName }) => ({
        fileId,
        fileType,
        displayName,
      })),
    },
    res
  );
}
