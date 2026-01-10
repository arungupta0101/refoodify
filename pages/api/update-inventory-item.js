import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id, updates } = req.body; // 'id' yahan Firestore ki auto-generated Document ID hai

    if (!id) {
      return res.status(400).json({ message: 'Inventory Item ID is required' });
    }

    const itemRef = doc(db, 'inventory', id);

    // 1. Agar item ko 'wasted' mark kiya ja raha hai, toh record copy karein
    if (updates.status === 'wasted') {
      const itemSnap = await getDoc(itemRef);
      
      if (itemSnap.exists()) {
        const itemData = itemSnap.data();
        
        // waste_records collection mein entry karein
        await addDoc(collection(db, 'waste_records'), {
          itemId: id,
          itemName: itemData.name,
          quantity: itemData.quantity,
          unit: itemData.unit,
          reason: updates.wasteReason || 'Expired',
          wastedAt: serverTimestamp(),
          originalExpiry: itemData.expiryDate,
          restaurantId: itemData.addedBy // Tracking ke liye
        });
      }
    }

    // 2. Inventory document ko update karein
    await updateDoc(itemRef, {
      ...updates,
      lastUpdated: serverTimestamp()
    });

    res.status(200).json({ message: 'Inventory item updated successfully in Firestore' });
  } catch (error) {
    console.error("Update Inventory Error:", error);
    res.status(500).json({ error: error.message });
  }
}