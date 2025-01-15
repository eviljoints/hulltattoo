// File: pages/api/clients/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import prisma from "../../../../lib/prisma"; // Adjust path to your prisma client

/**
 * Generates a random integer between 1 and 10,000,
 * checks if it's already taken as a clientId, and repeats if so.
 */
async function generateUniqueClientId(): Promise<string> {
  while (true) {
    const randomNum = Math.floor(Math.random() * 10000) + 1;
    const candidateId = randomNum.toString();

    // Check if this ID is already in use
    const existing = await prisma.client.findUnique({
      where: { clientId: candidateId },
    });
    if (!existing) {
      return candidateId;
    }
    // Otherwise, loop again
  }
}

export default async function registerClientHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { name, email } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({
        error: "Please provide a 'name' in the request body.",
      });
    }
    if (!email) {
      return res.status(400).json({
        error: "Please provide an 'email' in the request body.",
      });
    }

    // Optional email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address." });
    }

    // Generate a unique ID from 1-10000
    const clientId = await generateUniqueClientId();

    // Create the client in the DB
    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        clientId, // e.g. "1234"
      },
    });

    // Send a welcome email to the user
    const transporter = nodemailer.createTransport({
      host: "smtppro.zoho.eu",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, // e.g. "myaccount@zoho.eu"
        pass: process.env.EMAIL_PASS,
      },
    });

    // In the email, list all requested details:
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Hull Tattoo Studio Loyalty Program",
      text: `Hello ${name},

Thank you for signing up for our Loyalty Program!
Here are your details:

Username: ${name}
Client ID: ${clientId}
Email Address Registered: ${email}

Keep track of your hours to earn free sessions. 
We look forward to seeing you soon!

Best regards,
Hull Tattoo Studio`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Client registered successfully.",
      client: {
        id: newClient.id,
        name: newClient.name,
        email: newClient.email,
        clientId: newClient.clientId,
      },
    });
  } catch (error: any) {
    // Check for unique constraint conflict (e.g., email is unique in schema)
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res
        .status(400)
        .json({ error: "This email is already registered. Please use another email." });
    }

    console.error("[registerClientHandler] Error registering client:", error);
    return res.status(500).json({
      error: "An unexpected error occurred. Please try again later.",
    });
  }
}
