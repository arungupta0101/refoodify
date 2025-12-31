import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Received request body:', req.body);
    const { name, quantity, unit, category, expiryDate, barcode, location, addedBy } = req.body;
    console.log('Parsed data:', { name, quantity, unit, category, expiryDate, barcode, location, addedBy });
    
    const client = await clientPromise;
    const db = client.db('refoodify_db');
    console.log('Connected to database');

    const result = await db.collection('inventory').insertOne({
      name,
      quantity: parseFloat(quantity),
      unit,
      category,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      barcode,
      location,
      addedBy,
      status: 'active',
      createdAt: new Date(),
      lastUpdated: new Date()
    });
    console.log('Insert result:', result);

    res.status(200).json({
      message: 'Inventory item added successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}