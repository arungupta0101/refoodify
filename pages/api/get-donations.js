import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({ message: 'User UID (uid) is required' });
    }

    // 1. Reference to 'donations' collection
    const donationsRef = collection(db, 'donations');

    // 2. Query: Sirf us user ki donations nikalo (donorId ke basis par)
    // Humne 'orderBy' add kiya hai taaki latest donation sabse upar dikhe
    const q = query(
      donationsRef, 
      where("donorId", "==", uid),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    // 3. Map documents to an array
    const donations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(donations);
  } catch (error) {
    console.error("Get User Donations Error:", error);
    res.status(500).json({ error: error.message });
  }
}