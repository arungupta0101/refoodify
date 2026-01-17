import dbConnect from '../../../lib/mongodb';
import { User, Notification } from '../../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await dbConnect();
    const { userId, code } = req.body;
    
    const user = await User.findById(userId);
    if (user.referredBy) return res.status(400).json({ message: 'You have already redeemed a referral code.' });
    if (user.referralCode === code) return res.status(400).json({ message: 'You cannot use your own code.' });

    const referrer = await User.findOne({ referralCode: code });
    if (!referrer) return res.status(404).json({ message: 'Invalid referral code.' });

    // Reward Referrer
    referrer.points += 100;
    await referrer.save();
    await Notification.create({ userId: referrer._id, message: `🎉 Someone used your referral code! +100 Points`, type: 'success' });

    // Reward User (Bonus for using code)
    user.points += 50;
    user.referredBy = referrer._id;
    await user.save();
    await Notification.create({ userId: user._id, message: `Referral Bonus: +50 Points`, type: 'success' });

    res.status(200).json({ message: 'Referral code redeemed successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}