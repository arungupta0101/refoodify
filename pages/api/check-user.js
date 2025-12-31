import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.query;
    const client = await clientPromise;
    const db = client.db('default');

    const user = await db.collection('users').findOne({ email });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}