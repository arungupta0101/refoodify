import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await dbConnect();
    const { email, password } = req.body;

    // Auto-create Admin if trying to login with default credentials
    if (email === 'admin@refoodify.com' && password === 'RefoodifyAdmin@2024!') {
      const adminExists = await User.findOne({ email });
      if (!adminExists) {
        await User.create({
          email,
          password,
          userType: 'admin',
          status: 'Active',
          name: 'Super Admin'
        });
      }
    }

    const user = await User.findOne({ email, password }); // In production, use bcrypt to compare hashed passwords
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.status === 'Banned') {
      return res.status(403).json({ message: 'Account suspended. Contact Admin.' });
    }

    const userData = user.toObject();
    delete userData.password;
    res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Login API Error:", error);
    res.status(500).json({ message: error.message });
  }
}