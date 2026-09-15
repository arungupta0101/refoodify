import dbConnect from '../../../lib/mongodb';
import { DemandHistory, DemandPrediction, Inventory } from '../../../lib/models';
import { generateSampleHistory } from './historical';

const DAYS_NAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper to compute statistical prediction baseline
function computeStatisticalPrediction(historyData, periodDays = 7, currentInventory = 0) {
    if (!historyData || historyData.length === 0) {
        return null;
    }

    // Sort history chronologically (oldest to newest)
    const sorted = [...historyData].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Compute daily consumption numbers
    const dailyUsages = sorted.map((d) => Number(d.quantityConsumed) || 0);

    // Calculate weighted moving average (recent 7 days weighted 2x)
    let weightedSum = 0;
    let weightTotal = 0;
    sorted.forEach((item, index) => {
        const weight = index >= sorted.length - 7 ? 2.0 : 1.0;
        weightedSum += (Number(item.quantityConsumed) || 0) * weight;
        weightTotal += weight;
    });

    const baseDailyAvg = weightTotal > 0 ? weightedSum / weightTotal : 30;

    // Calculate Day-of-Week multipliers
    const dayStats = {};
    DAYS_NAME.forEach((day) => {
        dayStats[day] = { total: 0, count: 0 };
    });

    sorted.forEach((item) => {
        const day = item.dayOfWeek || DAYS_NAME[new Date(item.date).getDay()];
        if (dayStats[day]) {
            dayStats[day].total += Number(item.quantityConsumed) || 0;
            dayStats[day].count += 1;
        }
    });

    const overallAvg = dailyUsages.reduce((a, b) => a + b, 0) / (dailyUsages.length || 1);
    const dayMultipliers = {};
    DAYS_NAME.forEach((day) => {
        if (dayStats[day].count > 0) {
            const dayAvg = dayStats[day].total / dayStats[day].count;
            dayMultipliers[day] = overallAvg > 0 ? dayAvg / overallAvg : 1.0;
        } else {
            dayMultipliers[day] = (day === 'Saturday' || day === 'Sunday' || day === 'Friday') ? 1.25 : 0.95;
        }
    });

    // Calculate overall trend direction (first half vs second half)
    const midIndex = Math.floor(sorted.length / 2);
    const olderHalf = sorted.slice(0, midIndex);
    const recentHalf = sorted.slice(midIndex);

    const olderAvg = olderHalf.reduce((acc, curr) => acc + (Number(curr.quantityConsumed) || 0), 0) / (olderHalf.length || 1);
    const recentAvg = recentHalf.reduce((acc, curr) => acc + (Number(curr.quantityConsumed) || 0), 0) / (recentHalf.length || 1);

    let trendPercentage = 0;
    if (olderAvg > 0) {
        trendPercentage = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
    }

    let trend = 'stable';
    if (trendPercentage > 5) trend = 'increasing';
    else if (trendPercentage < -5) trend = 'decreasing';

    // Generate daily forecast for next `periodDays`
    const startDate = new Date();
    const dailyForecast = [];
    let totalPredicted = 0;

    for (let i = 1; i <= periodDays; i++) {
        const forecastDate = new Date(startDate);
        forecastDate.setDate(forecastDate.getDate() + i);

        const dayName = DAYS_NAME[forecastDate.getDay()];
        const isWeekend = forecastDate.getDay() === 0 || forecastDate.getDay() === 5 || forecastDate.getDay() === 6;

        const mult = dayMultipliers[dayName] || (isWeekend ? 1.25 : 0.95);
        const trendAdjust = 1 + (trendPercentage / 100) * 0.5;

        const dayPredicted = Math.max(5, Math.round(baseDailyAvg * mult * trendAdjust));
        totalPredicted += dayPredicted;

        dailyForecast.push({
            date: forecastDate.toISOString().split('T')[0],
            dayOfWeek: dayName,
            predictedDemand: dayPredicted,
            isWeekend
        });
    }

    const unit = sorted[0]?.unit || 'servings';
    const recommendedProduction = Math.max(0, Math.round(totalPredicted - currentInventory));

    return {
        predictedDemand: Math.round(totalPredicted),
        recommendedProduction,
        currentInventory,
        unit,
        avgDailyConsumption: Math.round(baseDailyAvg * 10) / 10,
        trend,
        trendPercentage,
        confidenceScore: sorted.length >= 20 ? 88 : 78,
        dailyForecast,
        historicalSeries: sorted.slice(-30).map(h => ({
            date: typeof h.date === 'string' ? h.date.split('T')[0] : new Date(h.date).toISOString().split('T')[0],
            dayOfWeek: h.dayOfWeek || DAYS_NAME[new Date(h.date).getDay()],
            quantityConsumed: Number(h.quantityConsumed) || 0,
            quantityPrepared: Number(h.quantityPrepared) || 0,
            quantityWasted: Number(h.quantityWasted) || 0
        }))
    };
}

// Call Gemini API for AI insights and refined forecasting reasoning
async function getGeminiAIInsights(itemName, stats, periodDays, currentInventory) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) return null;

    const promptText = `
You are the ReFoodify AI Demand Prediction Engine.
Analyze the following food consumption history metrics for item "${itemName}" and generate precise actionable demand insights and surplus reduction advice:

Data Metrics:
- Food Item: ${itemName}
- Historical Avg Daily Consumption: ${stats.avgDailyConsumption} ${stats.unit}
- Demand Trend: ${stats.trend} (${stats.trendPercentage > 0 ? '+' : ''}${stats.trendPercentage}%)
- Forecast Period: Next ${periodDays} days
- Total Predicted Demand: ${stats.predictedDemand} ${stats.unit}
- Current Usable Inventory: ${currentInventory} ${stats.unit}
- Recommended Production: ${stats.recommendedProduction} ${stats.unit}

Instructions:
Provide a JSON object containing an array of 3 to 4 concise, clear, professional insights for a restaurant or institutional kitchen manager.
Do NOT make unsupported real-world claims. Label suggestions as AI data-driven estimates.

JSON format expected:
{
  "insights": [
    "Insight statement 1...",
    "Insight statement 2...",
    "Surplus reduction recommendation..."
  ]
}
`;

    const candidates = [
        { model: 'gemini-2.5-flash', method: 'generateContent' },
        { model: 'gemini-2.0-flash', method: 'generateContent' },
        { model: 'gemini-2.0-flash-lite', method: 'generateContent' },
        { model: 'gemini-flash-latest', method: 'generateContent' }
    ];

    for (const c of candidates) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${c.model}:${c.method}?key=${apiKey}`;
        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    generationConfig: { temperature: 0.1 }
                })
            });

            if (!resp.ok) continue;

            const data = await resp.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Clean JSON string from markdown code blocks
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.insights && Array.isArray(parsed.insights)) {
                    return { insights: parsed.insights, geminiModel: c.model };
                }
            }
        } catch (err) {
            console.warn(`Gemini attempt ${c.model} error:`, err.message);
        }
    }

    return null;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed. Use POST.' });
    }

    try {
        await dbConnect();

        const {
            userId = 'demo_user',
            itemName = 'Veggie Biryani',
            periodDays = 7,
            historyRangeDays = 30
        } = req.body || {};

        const period = Math.max(1, Math.min(30, Number(periodDays)));
        const range = Math.max(7, Math.min(90, Number(historyRangeDays)));

        // 1. Fetch History from DB or fallback to demo dataset
        let historyRecords = await DemandHistory.find({
            name: new RegExp(`^${itemName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')
        }).sort({ date: 1 });

        if (!historyRecords || historyRecords.length === 0) {
            historyRecords = await DemandHistory.find({
                itemName: new RegExp(`^${itemName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')
            }).sort({ date: 1 });
        }

        let isDemoData = false;
        if (!historyRecords || historyRecords.length === 0) {
            historyRecords = generateSampleHistory(itemName, range);
            isDemoData = true;
        }

        // 2. Fetch inventory stock matching item name (flexible userId lookup)
        let currentInventoryQty = 0;
        try {
            let inventoryMatch = await Inventory.findOne({
                userId,
                name: new RegExp(itemName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
            });
            if (!inventoryMatch) {
                inventoryMatch = await Inventory.findOne({
                    name: new RegExp(itemName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
                });
            }
            if (inventoryMatch && inventoryMatch.quantity != null) {
                currentInventoryQty = parseFloat(inventoryMatch.quantity) || 0;
            }
        } catch (invErr) {
            console.warn('Inventory lookup note:', invErr.message);
        }

        // 3. Compute statistical baseline forecast
        const stats = computeStatisticalPrediction(historyRecords, period, currentInventoryQty);

        if (!stats) {
            return res.status(400).json({ message: 'Insufficient historical data to compute prediction.' });
        }

        // 4. Try Gemini AI for enriched insights
        let insights = [];
        let geminiUsed = false;

        const aiResult = await getGeminiAIInsights(itemName, stats, period, currentInventoryQty);
        if (aiResult && aiResult.insights && aiResult.insights.length > 0) {
            insights = aiResult.insights;
            geminiUsed = true;
        } else {
            // Data-driven fallback insights
            insights = [
                `Demand is expected to ${stats.trend === 'increasing' ? 'increase by approximately ' + Math.abs(stats.trendPercentage) + '%' : stats.trend === 'decreasing' ? 'decrease by approximately ' + Math.abs(stats.trendPercentage) + '%' : 'remain relatively stable'}.`,
                `Average daily consumption for ${itemName} is currently ${stats.avgDailyConsumption} ${stats.unit}.`,
                `Current available inventory is ${currentInventoryQty} ${stats.unit}. Subtracted from ${stats.predictedDemand} ${stats.unit} predicted demand gives recommended production of ${stats.recommendedProduction} ${stats.unit}.`,
                `Tip: Adjust weekend prep quantities upward to handle higher projected customer demand without over-preparing on weekdays.`
            ];
        }

        // 5. Store prediction log in MongoDB
        try {
            await DemandPrediction.create({
                userId,
                itemName,
                predictedDemand: stats.predictedDemand,
                recommendedProduction: stats.recommendedProduction,
                currentInventory: currentInventoryQty,
                unit: stats.unit,
                periodDays: period,
                historyRangeDays: range,
                trend: stats.trend,
                trendPercentage: stats.trendPercentage,
                confidenceScore: stats.confidenceScore,
                insights,
                dailyForecast: stats.dailyForecast,
                isDemo: isDemoData
            });
        } catch (saveErr) {
            console.warn('Failed to save prediction record:', saveErr.message);
        }

        return res.status(200).json({
            success: true,
            itemName,
            predictedDemand: stats.predictedDemand,
            recommendedProduction: stats.recommendedProduction,
            currentInventory: currentInventoryQty,
            unit: stats.unit,
            periodDays: period,
            historyRangeDays: range,
            trend: stats.trend,
            trendPercentage: stats.trendPercentage,
            confidenceScore: stats.confidenceScore,
            avgDailyConsumption: stats.avgDailyConsumption,
            insights,
            dailyForecast: stats.dailyForecast,
            historicalSeries: stats.historicalSeries,
            isDemoData,
            geminiUsed,
            message: geminiUsed
                ? 'AI Prediction generated successfully using Gemini AI.'
                : 'Demand prediction generated using statistical model with current inventory integration.'
        });

    } catch (error) {
        console.error('Demand Prediction API Error:', error);
        return res.status(500).json({ message: error.message || 'Error generating demand prediction.' });
    }
}
