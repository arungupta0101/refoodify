import dbConnect from '../../../lib/mongodb';
import { User, Notification } from '../../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    await dbConnect();
    const { userId } = req.body;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : new Date(0);
    
    // Check if same day
    if (now.toDateString() !== lastCheckIn.toDateString()) {
      user.points += 10; // Daily Visit Reward
      user.lastCheckIn = now;
      await user.save();
      await Notification.create({ userId, message: '🌟 Daily Login Bonus: +10 Points!', type: 'success' });
      return res.status(200).json({ pointsAdded: 10, message: 'Daily bonus collected!' });
    }

    res.status(200).json({ pointsAdded: 0, message: 'Already collected today' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}