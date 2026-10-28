import dbConnect from '../../lib/mongodb';
import { User } from '../../lib/models';

// In-memory cache: avoids hammering MongoDB on every profile load
// Cache key → { data, expiresAt }
const cache = new Map();
const TTL = 120_000; // 2 minutes

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const { type, sortBy } = req.query;
    const cacheKey = `leaderboard:${type}:${sortBy}`;

    // Serve from cache if fresh
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=60');
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached.data);
    }

    await dbConnect();

    const query = {};
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
      .select('name points rating ratingCount userType photoURL organizationName coverageArea')
      .lean(); // .lean() returns plain JS objects — 3-5x faster than Mongoose documents

    // Store in server-side cache
    cache.set(cacheKey, { data: topUsers, expiresAt: Date.now() + TTL });

    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=60');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(topUsers);
  } catch (error) {
    console.error('Leaderboard API Error:', error);
    res.status(500).json({ message: error.message });
  }
}