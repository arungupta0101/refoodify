import dbConnect from '../../lib/mongodb';
import { Donation } from '../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await dbConnect();
    const { donationId, ngoId } = req.body;

    if (!donationId || !ngoId) return res.status(400).json({ message: 'Missing IDs' });

    await Donation.findByIdAndUpdate(donationId, {
      $addToSet: { ignoredBy: ngoId }
    });

    res.status(200).json({ message: 'Donation ignored' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}