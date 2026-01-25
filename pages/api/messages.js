import dbConnect from '../../lib/mongodb';
import { Message } from '../../lib/models';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // For images/audio
    },
  },
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const { user1, user2 } = req.query;
    // Fetch conversation between two users
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } else if (req.method === 'POST') {
    try {
      const message = await Message.create(req.body);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).end();
  }
}