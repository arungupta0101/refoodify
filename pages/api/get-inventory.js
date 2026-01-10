import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { uid } = req.query;
    console.log('Fetching inventory for user:', uid);

    const inventoryRef = collection(db, 'inventory');
    let q;

    // Filter logic: Agar uid hai toh sirf us restaurant ka data, warna sara active data
    if (uid) {
      q = query(
        inventoryRef,
        where("status", "==", "active"),
        where("addedBy", "==", uid),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        inventoryRef,
        where("status", "==", "active"),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    
    // Data ko array mein map karein
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Fetched ${items.length} inventory items from Firestore`);
    res.status(200).json(items);
    
  } catch (error) {
    console.error('Firestore Inventory API Error:', error);
    res.status(500).json({ error: error.message });
  }
}