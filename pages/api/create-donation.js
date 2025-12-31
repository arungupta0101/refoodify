import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const donationData = req.body;
    const client = await clientPromise;
    const db = client.db('default');

    const result = await db.collection('donations').insertOne({
      ...donationData,
      createdAt: new Date(),
    });

    // Update user points if it's a food donation
    if (donationData.type === 'food') {
      await db.collection('users').updateOne(
        { _id: donationData.donorId },
        { $inc: { points: 10 } }
      );
    }

    res.status(200).json({ message: 'Donation created successfully', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}