import dbConnect from '../../lib/mongodb';
import { User, Donation, Volunteer, Restaurant, FAQ, Notification } from '../../lib/models';

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === 'GET') {
      const { type } = req.query;
      let data = [];

      if (type === 'dashboard') {
        const users = await User.countDocuments({});
        const restaurants = await User.countDocuments({ userType: 'restaurant' });
        const ngos = await User.countDocuments({ userType: 'ngo' });
        const donors = await User.countDocuments({ userType: 'donor' });
        const donations = await Donation.countDocuments({});
        const activeDonations = await Donation.countDocuments({ status: 'available' });
        const foodSaved = donations * 5; // Mock calculation: 5kg per donation avg
        
        return res.status(200).json({ users, restaurants, ngos, donors, donations, activeDonations, foodSaved });
      }

      if (type === 'users') data = await User.find({ email: { $ne: 'admin@refoodify.com' } });
      else if (type === 'volunteers') data = await Volunteer.find({});
      else if (type === 'faqs') data = await FAQ.find({});
      else if (type === 'ngos') data = await User.find({ userType: 'ngo' });
      else if (type === 'restaurants') data = await User.find({ userType: 'restaurant' });
      
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { action, message, target } = req.body;
      
      if (action === 'broadcast') {
        let query = {};
        if (target && target !== 'all') {
          query = { userType: target };
        }
        
        const users = await User.find(query).select('_id');
        
        const notifications = users.map(u => ({
          userId: u._id,
          message: message,
          type: 'alert',
          read: false,
          createdAt: new Date()
        }));
        
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
        
        return res.status(200).json({ message: `Broadcast sent to ${users.length} users.` });
      }
    }

    if (req.method === 'PUT') {
      const { id, collection, status, reply } = req.body;
      let userId = null;
      let message = '';

      if (collection === 'users') {
        await User.findByIdAndUpdate(id, { status });
      } else if (collection === 'volunteers') {
        const vol = await Volunteer.findByIdAndUpdate(id, { status });
        if (vol) {
          userId = vol.userId;
          message = `Your volunteer request has been ${status}.`;
        }
      } else if (collection === 'faqs') {
        const faq = await FAQ.findByIdAndUpdate(id, { status });
        if (faq) {
          userId = faq.userId;
          message = `Update on your report: ${status}. ${reply ? 'Admin Reply: ' + reply : ''}`;
        }
      }

      if (userId) {
        await Notification.create({ userId, message, type: 'info' });
      }
      return res.status(200).json({ message: 'Updated successfully' });
    }

    if (req.method === 'DELETE') {
      const { id, collection } = req.body;
      if (collection === 'users') {
        const user = await User.findById(id);
        if (user && user.email === 'admin@refoodify.com') {
          return res.status(403).json({ message: 'Cannot delete admin account' });
        }
        await User.findByIdAndDelete(id);
      }
      return res.status(200).json({ message: 'Deleted successfully' });
    }
    
    res.status(405).end();
  } catch (error) {
    console.error("Admin API Error:", error);
    res.status(500).json({ message: error.message });
  }
}