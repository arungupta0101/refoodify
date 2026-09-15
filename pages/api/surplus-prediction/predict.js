import dbConnect from '../../../lib/mongodb';
import { Inventory, DemandHistory, SurplusPrediction } from '../../../lib/models';
import { generateSampleHistory } from '../demand-prediction/historical';

// Call Gemini API for surplus risk analysis and prevention recommendations
async function getGeminiSurplusAnalysis(itemName, productionQty, currentStock, expectedConsumption, predictedSurplus, surplusPct, riskLevel) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) return null;

    const promptText = `
You are the ReFoodify AI Surplus Prediction Engine.
Analyze the following kitchen food production, stock, and consumption data for item "${itemName}" and return structured surplus prediction insights:

Input Data:
- Food Item: ${itemName}
- Planned Production Quantity: ${productionQty} servings
- Current Kitchen Inventory Stock: ${currentStock} servings
- Total Available Food (Production + Inventory): ${productionQty + currentStock} servings
- Expected Consumption: ${expectedConsumption} servings
- Calculated Predicted Surplus: ${predictedSurplus} servings
- Calculated Surplus Percentage: ${surplusPct}%
- Computed Risk Level: ${riskLevel}

Instructions:
Provide a JSON object containing concise, clear, professional insights for a kitchen manager.
Do NOT invent historical data. Label recommendations as AI data-driven estimations.

JSON Format Expected:
{
  "expectedConsumption": ${expectedConsumption},
  "predictedSurplus": ${predictedSurplus},
  "surplusPercentage": ${surplusPct},
  "riskLevel": "${riskLevel}",
  "insight": "Clear summary of why this surplus is expected based on historical consumption trends.",
  "recommendation": "Actionable advice (e.g. reduce production by X servings, list Y surplus servings for donation/redistribution, or utilize existing inventory first)."
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

            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed && parsed.insight && parsed.recommendation) {
                    return { ...parsed, geminiModel: c.model };
                }
            }
        } catch (e) {
            console.warn(`Gemini API candidate ${c.model} error:`, e.message);
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
            itemName = 'Veggie Biryani',
            productionQuantity = 100,
            periodDays = 1,
            userId = 'demo_user',
            unit = 'servings'
        } = req.body || {};

        const prodQty = Math.max(0, Number(productionQuantity) || 0);
        const pDays = Math.max(1, Number(periodDays) || 1);

        // 1. Fetch live stock from Inventory collection
        let currentStock = 0;
        let inventoryItem = null;
        try {
            const escapedName = itemName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const matchingItems = await Inventory.find({
                $or: [
                    { name: new RegExp(`^${escapedName}$`, 'i') },
                    { name: new RegExp(escapedName, 'i') }
                ]
            });
            if (matchingItems && matchingItems.length > 0) {
                currentStock = matchingItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
                inventoryItem = matchingItems[0];
            } else if (req.body.currentInventory != null && !isNaN(req.body.currentInventory)) {
                currentStock = Math.max(0, parseFloat(req.body.currentInventory));
            }
        } catch (e) {
            console.warn('Inventory lookup error:', e);
        }

        // 2. Fetch or calculate historical consumption average
        const escapedItemName = itemName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        let historyRecords = await DemandHistory.find({
            itemName: new RegExp(`^${escapedItemName}$`, 'i')
        }).sort({ date: -1 }).limit(30);

        let isDemoData = false;
        if (!historyRecords || historyRecords.length === 0) {
            historyRecords = generateSampleHistory(itemName, 30);
            isDemoData = true;
        }

        const totalConsumed = historyRecords.reduce((acc, curr) => acc + (curr.quantityConsumed || 0), 0);
        const avgDailyConsumption = Math.round(totalConsumed / Math.max(1, historyRecords.length));

        // 3. Perform Surplus Calculation Logic
        // Expected Available Food = Planned Production + Current Inventory
        const totalAvailableFood = prodQty + currentStock;

        // Expected Consumption = Avg Daily Consumption * Forecast Period
        const expectedConsumption = Math.round(avgDailyConsumption * pDays);

        // Predicted Surplus = Expected Available Food - Expected Consumption
        const predictedSurplus = Math.max(0, totalAvailableFood - expectedConsumption);

        // Surplus Percentage
        const surplusPercentage = totalAvailableFood > 0
            ? Number(((predictedSurplus / totalAvailableFood) * 100).toFixed(1))
            : 0;

        // Surplus Risk Level Categorization
        let riskLevel = 'Low';
        if (surplusPercentage >= 25 || predictedSurplus >= 30) {
            riskLevel = 'High';
        } else if (surplusPercentage >= 10 || predictedSurplus >= 10) {
            riskLevel = 'Medium';
        }

        // 4. Gemini AI Integration
        const geminiResult = await getGeminiSurplusAnalysis(
            itemName,
            prodQty,
            currentStock,
            expectedConsumption,
            predictedSurplus,
            surplusPercentage,
            riskLevel
        );

        // Fallback insights if Gemini is unavailable
        let defaultInsight = '';
        let defaultRecommendation = '';

        if (riskLevel === 'High') {
            defaultInsight = `High surplus predicted! Total available food (${totalAvailableFood} ${unit}) exceeds expected demand (${expectedConsumption} ${unit}) by ${predictedSurplus} ${unit} (${surplusPercentage}% surplus).`;
            defaultRecommendation = `Reduce planned production by ${predictedSurplus} ${unit}, or list ${predictedSurplus} ${unit} for immediate donation/redistribution on ReFoodify.`;
        } else if (riskLevel === 'Medium') {
            defaultInsight = `Moderate surplus expected. Available food is estimated to exceed consumption by ${predictedSurplus} ${unit} (${surplusPercentage}%).`;
            defaultRecommendation = `Monitor kitchen consumption closely or use existing inventory stock before preparing new batches.`;
        } else {
            defaultInsight = `Low surplus risk. Planned production matches anticipated consumption patterns with negligible waste risk.`;
            defaultRecommendation = `Proceed with planned production while maintaining FIFO inventory management.`;
        }

        const finalInsight = geminiResult?.insight || defaultInsight;
        const finalRecommendation = geminiResult?.recommendation || defaultRecommendation;
        const isAiPowered = !!geminiResult;

        // 5. Store Prediction Log in MongoDB
        try {
            await SurplusPrediction.create({
                userId,
                itemName,
                productionQuantity: prodQty,
                currentInventory: currentStock,
                expectedConsumption,
                predictedSurplus,
                surplusPercentage,
                unit: inventoryItem?.unit || unit || 'servings',
                periodDays: pDays,
                riskLevel,
                insight: finalInsight,
                recommendation: finalRecommendation,
                isDemo: isDemoData
            });
        } catch (dbErr) {
            console.warn('Failed to save SurplusPrediction log:', dbErr.message);
        }

        // 6. Return response to client
        return res.status(200).json({
            success: true,
            itemName,
            productionQuantity: prodQty,
            currentInventory: currentStock,
            totalAvailableFood,
            expectedConsumption,
            predictedSurplus,
            surplusPercentage,
            riskLevel,
            periodDays: pDays,
            unit: inventoryItem?.unit || unit || 'servings',
            insight: finalInsight,
            recommendation: finalRecommendation,
            isAiPowered,
            aiModelUsed: geminiResult?.geminiModel || null,
            isDemoData,
            message: isAiPowered
                ? 'Surplus prediction analyzed powered by Gemini AI.'
                : 'Surplus prediction generated using ReFoodify Statistical Engine.'
        });

    } catch (error) {
        console.error('AI Surplus Prediction API Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate AI surplus prediction.'
        });
    }
}
