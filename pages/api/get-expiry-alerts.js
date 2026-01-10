import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const inventoryRef = collection(db, 'inventory');
    const now = new Date();
    const todayStr = now.toISOString();
    
    // Agle 7 din ki date nikaalne ke liye
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStr = sevenDaysFromNow.toISOString();

    // 1. Fetch Expiring Soon (Agle 7 din mein expire hone waale)
    const soonQuery = query(
      inventoryRef,
      where("status", "==", "active"),
      where("expiryDate", "<=", sevenDaysStr),
      where("expiryDate", ">=", todayStr),
      orderBy("expiryDate", "asc")
    );
    const soonSnapshot = await getDocs(soonQuery);
    const expiringSoon = soonSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Fetch Already Expired (Jo expire ho chuke hain)
    const expiredQuery = query(
      inventoryRef,
      where("status", "==", "active"),
      where("expiryDate", "<", todayStr),
      orderBy("expiryDate", "asc")
    );
    const expiredSnapshot = await getDocs(expiredQuery);
    const expired = expiredSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({
      expiringSoon,
      expired,
      totalAlerts: expiringSoon.length + expired.length
    });
  } catch (error) {
    console.error("Expiry Alert API Error:", error);
    res.status(500).json({ error: error.message });
  }
}