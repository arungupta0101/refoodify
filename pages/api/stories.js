import dbConnect from '../../lib/mongodb';
import { CommunityStory } from '../../lib/models';

export default async function handler(req, res) {
  const { method } = req;

  try {
    await dbConnect();

    if (method === 'GET') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Clean up any stale stories older than 24 hours
      await CommunityStory.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });

      // Fetch stories created in the last 24 hours
      const stories = await CommunityStory.find({ createdAt: { $gte: twentyFourHoursAgo } })
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        stories: stories.map(s => ({
          id: s._id.toString(),
          user: s.author?.name || 'Community Member',
          handle: s.author?.handle || '@user',
          role: s.author?.role || 'individual',
          avatar: s.author?.avatar || '',
          image: s.image,
          caption: s.caption || '',
          points: s.author?.points || 0,
          createdAt: s.createdAt
        }))
      });
    }

    if (method === 'POST') {
      const { image, caption, author } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'Story image is required' });
      }

      const newStory = await CommunityStory.create({
        image,
        caption: caption || '',
        author: author || {
          userId: 'anon',
          name: 'Community Member',
          role: 'individual'
        },
        createdAt: new Date()
      });

      return res.status(201).json({
        success: true,
        story: {
          id: newStory._id.toString(),
          user: newStory.author?.name || 'Community Member',
          handle: newStory.author?.handle || '@user',
          role: newStory.author?.role || 'individual',
          avatar: newStory.author?.avatar || '',
          image: newStory.image,
          caption: newStory.caption || '',
          points: newStory.author?.points || 0,
          createdAt: newStory.createdAt
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Stories API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}