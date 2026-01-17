import dbConnect from '../../lib/mongodb';
import { Story } from '../../lib/models';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    const stories = await Story.find({}).sort({ createdAt: -1 });
    res.status(200).json(stories);
  } else if (req.method === 'POST') {
    const story = await Story.create(req.body);
    res.status(201).json(story);
  } else res.status(405).end();
}