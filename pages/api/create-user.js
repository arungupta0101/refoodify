import { db } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { uid, email, userType } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ message: 'Missing UID or Email' });
    }

    // Firestore Doc Reference
    const userRef = doc(db, 'users', uid);

    // Data to be saved
    await setDoc(userRef, {
      uid: uid, // String format
      email: email, // String format
      name: email.split('@')[0], // Default name from email (String)
      userType: userType || 'user', // String: 'user', 'ngo', 'restaurant', 'donor'
      points: 0, // Number: Stats/Gamification ke liye zaroori hai
      address: '', // Default Empty String (User profile mein update karega)
      phone: '', // Default Empty String
      createdAt: serverTimestamp(), // Firestore Server Time (Best for indexing)
      status: 'active' // User status track karne ke liye
    });

    res.status(200).json({ message: 'User created successfully in Firestore' });
  } catch (error) {
    console.error("Firestore Create User Error:", error);
    res.status(500).json({ error: error.message });
  }
}