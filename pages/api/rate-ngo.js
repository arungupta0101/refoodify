import dbConnect from '../../lib/mongodb';
import { Donation, User, Notification } from '../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await dbConnect();
    const { donationId, rating, review } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    donation.donorRating = Number(rating);
    donation.donorReview = review;
    await donation.save();

    // Update NGO Rating
    if (donation.ngoId) {
      const ngo = await User.findById(donation.ngoId);
      if (ngo) {
        const currentRating = Number(ngo.rating) || 0;
        const currentCount = Number(ngo.ratingCount) || 0;
        const submittedRating = Number(rating);
        
        const newRating = ((currentRating * currentCount) + submittedRating) / (currentCount + 1);
        
        await User.findByIdAndUpdate(donation.ngoId, {
          rating: newRating,
          ratingCount: currentCount + 1
        });

        // High Rating Reward for NGO
        if (submittedRating >= 4) {
             await User.findByIdAndUpdate(donation.ngoId, { $inc: { points: 50 } });
        }

        await Notification.create({ userId: donation.ngoId, message: `You received a ${submittedRating}⭐ rating from a donor!`, type: 'info' });
      }
    }

    res.status(200).json({ message: 'Rating submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}