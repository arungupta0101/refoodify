import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. Last 30 days ki date calculate karein
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 2. Firestore Query (Waste Records fetch karne ke liye)
    const wasteRef = collection(db, 'waste_records');
    const q = query(
      wasteRef, 
      where('wastedAt', '>=', thirtyDaysAgo),
      orderBy('wastedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const wasteRecords = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Firestore timestamp ko JS date mein convert karein agar zaroori ho
      wastedAt: doc.data().wastedAt?.toDate() 
    }));

    // 3. Analytics Calculation (Logic same rahega)
    const totalWaste = wasteRecords.reduce((sum, record) => sum + Number(record.quantity || 0), 0);
    
    const wasteByReason = wasteRecords.reduce((acc, record) => {
      const reason = record.reason || 'Unknown';
      acc[reason] = (acc[reason] || 0) + Number(record.quantity || 0);
      return acc;
    }, {});

    res.status(200).json({
      totalWaste,
      wasteRecords,
      wasteByReason,
      period: 'Last 30 days'
    });
  } catch (error) {
    console.error("Waste Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
}