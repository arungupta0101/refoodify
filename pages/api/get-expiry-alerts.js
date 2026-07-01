import dbConnect from '../../lib/mongodb';
import { Inventory } from '../../lib/models';

export default async function handler(req, res) {
	if (req.method !== 'GET') {
		return res.status(405).json({ message: 'Method not allowed' });
	}

	try {
		await dbConnect();
		const { userId } = req.query;

		if (!userId) {
			return res.status(400).json({ message: 'User ID is required' });
		}

		const now = new Date();
		const sevenDaysFromNow = new Date();
		sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

		const items = await Inventory.find({
			userId,
			expiry: { $gte: now.toISOString().split('T')[0], $lte: sevenDaysFromNow.toISOString().split('T')[0] }
		}).sort({ expiry: 1 }).lean();

		return res.status(200).json(items.map((item) => ({
			...item,
			id: item._id.toString(),
		})));
	} catch (error) {
		console.error('Get Expiry Alerts Error:', error);
		return res.status(500).json({ message: error.message });
	}
}
