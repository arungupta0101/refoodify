import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('refoodify_db');

    // Get items expiring in next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringSoon = await db.collection('inventory')
      .find({
        status: 'active',
        expiryDate: {
          $lte: sevenDaysFromNow,
          $gte: new Date()
        }
      })
      .sort({ expiryDate: 1 })
      .toArray();

    // Get already expired items
    const expired = await db.collection('inventory')
      .find({
        status: 'active',
        expiryDate: { $lt: new Date() }
      })
      .sort({ expiryDate: 1 })
      .toArray();

    res.status(200).json({
      expiringSoon,
      expired,
      totalAlerts: expiringSoon.length + expired.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}