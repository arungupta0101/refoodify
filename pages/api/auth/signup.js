import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    await dbConnect();
    const { email, password, userType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Auto-verify admin, others are Pending
    const status = email === 'admin@refoodify.com' ? 'Active' : 'Pending';
    const newUser = await User.create({ email, password, userType, status });
    // Return user data (excluding password)
    const user = newUser.toObject();
    delete user.password;
    res.status(201).json({ user });
  } catch (error) {
    console.error("Signup API Error:", error);
    res.status(500).json({ message: error.message });
  }
}