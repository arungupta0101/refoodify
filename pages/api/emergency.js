import dbConnect from '../../lib/mongodb';
import { EmergencyNeed, Notification, User } from '../../lib/models';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { ngoId, ngoName, title, description, requiredMeals, location, durationHours } = req.body;
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(durationHours));

      const emergency = await EmergencyNeed.create({
        ngoId,
        ngoName,
        title,
        description,
        requiredMeals,
        location,
        expiresAt
      });

      // Send notifications to all users (Simulating 10km radius broadcast)
      // In a production app with geo-coordinates, we would use $near query here.
      const users = await User.find({ _id: { $ne: ngoId } }).select('_id');
      
      const notifications = users.map(u => ({
        userId: u._id,
        message: `🚨 Emergency Alert: ${title} at ${location}. Help needed!`,
        type: 'alert',
        read: false,
        createdAt: new Date()
      }));
      
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      res.status(201).json(emergency);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const now = new Date();
      const needs = await EmergencyNeed.find({ 
        status: 'active',
        expiresAt: { $gt: now }
      }).sort({ createdAt: -1 });
      res.status(200).json(needs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).end();
  }
}