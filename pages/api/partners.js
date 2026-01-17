import dbConnect from '../../lib/mongodb';
import { User, Volunteer } from '../../lib/models';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      const restaurants = await User.find({ userType: 'restaurant' }).select('-password');
      const ngos = await User.find({ userType: 'ngo' }).select('-password');
      const volunteers = await Volunteer.find({}).sort({ submittedAt: -1 });
      
      res.status(200).json({ restaurants, ngos, volunteers });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).end();
  }
}