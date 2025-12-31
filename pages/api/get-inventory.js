import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db('refoodify_db');
    console.log('Connected to database, fetching items...');

    const { uid } = req.query;
    let query = { status: 'active' };
    if (uid) {
      query.addedBy = uid;
    }

    const items = await db.collection('inventory')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('Fetched items:', items.length);
    console.log('Sending response...');
    res.status(200).json(items);
    console.log('Response sent successfully');
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}