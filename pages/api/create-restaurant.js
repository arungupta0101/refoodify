import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const restaurantData = req.body;
    const client = await clientPromise;
    const db = client.db('default');

    const result = await db.collection('restaurants').insertOne({
      ...restaurantData,
      createdAt: new Date(),
    });

    res.status(200).json({ message: 'Restaurant created successfully', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}