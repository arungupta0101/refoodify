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
    // Kyunki humne create-restaurant mein UID ko hi Document ID banaya tha
    const restaurantDoc = await getDoc(doc(db, 'restaurants', uid));

    if (!restaurantDoc.exists()) {
      return res.status(404).json({ message: 'Restaurant profile not found' });
    }

    // Document data return karein
    res.status(200).json({
      id: restaurantDoc.id,
      ...restaurantDoc.data()
    });
  } catch (error) {
    console.error("Get Restaurant API Error:", error);
    res.status(500).json({ error: error.message });
  }
}