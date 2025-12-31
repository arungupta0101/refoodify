import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { uid, updates } = req.body;
    const client = await clientPromise;
    const db = client.db('default');

    await db.collection('users').updateOne(
      { _id: uid },
      { $set: updates }
    );

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}