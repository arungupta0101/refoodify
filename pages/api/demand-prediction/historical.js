import dbConnect from '../../../lib/mongodb';
import { DemandHistory, Inventory } from '../../../lib/models';

const SAMPLE_DEMO_ITEMS = [
    { name: 'Veggie Biryani', category: 'Main Course', unit: 'servings', avgDaily: 45, variance: 12 },
    { name: 'Garden Salad', category: 'Appetizers', unit: 'bowls', avgDaily: 28, variance: 8 },
    { name: 'Paneer Butter Masala', category: 'Main Course', unit: 'servings', avgDaily: 38, variance: 10 },
    { name: 'Whole Wheat Bread Roll', category: 'Bakery', unit: 'pieces', avgDaily: 60, variance: 15 },
    { name: 'Tomato Soup', category: 'Soups', unit: 'bowls', avgDaily: 32, variance: 7 }
];

function getDeterministicHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function deterministicPseudoRandom(seedStr) {
    const hash = getDeterministicHash(seedStr);
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
}

export function generateSampleHistory(itemName, days = 30) {
    const itemConfig = SAMPLE_DEMO_ITEMS.find(
        (i) => i.name.toLowerCase() === itemName.toLowerCase()
    ) || { name: itemName, avgDaily: 35, variance: 10, unit: 'servings' };

    const history = [];
    const now = new Date('2026-09-15T00:00:00Z'); // Fixed baseline date anchor for 100% consistency

    for (let i = days; i >= 1; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);

        const dayOfWeekIndex = d.getDay(); // 0 is Sunday, 6 is Saturday
        const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = daysArr[dayOfWeekIndex];

        // Weekend boost factor (Friday, Saturday, Sunday have 25-40% higher demand)
        const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 5 || dayOfWeekIndex === 6;
        const weekendMultiplier = isWeekend ? 1.3 : 0.95;

        // Seasonal trend (slight upward curve over 30 days)
        const trendMultiplier = 1 + ((30 - i) / 30) * 0.15;

        const baseQty = Math.round(itemConfig.avgDaily * weekendMultiplier * trendMultiplier);

        // Deterministic noise based on item name and day offset
        const seedStr = `${itemConfig.name.toLowerCase()}_day_${i}`;
        const randNoise = deterministicPseudoRandom(`${seedStr}_noise`);
        const randSurplus = deterministicPseudoRandom(`${seedStr}_surplus`);

        const noise = Math.floor(randNoise * (itemConfig.variance * 2 + 1)) - itemConfig.variance;

        const quantityConsumed = Math.max(10, baseQty + noise);
        // Buffer prepared quantity (5-15% surplus)
        const quantityPrepared = Math.round(quantityConsumed * (1 + (randSurplus * 0.1 + 0.05)));
        const quantityWasted = Math.max(0, quantityPrepared - quantityConsumed);

        history.push({
            itemName: itemConfig.name,
            quantityPrepared,
            quantityConsumed,
            quantityWasted,
            unit: itemConfig.unit,
            date: d.toISOString().split('T')[0],
            dayOfWeek,
            notes: isWeekend ? 'Weekend rush' : 'Regular weekday',
            isDemo: true
        });
    }

    return history;
}

export default async function handler(req, res) {
    try {
        await dbConnect();

        const { userId = 'demo_user', itemName, action, days = 30 } = req.query;

        // GET: Retrieve historical entries
        if (req.method === 'GET') {
            const query = { userId };
            if (itemName) {
                query.itemName = new RegExp(`^${itemName}$`, 'i');
            }

            let history = await DemandHistory.find(query).sort({ date: -1 }).limit(180);

            // If no history in DB, return sample generated data clearly tagged as demo
            if (!history || history.length === 0) {
                const targetItem = itemName || 'Veggie Biryani';
                const demoData = generateSampleHistory(targetItem, Number(days));
                return res.status(200).json({
                    history: demoData,
                    isDemoData: true,
                    count: demoData.length,
                    message: 'Showing sample historical data for prototype demonstration.'
                });
            }

            return res.status(200).json({
                history,
                isDemoData: false,
                count: history.length
            });
        }

        // POST: Add new entry or seed demo data
        if (req.method === 'POST') {
            const body = req.body || {};

            // Action: Seed sample dataset into database
            if (body.action === 'seed' || action === 'seed') {
                const targetItem = body.itemName || 'Veggie Biryani';
                const demoEntries = generateSampleHistory(targetItem, Number(body.days || 30)).map(e => ({
                    ...e,
                    userId
                }));

                await DemandHistory.deleteMany({ userId, itemName: targetItem, isDemo: true });
                const inserted = await DemandHistory.insertMany(demoEntries);

                return res.status(201).json({
                    message: `Successfully seeded ${inserted.length} demo historical consumption records for ${targetItem}`,
                    insertedCount: inserted.length
                });
            }

            // Add a single custom historical record
            const { itemName: name, quantityPrepared, quantityConsumed, quantityWasted, unit, date, notes } = body;

            if (!name || quantityPrepared == null || quantityConsumed == null) {
                return res.status(400).json({ message: 'itemName, quantityPrepared, and quantityConsumed are required.' });
            }

            const logDate = date ? new Date(date) : new Date();
            const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            const newRecord = await DemandHistory.create({
                userId,
                itemName: name,
                quantityPrepared: Number(quantityPrepared),
                quantityConsumed: Number(quantityConsumed),
                quantityWasted: quantityWasted != null ? Number(quantityWasted) : Math.max(0, Number(quantityPrepared) - Number(quantityConsumed)),
                unit: unit || 'servings',
                date: logDate,
                dayOfWeek: daysArr[logDate.getDay()],
                notes: notes || '',
                isDemo: false
            });

            return res.status(201).json({
                message: 'Historical consumption record logged successfully',
                record: newRecord
            });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error('Demand History API Error:', error);
        return res.status(500).json({ message: error.message || 'Server error processing historical data' });
    }
}
