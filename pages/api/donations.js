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
        const donor = await User.findById(donorId);
        const userType = donor?.userType || 'user';
        
        // Calculate points based on rules
        if (type === 'money') {
             pointsEarned = Math.floor(parseInt(amount) / 10) || 0; // 1 point per 10 Rupees
        } else if (type === 'food') {
             if (userType === 'restaurant') {
                 const qty = parseInt(quantity) || 10; 
                 pointsEarned = Math.floor(qty / 10) * 50; // 50 pts per 10kg
                 if (pointsEarned < 50) pointsEarned = 50;
                 if (isEmergency) pointsEarned += 100;
             } else {
                 // Normal User
                 pointsEarned = 100;
                 if (isEmergency) pointsEarned += 200;
             }
        }

        if (donorId) {
          await User.findByIdAndUpdate(donorId, { $inc: { points: pointsEarned } });
        }

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
      res.status(200).json(donations);
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