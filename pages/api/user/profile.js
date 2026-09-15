import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';
import mongoose from 'mongoose';

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

    if (!uid) {
      return res.status(400).json({ message: 'UID query parameter is required' });
    }

    if (req.method === 'GET') {
      let user = null;
      if (mongoose.Types.ObjectId.isValid(uid)) {
        user = await User.findById(uid);
      }
      if (!user) {
        user = await User.findOne({ $or: [{ email: uid }, { firebaseUid: uid }] });
      }
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate Referral Code if missing
      if (!user.referralCode) {
        const prefix = (user.name ? user.name.replace(/[^a-zA-Z]/g, '').substring(0, 4) : 'USER').toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        user.referralCode = `${prefix}${randomNum}`;
        await user.save();
      }

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