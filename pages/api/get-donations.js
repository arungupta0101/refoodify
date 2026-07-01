import dbConnect from '../../lib/mongodb';
import { Donation, User } from '../../lib/models';

export default async function handler(req, res) {
	if (req.method !== 'GET') {
		return res.status(405).json({ message: 'Method not allowed' });
	}

	try {
		await dbConnect();
		const { userId, ngoId, scope } = req.query;

		const query = {};

		if (scope === 'all') {
			// No filter.
		} else if (ngoId) {
			query.ngoId = ngoId;
		} else if (userId) {
			query.donorId = userId;
		}

		const donations = await Donation.find(query).sort({ createdAt: -1 }).lean();

		const formattedDonations = await Promise.all(donations.map(async (donation) => {
			let ngoName = 'NGO';
			let donorName = 'Restaurant';

			if (donation.ngoId) {
				const ngo = await User.findById(donation.ngoId).select('name organizationName').lean();
				if (ngo) ngoName = ngo.organizationName || ngo.name || 'NGO';
			}

			if (donation.donorId) {
				const donor = await User.findById(donation.donorId).select('name organizationName').lean();
				if (donor) donorName = donor.organizationName || donor.name || 'Restaurant';
			}

			return {
				...donation,
				id: donation._id.toString(),
				ngoName,
				donorName
			};
		}));

		return res.status(200).json(formattedDonations);
	} catch (error) {
		console.error('Get Donations Error:', error);
		return res.status(500).json({ message: error.message });
	}
}
