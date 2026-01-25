import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, otp, newPassword } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = (otp || '').toString().trim();
  
  try {
    await dbConnect();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Debugging for Reset Step
    console.log(`🔄 Resetting Password for ${cleanEmail}`);
    
    // Check match and expiry
    if (user.resetOtp !== cleanOtp || new Date(user.resetOtpExpiry).getTime() < Date.now()) {
      console.log('❌ Reset Failed: Invalid/Expired OTP');
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword; // Real app mein hash karna chahiye
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    console.log('✅ Password Reset Successful');
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}