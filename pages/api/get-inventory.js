import dbConnect from '../../lib/mongodb';
import { Inventory } from '../../lib/models';

export default async function handler(req, res) {
	if (req.method !== 'GET') {
		return res.status(405).json({ message: 'Method not allowed' });
	}

	try {
		await dbConnect();
		const { userId, scope } = req.query;

		const query = {};
		if (scope !== 'all' && userId) {
			query.userId = userId;
		}

		const items = await Inventory.find(query).sort({ createdAt: -1 }).lean();

		return res.status(200).json(items.map((item) => ({
			...item,
			id: item._id.toString(),
		})));
	} catch (error) {
		console.error('Get Inventory Error:', error);
		return res.status(500).json({ message: error.message });
	}
}
