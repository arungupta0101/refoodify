import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('refoodify_db');

    // Get waste records from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const wasteRecords = await db.collection('waste_records')
      .find({ wastedAt: { $gte: thirtyDaysAgo } })
      .sort({ wastedAt: -1 })
      .toArray();

    // Calculate analytics
    const totalWaste = wasteRecords.reduce((sum, record) => sum + record.quantity, 0);
    const wasteByReason = wasteRecords.reduce((acc, record) => {
      acc[record.reason] = (acc[record.reason] || 0) + record.quantity;
      return acc;
    }, {});

    const wasteByCategory = wasteRecords.reduce((acc, record) => {
      // This would need category info from the original item
      // For now, we'll group by reason
      return acc;
    }, {});

    res.status(200).json({
      totalWaste,
      wasteRecords,
      wasteByReason,
      period: 'Last 30 days'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}