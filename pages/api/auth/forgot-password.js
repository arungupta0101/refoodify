import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';
import { sendOtpEmail } from '../../../lib/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  
  try {
    await dbConnect();

    // 1. Check if user exists
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }
    
    // 2. Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // 3. Atomically update user reset OTP and expiry
    user.resetOtp = otp;
    user.resetOtpExpiry = expiryDate;
    await user.save();

    console.log('--------------------------------');
    console.log(`🔑 OTP generated for ${cleanEmail}: ${otp}`);
    console.log('--------------------------------');

    // 4. Send Email
    const emailUser = (process.env.EMAIL_SERVER_USER || '').trim();
    const emailPass = (process.env.EMAIL_SERVER_PASSWORD || '').trim();
    const hasEmailConfig = Boolean(emailUser && emailPass);

    if (hasEmailConfig) {
      try {
        await sendOtpEmail(cleanEmail, otp);
        return res.status(200).json({ 
          message: 'OTP has been sent to your email. Please check your inbox (and spam folder).' 
        });
      } catch (mailError) {
        console.error('Error sending OTP email:', mailError);
        return res.status(500).json({ 
          message: 'Failed to send OTP email: ' + (mailError.message || 'SMTP service error')
        });
      }
    } else {
      // Fallback for local development when SMTP is not yet configured in .env.local
      console.warn('⚠️ EMAIL_SERVER_USER or EMAIL_SERVER_PASSWORD is missing in .env.local.');
      return res.status(200).json({ 
        message: `OTP generated! (Note: SMTP credentials not set in .env.local; fallback OTP for testing: ${otp})` 
      });
    }
  } catch (error) {
    console.error('Forgot password handler error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
