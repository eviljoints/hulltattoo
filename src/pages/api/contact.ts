import { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// Disable Next.js default body parsing, because we use Formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

// Create an uploads directory if it doesn't exist
const ensureUploadsDir = () => {
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("[contact.ts] Created uploads directory:", uploadDir);
  } else {
    console.log("[contact.ts] Uploads directory already exists:", uploadDir);
  }
  return uploadDir;
};

// Parse the form with Formidable
const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const uploadDir = ensureUploadsDir();

  const form = formidable({
    multiples: true, // allow multiple files per field
    uploadDir,       // specify the uploads directory
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("[contact.ts] Error parsing form:", err);
        return reject(err);
      }
      console.log("[contact.ts] Form fields:", fields);
      console.log("[contact.ts] Form files:", files);
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

    // Basic validation
    if (!name || !emailOrPhone || !message) {
      console.error("[contact.ts] Missing required fields!");
      return res.status(400).json({ error: "All mandatory fields must be filled." });
    }

    // Prepare attachments
    const attachments = [];

    // files can have multiple keys like image0, image1, etc.
    // Each might be a single file object or an array of file objects.
    for (const fileKey of Object.keys(files)) {
      const fileData = files[fileKey];

      // In Formidable v2+ with multiples: true,
      // fileData can be either a single File object or an array of File objects.
      const fileArray = Array.isArray(fileData) ? fileData : [fileData];

      for (const fileObj of fileArray) {
        const file = fileObj as File;
        // Validate that we actually have a file with path
        if (file && file.filepath && file.originalFilename) {
          console.log(`[contact.ts] Preparing attachment from fileKey='${fileKey}'`);
          const fileBuffer = fs.readFileSync(file.filepath);
          attachments.push({
            filename: file.originalFilename,
            content: fileBuffer,
            contentType: file.mimetype || "application/octet-stream",
          });
        }
      }
    }

    console.log("[contact.ts] attachments array:", attachments);

    // Create Nodemailer transporter with debug enabled
    const transporter = nodemailer.createTransport({
      host: "smtppro.zoho.eu",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, // e.g. 'admin@hulltattoostudio.com'
        pass: process.env.EMAIL_PASS,
      },
      logger: true, // log to console
      debug: true,  // include SMTP traffic in the logs
    });

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "admin@hulltattoostudio.com",
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail/Phone: ${emailOrPhone}\nMessage: ${message}`,
      attachments,
    });

    console.log("[contact.ts] Nodemailer send info:", info);

    // If we reach here, the email was sent
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("[contact.ts] Error handling contact form:", error);
    return res.status(500).json({ error: "Error sending email" });
  }
}
