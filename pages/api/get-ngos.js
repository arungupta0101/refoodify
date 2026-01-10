import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. 'users' collection ka reference lein
    const usersRef = collection(db, 'users');

    // 2. Query banayein jahan userType 'ngo' ho
    const q = query(usersRef, where("userType", "==", "ngo"));

    const querySnapshot = await getDocs(q);

    // 3. Data ko array mein convert karein
    const ngos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(ngos);
  } catch (error) {
    console.error("Get NGOs API Error:", error);
    res.status(500).json({ error: error.message });
  }
}