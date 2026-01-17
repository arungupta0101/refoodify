import dbConnect from '../../lib/mongodb';
import { Notification } from '../../lib/models';

export default async function handler(req, res) {
  try {
    await dbConnect();
    const { userId } = req.query;

    if (req.method === 'GET') {
      if (!userId) return res.status(400).json({ message: 'User ID required' });
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json(notifications);
    } else if (req.method === 'PUT') {
       const { id } = req.body;
       await Notification.findByIdAndUpdate(id, { read: true });
       res.status(200).json({ message: 'Marked as read' });
    } else {
      res.status(405).end();
    }
  } catch (error) {
    console.error("Notification API Error:", error);
    res.status(500).json({ message: error.message });
  }
}