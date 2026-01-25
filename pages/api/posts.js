import dbConnect from '../../lib/mongodb';
import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  author: {
    name: String,
    avatar: String,
    role: String,
    userId: String
  },
  content: String,
  image: String,
  likes: [String], // Array of userIds
  comments: [{
    user: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

let Post;
try {
  Post = mongoose.model('Post');
} catch {
  Post = mongoose.model('Post', PostSchema);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  if (method === 'GET') {
    try {
      const posts = await Post.find({}).sort({ createdAt: -1 });
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  } else if (method === 'POST') {
    try {
      const post = await Post.create(req.body);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create post' });
    }
  } else if (method === 'PUT') {
    const { id, action, userId, text, userName } = req.body;
    try {
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ error: 'Post not found' });

      if (action === 'like') {
        if (post.likes.includes(userId)) {
          post.likes = post.likes.filter(uid => uid !== userId);
        } else {
          post.likes.push(userId);
        }
      } else if (action === 'comment') {
        post.comments.push({
          user: userName || 'Anonymous',
          text: text,
          timestamp: new Date()
        });
      }

      await post.save();
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update post' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}