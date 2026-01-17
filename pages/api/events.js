import dbConnect from '../../lib/mongodb';
import { Event } from '../../lib/models';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const events = await Event.find({}).sort({ date: 1 });
    res.status(200).json(events);
  } else if (req.method === 'POST') {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } else if (req.method === 'PUT') {
    // Join Event
    const { eventId, userId } = req.body;
    const event = await Event.findById(eventId);
    if (!event.participants.includes(userId)) {
      event.participants.push(userId);
      await event.save();
    }
    res.status(200).json({ message: 'Joined event' });
  } else {
    res.status(405).end();
  }
}