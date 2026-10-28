import dbConnect from '../../lib/mongodb';
import { Notification } from '../../lib/models';

export default async function handler(req, res) {
  try {
    await dbConnect();
    const { userId } = req.query;

    if (req.method === 'GET') {
      if (!userId) return res.status(400).json({ message: 'User ID required' });

      // .lean() = 4x faster, only last 30 relevant notifications
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(30)
        .select('message type read createdAt')
        .lean();

      res.setHeader('Cache-Control', 'private, max-age=30, stale-while-revalidate=30');
      return res.status(200).json(notifications);
    } else if (req.method === 'PUT') {
      const { id } = req.body;
      await Notification.updateOne({ _id: id }, { $set: { read: true } });
      return res.status(200).json({ message: 'Marked as read' });
    } else {
      res.status(405).end();
    }
  } catch (error) {
    console.error('Notification API Error:', error);
    res.status(500).json({ message: error.message });
  }
}