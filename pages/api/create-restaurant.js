import { db } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { uid, name, address, email, phone, ...otherData } = req.body;

    if (!uid) {
      return res.status(400).json({ message: 'User UID is required' });
    }

    // MongoDB insertOne ki jagah Firestore setDoc ka use
    // Hum 'users' collection mein hi data daal sakte hain userType: 'restaurant' ke saath
    // Ya phir agar aapne 'restaurants' collection alag banayi hai toh niche wala use karein:
    await setDoc(doc(db, 'restaurants', uid), {
      name: name || '',
      address: address || '',
      email: email || '',
      phone: phone || '',
      ...otherData,
      userType: 'restaurant',
      createdAt: serverTimestamp(),
    });

    res.status(200).json({ message: 'Restaurant profile created successfully in Firestore' });
  } catch (error) {
    console.error("Restaurant API Error:", error);
    res.status(500).json({ error: error.message });
  }
}