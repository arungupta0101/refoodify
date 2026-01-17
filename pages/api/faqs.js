import dbConnect from '../../lib/mongodb';
import { FAQ } from '../../lib/models';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === 'POST') {
      const faq = await FAQ.create(req.body);
      res.status(201).json(faq);
    } else {
      res.status(405).end();
    }
  } catch (error) {
    console.error("FAQ API Error:", error);
    res.status(500).json({ message: error.message });
  }
}