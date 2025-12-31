import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('default');

    const ngos = await db.collection('users').find({ userType: 'ngo' }).toArray();
    res.status(200).json(ngos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}