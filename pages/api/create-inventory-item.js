import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, quantity, unit, category, expiryDate, barcode, location, addedBy } = req.body;

    // Firestore mein data save karne ke liye addDoc ka use karein
    const docRef = await addDoc(collection(db, 'inventory'), {
      name,
      quantity: parseFloat(quantity),
      unit,
      category,
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
      barcode: barcode || '',
      location: location || '',
      addedBy, // User UID (Restaurant owner)
      status: 'active',
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });

    res.status(200).json({
      message: 'Inventory item added successfully to Firestore',
      id: docRef.id
    });
  } catch (error) {
    console.error('Inventory API Error:', error);
    res.status(500).json({ error: error.message });
  }
}