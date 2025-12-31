import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { uid, email, userType } = req.body;
    const client = await clientPromise;
    const db = client.db('default');

    await db.collection('users').insertOne({
      _id: uid,
      email,
      userType,
      points: 0,
      createdAt: new Date(),
    });

    res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}