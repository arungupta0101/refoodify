import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({ message: 'User UID (uid) is required' });
    }

    // Firestore mein document fetch karne ke liye doc reference ka use karein
    // Humne 'users' collection mein UID ko hi Document ID banaya hai
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      return res.status(404).json({ message: 'User profile not found in database' });
    }

    // Document data return karein (id, email, userType, points, name, etc.)
    res.status(200).json({
      uid: userDoc.id,
      ...userDoc.data()
    });
  } catch (error) {
    console.error("Get User API Error:", error);
    res.status(500).json({ error: error.message });
  }
}