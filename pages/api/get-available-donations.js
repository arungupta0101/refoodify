import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. Reference to the 'donations' collection
    const donationsRef = collection(db, 'donations');

    // 2. Query for available donations, ordered by newest first
    const q = query(
      donationsRef, 
      where("status", "==", "available"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    // 3. Map the documents into an array
    const donations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(donations);
  } catch (error) {
    console.error("Get Available Donations Error:", error);
    res.status(500).json({ error: error.message });
  }
}