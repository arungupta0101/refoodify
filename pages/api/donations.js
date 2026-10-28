import dbConnect from '../../lib/mongodb';
import { Donation, Volunteer, User, Notification } from '../../lib/models';
import checkRateLimit from '../../lib/rateLimit';
import { generateDonationProof } from '../../lib/blockchain';

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === 'POST') {
      const { type, amount, donorId, userId, isEmergency, location, city } = req.body;
      if (!checkRateLimit(req, 10)) { // Limit to 10 requests per minute
        return res.status(429).json({ message: 'Too many requests' });
      }

      let pointsEarned = 0;

      if (type === 'volunteer') {
        const vol = await Volunteer.create(req.body);
        // 50 Points for joining as a volunteer
        pointsEarned = 50;
        if (userId) {
          await User.findByIdAndUpdate(userId, { $inc: { points: pointsEarned } });
        }
        return res.status(201).json({ ...vol.toObject(), pointsEarned });
      } else {
        // Mint Cryptographic Proof-of-Donation (PoD)
        const proof = generateDonationProof(req.body);
        const donation = await Donation.create({
          ...req.body,
          status: 'available',
          blockchainHash: proof.blockchainHash,
          blockNumber: proof.blockNumber,
          certificateId: proof.certificateId,
          network: proof.network,
          txTimestamp: proof.txTimestamp
        });

        // Points are NOT awarded at creation. They are awarded upon verification.
        pointsEarned = 0;

        // Notify NGOs in the area
        if (type === 'food') {
          const searchLocation = city || location || '';
          if (searchLocation) {
            const ngos = await User.find({
              userType: 'ngo',
              $or: [
                { address: { $regex: searchLocation, $options: 'i' } },
                { coverageArea: { $regex: searchLocation, $options: 'i' } }
              ]
            });

            const notifications = ngos.map(ngo => ({
              userId: ngo._id,
              message: `🍲 New Food Donation at ${location}! Click to view and verify.`,
              type: 'alert',
              read: false
            }));

            if (notifications.length > 0) await Notification.insertMany(notifications);
          }
        }

        return res.status(201).json({ ...donation.toObject(), pointsEarned, blockchainProof: proof });
      }
    } else if (req.method === 'GET') {
      const { userId } = req.query;

      // .lean() + select only used fields = much faster
      const donations = await Donation.find({ donorId: userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .select('type foodType foodItem quantity location status ngoId donorRating verificationRating blockchainHash certificateId blockNumber createdAt isEmergency')
        .lean();

      // Batch NGO lookup — 1 query instead of N queries (was the big N+1 problem)
      const ngoIds = [...new Set(donations.filter(d => d.ngoId).map(d => d.ngoId))];
      let ngoMap = {};
      if (ngoIds.length > 0) {
        const ngos = await User.find({ _id: { $in: ngoIds } })
          .select('organizationName name')
          .lean();
        ngoMap = Object.fromEntries(ngos.map(n => [n._id.toString(), n.organizationName || n.name || 'NGO']));
      }

      const result = donations.map(d => ({
        ...d,
        ngoName: d.ngoId ? (ngoMap[d.ngoId] || 'NGO') : undefined
      }));

      res.setHeader('Cache-Control', 'private, max-age=30, stale-while-revalidate=30');
      return res.status(200).json(result);
    } else if (req.method === 'DELETE') {
      const { id, userId } = req.query; // Add userId for security
      const donation = await Donation.findById(id);
      // Ensure the user deleting the donation is the one who created it
      if (donation.donorId.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });
      await Donation.findByIdAndDelete(id);
      res.status(200).json({ message: 'Donation deleted successfully' });
    } else {
      res.status(405).end();
    }
  } catch (error) {
    console.error("Donations API Error:", error);
    res.status(500).json({ message: error.message });
  }
}