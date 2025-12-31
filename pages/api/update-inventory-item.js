import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id, updates } = req.body;
    const client = await clientPromise;
    const db = client.db('refoodify_db');

    // If marking as waste, create a waste record
    if (updates.status === 'wasted') {
      const item = await db.collection('inventory').findOne({ _id: new ObjectId(id) });
      if (item) {
        await db.collection('waste_records').insertOne({
          itemId: id,
          itemName: item.name,
          quantity: item.quantity,
          unit: item.unit,
          reason: updates.wasteReason || 'Expired',
          wastedAt: new Date(),
          originalExpiry: item.expiryDate
        });
      }
    }

    const result = await db.collection('inventory').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          lastUpdated: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}