import { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import fs from "fs";

// Initialize Prisma Client
const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // Set file size limit to 5 MB
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("[contact.ts] Error parsing form:", err);
        return reject(err);
      }
      resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fields, files } = await parseForm(req);

    const { name, emailOrPhone, message } = fields;

    if (!name || !emailOrPhone || !message) {
      return res.status(400).json({ error: "All mandatory fields must be filled." });
    }

    const fileRecords = [];

    // Store files in the database
    for (const fileKey of Object.keys(files)) {
      const fileData = files[fileKey];
      const fileArray = Array.isArray(fileData) ? fileData : [fileData];

      for (const fileObj of fileArray) {
        const file = fileObj as File;

        if (file && file.filepath && file.originalFilename) {
          const fileBuffer = fs.readFileSync(file.filepath);
          const base64Content = fileBuffer.toString("base64");

          const storedFile = await prisma.file.create({
            data: {
              name: file.originalFilename,
              mimetype: file.mimetype || "application/octet-stream",
              content: base64Content,
            },
          });

          fileRecords.push(storedFile);
        }
      }
    }

    // Prepare email attachments from the database
    const attachments = fileRecords.map((file) => ({
      filename: file.name,
      content: Buffer.from(file.content, "base64"),
      contentType: file.mimetype,
    }));

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
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "admin@hulltattoostudio.com",
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail/Phone: ${emailOrPhone}\nMessage: ${message}`,
      attachments,
    });

    console.log("[contact.ts] Email sent:", info);

    // Delete files from the database
    for (const file of fileRecords) {
      await prisma.file.delete({ where: { id: file.id } });
    }

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("[contact.ts] Error handling contact form:", error);
    return res.status(500).json({ error: "Error sending email" });
  }
}
