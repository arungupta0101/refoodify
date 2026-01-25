import dbConnect from '../../../lib/mongodb';
import { User, Notification } from '../../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await dbConnect();
    const { userId, code } = req.body;

    // 1. Validate Input
    if (!userId || !code) return res.status(400).json({ message: 'Missing data' });

    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // 2. Check if already referred
    if (currentUser.referredBy) {
      return res.status(400).json({ message: 'You have already redeemed a referral code.' });
    }

    // 3. Find Referrer
    const referrer = await User.findOne({ referralCode: code });
    if (!referrer) {
      return res.status(404).json({ message: 'Invalid referral code.' });
    }

    // 4. Prevent Self-Referral
    if (referrer._id.toString() === userId) {
      return res.status(400).json({ message: 'You cannot use your own code.' });
    }

    // 5. Apply Rewards
    // Reward for New User (Redeemer)
    currentUser.referredBy = referrer.referralCode;
    currentUser.points = (currentUser.points || 0) + 50; // 50 pts bonus
    await currentUser.save();

    // Reward for Referrer
    referrer.points = (referrer.points || 0) + 100; // 100 pts bonus
    await referrer.save();

    // 6. Notifications
    await Notification.create({
      userId: currentUser._id,
      message: `Referral success! You earned 50 points.`,
      type: 'info'
    });

    await Notification.create({
      userId: referrer._id,
      message: `Someone used your code! You earned 100 points.`,
      type: 'info'
    });

    res.status(200).json({ message: 'Referral code redeemed successfully! (+50 pts)' });

  } catch (error) {
    console.error("Referral API Error:", error);
    res.status(500).json({ message: error.message });
  }
}