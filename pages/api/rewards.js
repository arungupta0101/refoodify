import dbConnect from '../../lib/mongodb';
import { User, Reward } from '../../lib/models';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { userId, rewardName, pointsCost } = req.body;
    
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      if (user.points < pointsCost) {
        return res.status(400).json({ message: 'Insufficient points' });
      }

      // Deduct points
      user.points -= pointsCost;
      await user.save();

      // Create Reward Record
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await Reward.create({ userId, rewardName, pointsCost, code });

      res.status(200).json({ message: 'Reward redeemed!', code, newPoints: user.points });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).end();
  }
}