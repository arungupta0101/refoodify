import dbConnect from '../../lib/mongodb';
import { Inventory } from '../../lib/models';

export default async function handler(req, res) {
  try {
    await dbConnect();
    const { userId, id } = req.query;

    if (req.method === 'GET') {
      if (!userId) return res.status(400).json({ message: 'User ID required' });
      const items = await Inventory.find({ userId }).sort({ createdAt: -1 });
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const isArray = Array.isArray(req.body);
      const rawPayload = isArray ? req.body : [req.body];

      const cleanedPayload = rawPayload.map(item => {
        const copy = { ...item };
        if (!copy._id || copy._id === '' || String(copy._id).startsWith('temp-')) {
          delete copy._id;
        }
        if (!copy.userId) {
          copy.userId = userId || 'guest_user';
        }
        if (!copy.name) {
          copy.name = 'Unnamed Product';
        }
        if (!copy.expiry) {
          copy.expiry = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        }
        return copy;
      });

      if (isArray) {
        const items = await Inventory.insertMany(cleanedPayload);
        return res.status(201).json(items);
      } else {
        const item = await Inventory.create(cleanedPayload[0]);
        return res.status(201).json(item);
      }
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ message: 'Item ID required' });
      await Inventory.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Item deleted' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error("Inventory API Error:", error);
    return res.status(500).json({ message: error.message || 'Server error adding product' });
  }
}