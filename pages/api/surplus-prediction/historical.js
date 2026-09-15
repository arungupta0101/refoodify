import dbConnect from '../../../lib/mongodb';
import { SurplusPrediction, DemandHistory } from '../../../lib/models';
import { generateSampleHistory } from '../demand-prediction/historical';

export default async function handler(req, res) {
    try {
        await dbConnect();

        const { userId = 'demo_user', itemName, days = 7 } = req.query;

        // GET: Retrieve historical production & surplus records
        if (req.method === 'GET') {
            const query = { userId };
            if (itemName) {
                query.itemName = new RegExp(`^${itemName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
            }

            let predictions = await SurplusPrediction.find(query).sort({ createdAt: -1 }).limit(30);

            // If no recorded predictions, build clean chart-friendly demo data from sample history
            const targetItem = itemName || 'Veggie Biryani';
            const sampleHistory = generateSampleHistory(targetItem, Number(days));

            const chartData = sampleHistory.map(h => {
                const prod = h.quantityPrepared;
                const cons = h.quantityConsumed;
                const surplus = Math.max(0, prod - cons);
                const surplusPct = prod > 0 ? Number(((surplus / prod) * 100).toFixed(1)) : 0;
                let risk = 'Low';
                if (surplusPct >= 25 || surplus >= 30) risk = 'High';
                else if (surplusPct >= 10 || surplus >= 10) risk = 'Medium';

                return {
                    date: h.date,
                    dayOfWeek: h.dayOfWeek,
                    productionQuantity: prod,
                    consumedQuantity: cons,
                    surplusQuantity: surplus,
                    surplusPercentage: surplusPct,
                    riskLevel: risk,
                    unit: h.unit,
                    isDemo: true
                };
            });

            return res.status(200).json({
                success: true,
                history: predictions.length > 0 ? predictions : chartData,
                isDemoData: predictions.length === 0,
                count: predictions.length > 0 ? predictions.length : chartData.length
            });
        }

        // POST: Save manual production log
        if (req.method === 'POST') {
            const {
                itemName: name,
                productionQuantity,
                currentInventory = 0,
                expectedConsumption,
                unit = 'servings',
                notes
            } = req.body || {};

            if (!name || productionQuantity == null) {
                return res.status(400).json({ message: 'itemName and productionQuantity are required.' });
            }

            const prod = Number(productionQuantity);
            const inv = Number(currentInventory);
            const expCons = Number(expectedConsumption || Math.round(prod * 0.8));
            const totalAvail = prod + inv;
            const surplus = Math.max(0, totalAvail - expCons);
            const surplusPct = totalAvail > 0 ? Number(((surplus / totalAvail) * 100).toFixed(1)) : 0;

            let riskLevel = 'Low';
            if (surplusPct >= 25 || surplus >= 30) riskLevel = 'High';
            else if (surplusPct >= 10 || surplus >= 10) riskLevel = 'Medium';

            const record = await SurplusPrediction.create({
                userId,
                itemName: name,
                productionQuantity: prod,
                currentInventory: inv,
                expectedConsumption: expCons,
                predictedSurplus: surplus,
                surplusPercentage: surplusPct,
                unit,
                riskLevel,
                insight: `Logged production run of ${prod} ${unit}. Available food: ${totalAvail} ${unit}. Expected surplus: ${surplus} ${unit}.`,
                recommendation: riskLevel === 'High' ? 'High surplus risk detected! Consider listing surplus for donation.' : 'Maintain current production efficiency.',
                isDemo: false
            });

            return res.status(201).json({
                success: true,
                message: 'Production record logged successfully.',
                record
            });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error('Surplus History API Error:', error);
        return res.status(500).json({ message: error.message || 'Server error processing historical surplus data' });
    }
}
