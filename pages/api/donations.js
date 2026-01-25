import dbConnect from '../../lib/mongodb';
import { Donation, Volunteer, User, Notification } from '../../lib/models';

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === 'POST') {
      const { type, amount, donorId, userId, isEmergency, location, city } = req.body;
      let pointsEarned = 0;

      if (type === 'volunteer') {
        const vol = await Volunteer.create(req.body);
        // 50 Points for joining as a volunteer
        pointsEarned = 50;
        if (userId) {
          await User.findByIdAndUpdate(userId, { $inc: { points: pointsEarned } });
        }
        return res.status(201).json({ ...vol.toObject(), pointsEarned });
      } else {
        const donation = await Donation.create(req.body);
        
        // Points are NOT awarded at creation. They are awarded upon verification.
        pointsEarned = 0;

        // Notify NGOs in the area
        if (type === 'food') {
          const searchLocation = city || location || '';
          if (searchLocation) {
            const ngos = await User.find({ 
              userType: 'ngo',
              $or: [
                { address: { $regex: searchLocation, $options: 'i' } },
                { coverageArea: { $regex: searchLocation, $options: 'i' } }
              ]
            });

            const notifications = ngos.map(ngo => ({
              userId: ngo._id,
              message: `🍲 New Food Donation at ${location}! Click to view and verify.`,
              type: 'alert',
              read: false
            }));

            if (notifications.length > 0) await Notification.insertMany(notifications);
          }
        }

        return res.status(201).json({ ...donation.toObject(), pointsEarned });
      }
    } else if (req.method === 'GET') {
      const { userId } = req.query;
      const donations = await Donation.find({ donorId: userId }).sort({ createdAt: -1 });
      
      const donationsWithNames = await Promise.all(donations.map(async (d) => {
        const obj = d.toObject();
        if (obj.ngoId) {
          const ngo = await User.findById(obj.ngoId);
          if (ngo) obj.ngoName = ngo.organizationName || ngo.name || 'NGO';
        }
        return obj;
      }));
      res.status(200).json(donationsWithNames);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      await Donation.findByIdAndDelete(id);
      res.status(200).json({ message: 'Donation deleted successfully' });
    } else {
      res.status(405).end();
    }
  } catch (error) {
    console.error("Donations API Error:", error);
    res.status(500).json({ message: error.message });
  }
}