import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { uid, updates } = req.body;

    if (!uid) {
      return res.status(400).json({ message: 'User UID is required for updates' });
    }

    // Firestore Doc Reference
    const userRef = doc(db, 'users', uid);

    // Document ko update karein
    await updateDoc(userRef, updates);

    res.status(200).json({ message: 'User updated successfully in Firestore' });
  } catch (error) {
    console.error("Update User API Error:", error);
    res.status(500).json({ error: error.message });
  }
}