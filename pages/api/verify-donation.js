import dbConnect from '../../lib/mongodb';
import { Donation, User, Notification } from '../../lib/models';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await dbConnect();
    const { donationId, ngoId, rating, review, photo } = req.body;

    if (!photo) return res.status(400).json({ message: 'Verification photo is required' });

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    // Update Donation
    donation.ngoId = ngoId;
    donation.verified = true;
    donation.verificationRating = Number(rating);
    donation.verificationReview = review;
    donation.verificationPhoto = photo;
    donation.status = 'completed';
    await donation.save();

    // Update Donor Rating & Points
    if (donation.donorId) {
      const donor = await User.findById(donation.donorId);
      if (donor) {
        const currentRating = Number(donor.rating) || 0;
        const currentCount = Number(donor.ratingCount) || 0;
        const submittedRating = Number(rating);
        
        const newRating = ((currentRating * currentCount) + submittedRating) / (currentCount + 1);
        
        let pointsChange = 0;
        // If rating < 3, decrease points (penalty)
        if (submittedRating < 3) {
          pointsChange = -10; 
        } else {
          pointsChange = 5; // Bonus points for good quality
        }

        // Verified Pickup Success for Restaurant
        if (donor.userType === 'restaurant') {
            pointsChange += 30;
        }

        await User.findByIdAndUpdate(donation.donorId, {
          rating: newRating,
          ratingCount: currentCount + 1,
          $inc: { points: pointsChange }
        });

        await Notification.create({ userId: donation.donorId, message: `Your donation was verified. Rating: ${submittedRating}/5. ${pointsChange < 0 ? 'Points decreased due to low quality.' : 'Great job!'}`, type: 'info' });
      }
    }

    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: error.message });
  }
}