import dbConnect from '../../lib/mongodb';
import mongoose from 'mongoose';
import checkRateLimit from '../../lib/rateLimit';
import { sanitizeInput } from '../../lib/validate';

const PostSchema = new mongoose.Schema({
  author: {
    name: String,
    handle: String,
    avatar: String,
    role: String,
    userId: String,
    points: { type: Number, default: 250 },
    location: { type: String, default: 'India' },
    badge: String
  },
  content: String,
  image: String,
  postType: { type: String, default: 'story' },
  likes: [String],
  savedBy: [String],
  claimed: { type: Boolean, default: false },
  claimedBy: {
    userId: String,
    userName: String,
    userRole: String,
    contactPhone: String,
    claimedAt: { type: Date, default: Date.now }
  },
  comments: [{
    user: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const getPostModel = () => {
  return mongoose.models.Post || mongoose.model('Post', PostSchema);
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// In-memory fallback array for dev runtime if MongoDB is not connected
let memoryPosts = [];

export default async function handler(req, res) {
  const { method } = req;

  // Rate Limiting
  if (checkRateLimit && !checkRateLimit(req, 20)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  let dbConnected = false;
  let Post;
  try {
    await dbConnect();
    Post = getPostModel();
    dbConnected = true;
  } catch (error) {
    console.warn('MongoDB connection fallback in /api/posts:', error.message);
  }

  if (method === 'GET') {
    try {
      if (dbConnected && Post) {
        const posts = await Post.find({}).sort({ createdAt: -1 });
        return res.status(200).json(posts);
      }
      return res.status(200).json(memoryPosts);
    } catch (error) {
      return res.status(200).json(memoryPosts);
    }
  } else if (method === 'POST') {
    try {
      const cleanBody = {
        ...req.body,
        content: sanitizeInput(req.body.content)
      };

      if (dbConnected && Post) {
        const post = await Post.create(cleanBody);
        return res.status(201).json(post);
      } else {
        const fallbackPost = {
          _id: `mem-${Date.now()}`,
          ...cleanBody,
          likes: [],
          savedBy: [],
          comments: [],
          claimed: false,
          createdAt: new Date()
        };
        memoryPosts.unshift(fallbackPost);
        return res.status(201).json(fallbackPost);
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create post' });
    }
  } else if (method === 'PUT') {
    const { id, action, userId, text, userName, userRole, contactPhone } = req.body;
    try {
      if (dbConnected && Post) {
        const post = await Post.findById(id);
        if (post) {
          if (action === 'like') {
            if (!post.likes) post.likes = [];
            if (post.likes.includes(userId)) {
              post.likes = post.likes.filter(uid => uid !== userId);
            } else {
              post.likes.push(userId);
            }
          } else if (action === 'save') {
            if (!post.savedBy) post.savedBy = [];
            if (post.savedBy.includes(userId)) {
              post.savedBy = post.savedBy.filter(uid => uid !== userId);
            } else {
              post.savedBy.push(userId);
            }
          } else if (action === 'claim') {
            post.claimed = true;
            post.claimedBy = {
              userId,
              userName: sanitizeInput(userName) || 'Claimant',
              userRole: userRole || 'NGO',
              contactPhone: sanitizeInput(contactPhone) || '',
              claimedAt: new Date()
            };
          } else if (action === 'comment') {
            if (!post.comments) post.comments = [];
            post.comments.push({
              user: sanitizeInput(userName) || 'Anonymous',
              text: sanitizeInput(text),
              timestamp: new Date()
            });
          }
          await post.save();
          return res.status(200).json(post);
        }
      } else {
        // Fallback memory post update
        const post = memoryPosts.find(p => p._id === id);
        if (post) {
          if (action === 'claim') {
            post.claimed = true;
            post.claimedBy = {
              userId,
              userName: userName || 'Claimant',
              userRole: userRole || 'NGO',
              contactPhone: contactPhone || '',
              claimedAt: new Date()
            };
          } else if (action === 'like') {
            if (!post.likes) post.likes = [];
            if (post.likes.includes(userId)) post.likes = post.likes.filter(u => u !== userId);
            else post.likes.push(userId);
          } else if (action === 'save') {
            if (!post.savedBy) post.savedBy = [];
            if (post.savedBy.includes(userId)) post.savedBy = post.savedBy.filter(u => u !== userId);
            else post.savedBy.push(userId);
          }
          return res.status(200).json(post);
        }
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update post' });
    }
  } else if (method === 'DELETE') {
    const { id } = req.query;
    try {
      if (dbConnected && Post) {
        await Post.findByIdAndDelete(id);
      } else {
        memoryPosts = memoryPosts.filter(p => p._id !== id);
      }
      return res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete post' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}