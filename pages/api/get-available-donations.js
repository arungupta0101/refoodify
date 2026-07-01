import dbConnect from '../../lib/mongodb';
import { Donation, User } from '../../lib/models';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { ngoId } = req.query;
    
    // Auto-delete pending/available donations older than 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    await Donation.deleteMany({
      status: { $in: ['pending', 'available'] },
      createdAt: { $lt: twelveHoursAgo }
    });

    // Fetch available donations
    let query = {
      $or: [
        { status: { $in: ['pending', 'available'] } },
        // Show accepted ones only to the NGO who accepted them
        ...(ngoId ? [{ status: 'accepted', ngoId: new mongoose.Types.ObjectId(ngoId) }] : [])
      ]
    };
    
    // Filter out donations ignored by this NGO
    if (ngoId) {
      // Ensure ignoredBy is compared against ObjectId
      query.ignoredBy = { $ne: ngoId };
    }

    const donations = await Donation.find(query).sort({ createdAt: -1 });

    // Map _id to id for frontend compatibility
    const formattedDonations = await Promise.all(donations.map(async doc => {
      const obj = doc.toObject();
      let donorName = 'Restaurant';
      if (obj.donorId) {
        const donor = await User.findById(obj.donorId).select('name organizationName').lean();
        if (donor) donorName = donor.organizationName || donor.name || 'Restaurant';
      }
      return {
        ...obj,
        id: obj._id.toString(),
        donorName
      };
    }));

    res.status(200).json(formattedDonations);
  } catch (error) {
    console.error("Get Available Donations Error:", error);
    res.status(500).json({ error: error.message });
  }
}