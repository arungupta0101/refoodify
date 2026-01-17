import dbConnect from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    await dbConnect();
    res.status(200).json({ status: 'Connected', message: 'MongoDB connection successful' });
  } catch (error) {
    console.error('DB Connection Error:', error);
    res.status(500).json({ status: 'Error', message: 'Failed to connect to MongoDB', error: error.message });
  }
}