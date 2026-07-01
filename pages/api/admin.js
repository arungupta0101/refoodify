import dbConnect from '../../lib/mongodb';
import mongoose from 'mongoose';
import checkRateLimit from '../../lib/rateLimit';
import { User, Donation, Volunteer, Faq, Report, Notification } from '../../lib/models';

// Ensure models are registered
// const UserSchema = new mongoose.Schema({}, { strict: false });
// const DonationSchema = new mongoose.Schema({}, { strict: false });

// let User;
// let Donation;

// try {
//   User = mongoose.model('User');
//   Donation = mongoose.model('Donation');
// } catch {
//   User = mongoose.model('User', UserSchema);
//   Donation = mongoose.model('Donation', DonationSchema);
// }

export default async function handler(req, res) {
  // 1. Rate Limiting
  if (!checkRateLimit(req, 20)) {
    return res.status(429).json({ message: 'Too many requests, please try again later.' });
  }

  try {
    await dbConnect();
  } catch (error) {
    return res.status(503).json({ message: 'Database connection failed' });
  }

  // 2. Server-Side Admin Verification
  // In a real app, use getServerSession(req, res, authOptions) to get the logged-in user.
  // For this prototype, we will check a header or assume the request includes the userId to verify against DB.
  // Since the frontend fetch doesn't send auth headers yet, we will simulate security by checking if the user exists and is admin in DB.
  // NOTE: To make this fully secure, you MUST implement NextAuth session checking here.
  
  // For now, we will assume the 'admin' role is protected in the database.
  // Ideally: const session = await getServerSession(req, res, authOptions);
  // if (!session || session.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

  const { method, query } = req;

  if (method === 'GET') {
    const { type } = query;

    try {
      if (type === 'dashboard') {
        const users = await User.countDocuments({});
        const restaurants = await User.countDocuments({ userType: 'restaurant' });
        const ngos = await User.countDocuments({ userType: 'ngo' });
        const donors = await User.countDocuments({ userType: 'donor' });
        const donations = await Donation.find({}).select('amount quantity').lean();
        const activeDonations = await Donation.countDocuments({ status: 'available' });
        const foodSaved = donations.reduce((total, donation) => {
          const amount = Number(donation.amount);
          if (Number.isFinite(amount) && amount > 0) return total + amount;

          const quantityMatch = String(donation.quantity || '').match(/\d+(?:\.\d+)?/);
          if (quantityMatch) return total + Number(quantityMatch[0]);

          return total + 1;
        }, 0);
        
        return res.status(200).json({
          users, restaurants, ngos, donors, donations: donations.length, activeDonations, foodSaved
        });
      }
      
      if (type === 'users') {
        const users = await User.find({}).select('-password');
        return res.status(200).json(users);
      }

      if (type === 'ngos') {
        const ngos = await User.find({ userType: 'ngo' }).select('-password');
        return res.status(200).json(ngos);
      }

      if (type === 'restaurants') {
        const rests = await User.find({ userType: 'restaurant' }).select('-password');
        return res.status(200).json(rests);
      }

      if (type === 'volunteers') {
        const volunteers = await Volunteer.find({}).sort({ submittedAt: -1 });
        return res.status(200).json(volunteers);
      }

      if (type === 'faqs') {
        const faqs = await Faq.find({}).sort({ createdAt: -1 });
        return res.status(200).json(faqs);
      }

      return res.status(200).json([]);
    } catch (error) {
      console.error(`GET /api/admin?type=${type} Error:`, error);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  if (method === 'PUT') {
    const { id, collection, status, reply } = req.body;
    try {
      if (collection === 'users') {
        const user = await User.findByIdAndUpdate(id, { status }, { new: true });
        if (user) {
          await Notification.create({
            userId: user._id,
            message: `Your account status has been updated to: ${status}.`,
            type: 'system'
          });
        }
        return res.status(200).json({ message: 'User status updated' });
      }
      if (collection === 'volunteers') {
        const volunteer = await Volunteer.findByIdAndUpdate(id, { status }, { new: true });
        if (volunteer) {
          await Notification.create({
            userId: volunteer.userId,
            message: `Your volunteer application has been ${status}.`,
            type: 'system'
          });
        }
        return res.status(200).json({ message: 'Volunteer status updated' });
      }
      if (collection === 'faqs') {
        const faq = await Faq.findByIdAndUpdate(id, { status, reply }, { new: true });
        if (faq) {
          await Notification.create({
            userId: faq.userId,
            message: `Admin replied to your report: "${reply}"`,
            type: 'support'
          });
        }
        return res.status(200).json({ message: 'FAQ resolved and reply sent' });
      }
      return res.status(400).json({ message: 'Invalid collection for PUT' });
    } catch (error) {
      console.error('PUT /api/admin Error:', error);
      return res.status(500).json({ message: 'Update failed' });
    }
  }

  if (method === 'DELETE') {
    const { id, collection } = req.body;
    if (!id || !collection) {
      return res.status(400).json({ message: 'ID and collection are required.' });
    }
    try {
      if (collection === 'users') {
        const userToDelete = await User.findById(id);
        if (userToDelete && userToDelete.email === 'admin@refoodify.com') {
          return res.status(403).json({ message: 'Cannot delete the main admin account.' });
        }
        await User.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Deleted' });
      }
      return res.status(400).json({ message: 'Invalid collection for DELETE' });
    } catch (error) {
      console.error('DELETE /api/admin Error:', error);
      return res.status(500).json({ message: 'Delete failed' });
    }
  }
}