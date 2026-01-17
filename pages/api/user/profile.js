import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase limit for image uploads
    },
  },
};

export default async function handler(req, res) {
  try {
    await dbConnect();
    const { uid } = req.query;

    if (req.method === 'GET') {
      const user = await User.findById(uid);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json(user);
    } else if (req.method === 'PUT') {
      const updatedUser = await User.findByIdAndUpdate(uid, req.body, { new: true });
      res.status(200).json(updatedUser);
    } else if (req.method === 'DELETE') {
      await User.findByIdAndDelete(uid);
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(405).end();
    }
  } catch (error) {
    console.error("Profile API Error:", error);
    res.status(500).json({ message: error.message });
  }
}