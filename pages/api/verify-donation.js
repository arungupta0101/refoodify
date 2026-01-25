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

    // Prevent duplicate verification (Fix: Points/Rating glitch)
    if (donation.verified) {
      return res.status(400).json({ message: 'Donation is already verified' });
    }

    // Update Donation
    donation.ngoId = ngoId;
    donation.verified = true;
    donation.verificationRating = Math.min(Math.max(Number(rating), 1), 5); // Ensure 1-5
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
        const submittedRating = Math.min(Math.max(Number(rating), 1), 5);
        
        const newRating = ((currentRating * currentCount) + submittedRating) / (currentCount + 1);
        
        let pointsChange = 0;

        // Calculate Points only for Food Donations
        if (donation.type === 'food') {
             if (donor.userType === 'restaurant') {
                 const qty = parseInt(donation.quantity) || 10; 
                 let base = Math.floor(qty / 10) * 50; // 50 pts per 10kg
                 if (base < 50) base = 50;
                 if (donation.isEmergency) base += 100;
                 pointsChange += base;

                 // Verified Pickup Success for Restaurant
                 pointsChange += 30;
             } else {
                 // Normal User
                 let base = 100;
                 if (donation.isEmergency) base += 200;
                 pointsChange += base;
             }

             // Rating adjustments (Bonus/Penalty)
             if (submittedRating < 3) {
               pointsChange -= 10; 
             } else {
               pointsChange += 5; 
             }
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