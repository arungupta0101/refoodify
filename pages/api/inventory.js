import dbConnect from '../../lib/mongodb';
import { Inventory } from '../../lib/models';

export default async function handler(req, res) {
  try {
    await dbConnect();
    const { userId, id } = req.query;

    if (req.method === 'GET') {
      if (!userId) return res.status(400).json({ message: 'User ID required' });
      const items = await Inventory.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json(items);
    } else if (req.method === 'POST') {
      if (Array.isArray(req.body)) {
        const items = await Inventory.insertMany(req.body);
        res.status(201).json(items);
      } else {
        const item = await Inventory.create(req.body);
        res.status(201).json(item);
      }
    } else if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ message: 'Item ID required' });
      await Inventory.findByIdAndDelete(id);
      res.status(200).json({ message: 'Item deleted' });
    } else {
      res.status(405).end();
    }
  } catch (error) {
    console.error("Inventory API Error:", error);
    res.status(500).json({ message: error.message });
  }
}