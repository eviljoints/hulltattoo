// ./pages/api/reviews.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const reviews = await prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ reviews });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { name, rating, comment } = req.body;

    if (!name || !rating || !comment) {
      return res.status(400).json({ error: 'Missing name, rating, or comment.' });
    }

    try {
      const newReview = await prisma.review.create({
        data: {
          name,
          rating: Number(rating),
          comment,
        },
      });

      return res.status(201).json({ message: 'Review added successfully', review: newReview });
    } catch (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
