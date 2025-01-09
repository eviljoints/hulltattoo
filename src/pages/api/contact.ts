import { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import nodemailer from "nodemailer";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILES = 10;

const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE_BYTES,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { fields, files } = await parseForm(req);

    const { name, emailOrPhone, message } = fields;

    // Validate mandatory fields
    if (!name || !emailOrPhone || !message) {
      return res
        .status(400)
        .json({ error: "Please provide your name, email/phone, and message." });
    }

    // Validate total file count and size
    const totalFiles = Object.values(files as Record<string, File | File[]>).reduce(
      (acc, fileList) => acc + (Array.isArray(fileList) ? fileList.length : 1),
      0
    );

    if (totalFiles > MAX_FILES) {
      return res.status(400).json({ error: `You can upload up to ${MAX_FILES} files.` });
    }

    // Prepare email attachments
    const attachments = (
      await Promise.all(
        Object.values(files).flatMap(async (fileList) => {
          const filesArray = Array.isArray(fileList) ? fileList : [fileList];
          return Promise.all(
            filesArray.map(async (fileObj) => {
              const file = fileObj as File;
              const fileBuffer = await fs.readFile(file.filepath);
              return {
                filename: file.originalFilename,
                content: fileBuffer,
                contentType: file.mimetype || "application/octet-stream",
              };
            })
          );
        })
      )
    ).flat();

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtppro.zoho.eu",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "admin@hulltattoostudio.com",
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail/Phone: ${emailOrPhone}\nMessage: ${message}`,
      attachments,
    });

    return res.status(200).json({ message: "Your message has been sent successfully!" });
  } catch (error: any) {
    console.error("[contact.ts] Unexpected error:", error);

    // Handle Formidable errors
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(413)
        .json({ error: `A file exceeds the maximum allowed size of ${MAX_FILE_SIZE_MB} MB.` });
    }

    if (error.message.includes("Request timeout")) {
      return res
        .status(504)
        .json({ error: "The request timed out. Please try again with fewer or smaller files." });
    }

    return res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again later." });
  }
}
