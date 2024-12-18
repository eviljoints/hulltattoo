// src/pages/api/book.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

// Define the request body interface
interface BookingRequest {
  artistId: string;
  name: string;
  email: string;
  date: string; // ISO string
  message?: string;
}

// Define the response data interface
interface ResponseData {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { artistId, name, email, date, message } = req.body as BookingRequest;

  // Validate required fields
  if (!artistId || !name || !email || !date) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing required fields' });
  }

  // Parse the date
  const bookingDate = dayjs(date);
  if (!bookingDate.isValid()) {
    return res
      .status(400)
      .json({ success: false, message: 'Invalid date format' });
  }

  // Check if the booking is within opening hours
  const dayOfWeek = bookingDate.day(); // 0 (Sunday) - 6 (Saturday)
  const hour = bookingDate.hour();
  const minute = bookingDate.minute();

  let isWithinOpeningHours = false;

  if (dayOfWeek >= 2 && dayOfWeek <= 5) {
    // Tuesday to Friday: 9:30 AM - 3 PM
    if (
      (hour === 9 && minute >= 30) ||
      (hour > 9 && hour < 15) ||
      (hour === 15 && minute === 0)
    ) {
      isWithinOpeningHours = true;
    }
  } else if (dayOfWeek === 6) {
    // Saturday: 11:30 AM - 5 PM
    if (
      (hour === 11 && minute >= 30) ||
      (hour > 11 && hour < 17) ||
      (hour === 17 && minute === 0)
    ) {
      isWithinOpeningHours = true;
    }
  }

  if (!isWithinOpeningHours) {
    return res.status(400).json({
      success: false,
      message: 'Selected time is outside of our opening hours',
    });
  }

  try {
    // Check for double booking
    const existingBooking = await prisma.booking.findUnique({
      where: {
        artistId_date: {
          artistId,
          date: bookingDate.toDate(),
        },
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.',
      });
    }

    // Create the booking
    await prisma.booking.create({
      data: {
        artistId,
        name,
        email,
        date: bookingDate.toDate(),
        message,
      },
    });

    // Send email to the artist
    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST, // e.g., smtp.gmail.com
      port: Number(process.env.EMAIL_SERVER_PORT), // e.g., 587
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER, // your email
        pass: process.env.EMAIL_SERVER_PASS, // your email password or app password
      },
    });

    // Fetch artist's email based on artistId
    const artists = [
      {
        id: '1',
        name: 'Mike',
        contactEmail: 'laycock131@hmail.com',
      },
      {
        id: '2',
        name: 'Poppy',
        contactEmail: 'poppy@example.com',
      },
      {
        id: '3',
        name: 'Harley',
        contactEmail: 'harleybovill1@hotmail.com',
      },
    ];

    const artist = artists.find((a) => a.id === artistId);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found',
      });
    }

    const mailOptions = {
      from: `"${name}" <${email}>`, // sender address
      to: artist.contactEmail, // artist's email
      subject: 'New Tattoo Booking Request',
      text: `Hello ${artist.name},

You have received a new booking request.

Details:
- Name: ${name}
- Email: ${email}
- Date and Time: ${bookingDate.format('dddd, MMMM D, YYYY h:mm A')}
- Message: ${message || 'N/A'}

Please respond to the client to confirm the appointment.

Best regards,
Your Booking System`,
      html: `<p>Hello ${artist.name},</p>
<p>You have received a new booking request.</p>
<ul>
  <li><strong>Name:</strong> ${name}</li>
  <li><strong>Email:</strong> ${email}</li>
  <li><strong>Date and Time:</strong> ${bookingDate.format(
    'dddd, MMMM D, YYYY h:mm A'
  )}</li>
  <li><strong>Message:</strong> ${message || 'N/A'}</li>
</ul>
<p>Please respond to the client to confirm the appointment.</p>
<p>Best regards,<br/>Your Booking System</p>`,
    };

    await transporter.sendMail(mailOptions);

    // Optionally, send a confirmation email to the user
    const userMailOptions = {
      from: `"PepeFloki" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: 'Booking Confirmation',
      text: `Hello ${name},

Thank you for booking an appointment with ${artist.name} on ${bookingDate.format(
        'dddd, MMMM D, YYYY h:mm A'
      )}.

We will notify you once the artist confirms your booking.

Best regards,
PepeFloki Team`,
      html: `<p>Hello ${name},</p>
<p>Thank you for booking an appointment with <strong>${artist.name}</strong> on <strong>${bookingDate.format(
        'dddd, MMMM D, YYYY h:mm A'
      )}</strong>.</p>
<p>We will notify you once the artist confirms your booking.</p>
<p>Best regards,<br/>PepeFloki Team</p>`,
    };

    await transporter.sendMail(userMailOptions);

    return res.status(200).json({
      success: true,
      message: 'Booking request sent successfully',
    });
  } catch (error) {
    console.error('Booking Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process booking request',
    });
  }
}
