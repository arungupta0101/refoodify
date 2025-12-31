import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('default');

    const donations = await db.collection('donations').find({ status: 'available' }).toArray();
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}