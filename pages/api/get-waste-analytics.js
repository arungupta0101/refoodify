import dbConnect from '../../lib/mongodb';
import { WasteLog, User } from '../../lib/models';

export default async function handler(req, res) {
    const { method } = req;

    try {
        await dbConnect();

        if (method === 'GET') {
            const { userId } = req.query;
            const query = userId ? { userId } : {};

            const logs = await WasteLog.find(query).sort({ createdAt: -1 }).lean();

            const totalItems = logs.length;
            const compostedCount = logs.filter(l => l.actionTaken === 'composted').length;
            const rescuedCount = logs.filter(l => l.actionTaken === 'animal_shelter' || l.actionTaken === 'urgent_rescue').length;
            const bioPickupCount = logs.filter(l => l.actionTaken === 'bio_waste_pickup').length;

            const totalMethaneSavedKg = logs.reduce((acc, curr) => acc + (curr.methaneSavedKg || 0.5), 0);
            const totalCo2SavedKg = logs.reduce((acc, curr) => acc + (curr.co2SavedKg || 1.2), 0);
            const totalPointsEarned = logs.reduce((acc, curr) => acc + (curr.pointsEarned || 25), 0);

            const badges = [];
            if (compostedCount >= 1) badges.push({ id: 'green_sprout', title: '🌱 Khaad Beginner', desc: 'Composted first organic item!' });
            if (compostedCount >= 5) badges.push({ id: 'compost_master', title: '🌿 Compost Master', desc: '5+ items turned into rich fertilizer' });
            if (totalMethaneSavedKg >= 2) badges.push({ id: 'zero_methane', title: '⚡ Zero Methane Hero', desc: 'Prevented 2kg+ dangerous Methane emissions' });
            if (rescuedCount >= 3) badges.push({ id: 'animal_savior', title: '🐾 Animal Rescue Guardian', desc: 'Saved 3+ surplus meals for stray animals' });

            return res.status(200).json({
                success: true,
                summary: {
                    totalItems,
                    compostedCount,
                    rescuedCount,
                    bioPickupCount,
                    totalMethaneSavedKg: Math.round(totalMethaneSavedKg * 10) / 10,
                    totalCo2SavedKg: Math.round(totalCo2SavedKg * 10) / 10,
                    totalPointsEarned,
                    badges
                },
                logs: logs.map(l => ({
                    id: l._id.toString(),
                    itemName: l.itemName,
                    quantity: l.quantity,
                    category: l.category,
                    reason: l.reason,
                    actionTaken: l.actionTaken,
                    methaneSavedKg: l.methaneSavedKg,
                    co2SavedKg: l.co2SavedKg,
                    createdAt: l.createdAt
                }))
            });
        }

        if (method === 'POST') {
            const { userId, itemName, quantity, category, reason, actionTaken } = req.body;

            if (!itemName) {
                return res.status(400).json({ error: 'Item name is required' });
            }

            const methaneSavedKg = actionTaken === 'composted' ? 0.8 : actionTaken === 'animal_shelter' ? 1.1 : 0.5;
            const co2SavedKg = actionTaken === 'composted' ? 1.8 : actionTaken === 'animal_shelter' ? 2.4 : 1.2;
            const pointsEarned = 25;

            const newLog = await WasteLog.create({
                userId: userId || 'anon',
                itemName,
                quantity: quantity || '1 item',
                category: category || 'General',
                reason: reason || 'Expired',
                actionTaken: actionTaken || 'composted',
                methaneSavedKg,
                co2SavedKg,
                pointsEarned,
                createdAt: new Date()
            });

            // Award points to user if userId present
            if (userId) {
                await User.findOneAndUpdate(
                    { userId },
                    { $inc: { points: pointsEarned } }
                ).catch(e => console.error('Points increment error:', e));
            }

            return res.status(201).json({
                success: true,
                message: 'Action logged & Green Points awarded!',
                log: newLog
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Waste Analytics Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
