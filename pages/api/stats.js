import dbConnect from '../../lib/mongodb';
import { User, Donation } from '../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const ngos = await User.countDocuments({ userType: 'ngo' });
    const donors = await User.countDocuments({ userType: 'donor' });
    const donationsCount = await Donation.countDocuments({});
    
    // Logic: 1 Donation = 5 Meals (approx)
    const meals = donationsCount * 5;

    res.status(200).json({
      meals,
      donors,
      ngos
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    res.status(500).json({ message: error.message });
  }
}