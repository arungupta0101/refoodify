import { db } from '../../lib/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const donationData = req.body;

    // 1. Donation ko 'donations' collection mein save karein
    const docRef = await addDoc(collection(db, 'donations'), {
      ...donationData,
      createdAt: serverTimestamp(), // Firebase server ka time use karein
    });

    // 2. Agar donation type 'food' hai, toh user ke points badhayein (+10 points)
    if (donationData.type === 'food' && donationData.donorId) {
      const userRef = doc(db, 'users', donationData.donorId);
      
      try {
        await updateDoc(userRef, {
          points: increment(10) // Firestore ka automatic increment function
        });
      } catch (userErr) {
        console.error("User points update failed:", userErr.message);
        // Agar user doc nahi milta toh donation toh save ho chuka hai
      }
    }

    res.status(200).json({ 
      message: 'Donation created successfully', 
      id: docRef.id 
    });
  } catch (error) {
    console.error("Donation API Error:", error);
    res.status(500).json({ error: error.message });
  }
}