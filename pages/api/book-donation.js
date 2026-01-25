import dbConnect from '../../lib/mongodb';
import { Donation, User, Notification } from '../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await dbConnect();
    const { donationId, ngoId } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.status !== 'pending' && donation.status !== 'available') {
      return res.status(400).json({ message: 'Donation already booked or completed' });
    }

    // Update Donation
    donation.status = 'accepted';
    donation.ngoId = ngoId;
    donation.bookedAt = new Date();
    await donation.save();

    // Notify Restaurant
    const ngo = await User.findById(ngoId);
    await Notification.create({
      userId: donation.donorId,
      message: `✅ Your donation has been accepted by ${ngo?.name || 'an NGO'}. They will contact you shortly.`,
      type: 'success'
    });

    res.status(200).json({ message: 'Donation booked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}