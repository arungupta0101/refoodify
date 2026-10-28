import dbConnect from '../../lib/mongodb';
import { User, Volunteer } from '../../lib/models';

// In-memory cache — partners list doesn't change every second
let cachedData = null;
let cacheExpiry = 0;
const TTL = 180_000; // 3 minutes

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    // Serve from cache if fresh
    if (cachedData && Date.now() < cacheExpiry) {
      res.setHeader('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=60');
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cachedData);
    }

    await dbConnect();

    // Run all 3 queries in parallel, with strict limits and field projections
    const [restaurants, ngos, volunteers] = await Promise.all([
      User.find({ userType: 'restaurant', status: 'Active' })
        .select('name organizationName rating ratingCount address coverageArea photoURL workingHours points')
        .sort({ rating: -1 })
        .limit(30)
        .lean(),
      User.find({ userType: 'ngo', status: 'Active' })
        .select('name organizationName rating ratingCount coverageArea address photoURL points')
        .sort({ rating: -1 })
        .limit(30)
        .lean(),
      Volunteer.find({})
        .select('volunteerName volunteerEmail volunteerPhone city role vehicle submittedAt')
        .sort({ submittedAt: -1 })
        .limit(50)
        .lean()
    ]);

    const result = { restaurants, ngos, volunteers };

    // Cache the result
    cachedData = result;
    cacheExpiry = Date.now() + TTL;

    res.setHeader('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=60');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(result);
  } catch (error) {
    console.error('Partners API Error:', error);
    return res.status(500).json({ message: error.message });
  }
}