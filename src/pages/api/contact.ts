import { NextApiRequest, NextApiResponse } from "next";
import formidable, { File as FormidableFile } from "formidable";
import nodemailer from "nodemailer";
import prisma from "../../../lib/prisma";
import { File } from "@prisma/client"; // Correctly import File type
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE_MB = 5;
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

    if (!name || !emailOrPhone || !message) {
      return res.status(400).json({ error: "All mandatory fields must be filled." });
    }

    const totalFiles = Object.values(files as Record<string, FormidableFile | FormidableFile[]>).reduce(
      (acc, fileList) => {
        if (Array.isArray(fileList)) {
          return acc + fileList.length;
        } else if (fileList) {
          return acc + 1;
        }
        return acc;
      },
      0
    );

    if (totalFiles > MAX_FILES) {
      return res.status(400).json({ error: `You can upload up to ${MAX_FILES} files.` });
    }

    const fileKeys = Object.keys(files);
    const filePromises = fileKeys.map(async (fileKey) => {
      const fileData = files[fileKey];
      const fileArray = Array.isArray(fileData) ? fileData : [fileData];

      return Promise.all(
        fileArray.map(async (fileObj) => {
          const file = fileObj as FormidableFile;
          if (file && file.filepath && file.originalFilename) {
            const fileBuffer = await fs.readFile(file.filepath);
            const base64Content = fileBuffer.toString("base64");

            const storedFile = await prisma.file.create({
              data: {
                name: file.originalFilename,
                mimetype: file.mimetype || "application/octet-stream",
                content: base64Content,
              },
            });

            return storedFile;
          }
        })
      );
    });

    let fileRecords: File[] = []; // Use File[] here
    try {
      const nestedFileRecords = await Promise.all(filePromises);
      fileRecords = nestedFileRecords.flat().filter(Boolean) as File[];
    } catch (fileError: any) {
      return res.status(500).json({ error: fileError.message || "Error processing files." });
    }

    const attachments = fileRecords.map((file) => ({
      filename: file.name,
      content: Buffer.from(file.content, "base64"),
      contentType: file.mimetype,
    }));

    const transporter = nodemailer.createTransport({
      host: "smtppro.zoho.eu",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "admin@hulltattoostudio.com",
        subject: "New Contact Form Submission",
        text: `Name: ${name}\nEmail/Phone: ${emailOrPhone}\nMessage: ${message}`,
        attachments,
      });
    } catch (emailError) {
      return res.status(500).json({ error: "Failed to send email. Please try again later." });
    }

    const deletePromises = fileRecords.map(async (file) => {
      try {
        await prisma.file.delete({ where: { id: file.id } });
      } catch (deleteError) {
        console.error(`[contact.ts] Error deleting file with ID ${file.id}:`, deleteError);
      }
    });

    await Promise.all(deletePromises);

    return res.status(200).json({ message: "Your message has been sent successfully!" });
  } catch (error: any) {
    console.error("[contact.ts] Unexpected error:", error);
    return res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
  } finally {
    await prisma.$disconnect();
  }
}
