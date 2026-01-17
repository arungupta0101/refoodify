import dbConnect from '../../lib/mongodb';
import { Donation } from '../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Auto-delete pending donations older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await Donation.deleteMany({
      status: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    });

    // Fetch available donations (status 'pending' or 'available')
    const donations = await Donation.find({ 
      status: { $in: ['pending', 'available'] } 
    }).sort({ createdAt: -1 });

    // Map _id to id for frontend compatibility
    const formattedDonations = donations.map(doc => {
      const obj = doc.toObject();
      return {
        ...obj,
        id: obj._id.toString()
      };
    });

    res.status(200).json(formattedDonations);
  } catch (error) {
    console.error("Get Available Donations Error:", error);
    res.status(500).json({ error: error.message });
  }
}