import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  
  try {
    await dbConnect();
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour from now

    // Use findOneAndUpdate to ensure fields are updated atomically
    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      { $set: { resetOtp: otp, resetOtpExpiry: expiryDate } },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('--------------------------------');
    console.log(`🔑 NEW OTP for ${cleanEmail}: ${otp}`);
    console.log('--------------------------------');
    
    res.status(200).json({ message: 'OTP sent successfully (Check Console)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}