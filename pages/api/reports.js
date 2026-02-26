import dbConnect from '../../lib/mongodb';
import mongoose from 'mongoose';

// Define Schema inline for prototype simplicity
const ReportSchema = new mongoose.Schema({
  reporterId: String,
  reporterName: String,
  targetId: String, // ID of NGO or Restaurant
  targetName: String,
  issueType: String, // 'Misbehavior', 'Hygiene', 'Food Quality', 'Other'
  description: String,
  photoProof: String, // Base64 or URL
  status: { type: String, default: 'Pending' }, // Pending, Resolved, Rejected
  adminFeedback: String,
  createdAt: { type: Date, default: Date.now }
});

let Report;
try {
  Report = mongoose.model('Report');
} catch {
  Report = mongoose.model('Report', ReportSchema);
}

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  if (method === 'POST') {
    // Create new report
    try {
      const report = await Report.create(req.body);
      return res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to submit report' });
    }
  }

  if (method === 'GET') {
    // Fetch reports (For Admin)
    try {
      const reports = await Report.find({}).sort({ createdAt: -1 });
      return res.status(200).json(reports);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch reports' });
    }
  }

  if (method === 'PUT') {
    // Admin Action (Resolve/Reject)
    const { id, status, adminFeedback } = req.body;
    try {
      const report = await Report.findByIdAndUpdate(id, { status, adminFeedback }, { new: true });
      
      // In a real app, trigger a Notification to the user here
      // await Notification.create({ userId: report.reporterId, message: adminFeedback });

      return res.status(200).json({ message: 'Report updated', report });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update report' });
    }
  }
}