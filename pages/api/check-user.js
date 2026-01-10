import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Firestore mein email ke basis par user dhoondne ke liye query
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    // Agar querySnapshot empty nahi hai, matlab user exists karta hai
    res.status(200).json({ exists: !querySnapshot.empty });
  } catch (error) {
    console.error("Check User API Error:", error);
    res.status(500).json({ error: error.message });
  }
}