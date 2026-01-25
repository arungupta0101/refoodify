import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, otp } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = (otp || '').toString().trim();
  
  try {
    await dbConnect();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Debugging Log
    console.log(`🔍 Verifying OTP for ${cleanEmail}`);
    console.log(`   Stored in DB: '${user.resetOtp}'`);
    console.log(`   Received:     '${cleanOtp}'`);

    if (!user.resetOtp) {
      console.log('❌ No OTP found in DB for this user');
      return res.status(400).json({ message: 'No OTP requested. Please request a new one.' });
    }

    // Check match and expiry
    if (user.resetOtp !== cleanOtp || new Date(user.resetOtpExpiry).getTime() < Date.now()) {
      console.log('❌ OTP Verification Failed: Mismatch or Expired');
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    console.log('✅ OTP Verified Successfully');
    res.status(200).json({ message: 'OTP Verified' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}