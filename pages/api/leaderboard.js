import dbConnect from '../../lib/mongodb';
import { User } from '../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    await dbConnect();
    const { type, sortBy } = req.query;
    
    let query = {};
    if (sortBy === 'rating') {
      query.rating = { $gt: 0 };
    } else {
      query.points = { $gt: 0 };
    }

    if (type && type !== 'all') {
      query.userType = type;
    }
    
    const sortOption = sortBy === 'rating' ? { rating: -1 } : { points: -1 };

    const topUsers = await User.find(query)
      .sort(sortOption)
      .limit(10)
      .select('name points rating ratingCount userType photoURL');
    
    res.status(200).json(topUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}