import dbConnect from '../../lib/mongodb';
import { WasteLog } from '../../lib/models';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, itemName, category, userId, wastedItemsHistory } = req.body;
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

        if (action === 'compost_guide') {
            const prompt = `Provide a simple 4-step DIY Home Composting (Khaad) guide specifically for spoiled/waste: "${itemName || 'kitchen food waste'}" (${category || 'organic'}). 
Return JSON with this exact structure:
{
  "compostable": true,
  "difficulty": "Easy",
  "estimatedDays": "14-21 days",
  "methaneSavedKg": 0.6,
  "co2SavedKg": 1.4,
  "steps": [
    { "title": "Step 1: Chop & Prep", "detail": "..." },
    { "title": "Step 2: Layering", "detail": "..." },
    { "title": "Step 3: Moisture & Air", "detail": "..." },
    { "title": "Step 4: Harvest Khaad", "detail": "..." }
  ],
  "proTip": "Chef/Eco tip here"
}`;

            if (apiKey) {
                try {
                    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { responseMimeType: 'application/json' }
                        })
                    });
                    const data = await geminiRes.json();
                    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (rawText) {
                        const parsed = JSON.parse(rawText);
                        return res.status(200).json({ success: true, guide: parsed });
                    }
                } catch (e) {
                    console.error('Gemini API Error, falling back to smart template:', e);
                }
            }

            // High-quality fallback template
            return res.status(200).json({
                success: true,
                guide: {
                    compostable: true,
                    difficulty: 'Easy',
                    estimatedDays: '14-21 days',
                    methaneSavedKg: 0.8,
                    co2SavedKg: 1.8,
                    steps: [
                        { title: 'Step 1: Chop & Balance', detail: `Chop ${itemName || 'food items'} into smaller pieces. Mix 1 part wet green waste with 2 parts dry brown waste (dry leaves, shredded cardboard).` },
                        { title: 'Step 2: Layering in Bin', detail: 'Add a 2-inch bottom layer of twigs/soil, then layer your green kitchen waste and cover with dry soil or coco-peat.' },
                        { title: 'Step 3: Aeration & Moisture', detail: 'Keep moist like a wrung-out sponge. Stir the compost bin once every 3-4 days to let oxygen flow.' },
                        { title: 'Step 4: Harvest Rich Organic Khaad', detail: 'In 2-3 weeks, your odorless, dark, nutrient-rich organic Khaad will be ready for household plants & kitchen gardens!' }
                    ],
                    proTip: `Adding a pinch of sour curd (dahi) or jaggery water speeds up microbial decomposition of ${itemName || 'organic waste'} by 40%!`
                }
            });
        }

        if (action === 'eco_hacks') {
            const prompt = `Provide 3 clever non-culinary DIY eco-hacks (upcycling uses) for near-spoiled or spoiled: "${itemName || 'food waste'}". 
Return JSON with this structure:
{
  "itemName": "${itemName}",
  "hacks": [
    { "title": "...", "category": "Plant Care / Cleaning / Skincare", "instructions": "..." },
    { "title": "...", "category": "...", "instructions": "..." },
    { "title": "...", "category": "...", "instructions": "..." }
  ]
}`;

            if (apiKey) {
                try {
                    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { responseMimeType: 'application/json' }
                        })
                    });
                    const data = await geminiRes.json();
                    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (rawText) {
                        const parsed = JSON.parse(rawText);
                        return res.status(200).json({ success: true, hacks: parsed.hacks });
                    }
                } catch (e) {
                    console.error('Gemini API Error eco-hacks:', e);
                }
            }

            // High quality default fallback hacks
            const defaultHacks = [
                { title: '🌿 Natural Plant Fertilizer Booster', category: 'Plant Care', instructions: `Dilute ${itemName} residue in water and pour near plant roots to enrich soil with natural potassium and micronutrients.` },
                { title: '🧼 DIY Eco Cleaning Scrub', category: 'Household Cleaning', instructions: `Mix with baking soda or vinegar to make a non-toxic sink & kitchen tile stain remover.` },
                { title: '✨ Organic Odor Neutralizer', category: 'Home Freshness', instructions: `Dry out skin/peels and place in refrigerator corners to absorb unwanted food odors naturally.` }
            ];
            return res.status(200).json({ success: true, hacks: defaultHacks });
        }

        if (action === 'purchasing_insights') {
            const itemsList = wastedItemsHistory?.length ? wastedItemsHistory.map(i => i.itemName).join(', ') : 'Spinach, Milk, Tomatoes, Bread';
            const prompt = `Analyze these frequently wasted food items: [ ${itemsList} ].
Generate 3 actionable, empathetic smart buying insights to reduce kitchen food waste in Hindi/English (Hinglish).
Return JSON:
{
  "insights": [
    { "foodItem": "...", "recommendation": "...", "savingPotential": "Save ₹400/mo & 2kg CO2" }
  ]
}`;

            if (apiKey) {
                try {
                    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { responseMimeType: 'application/json' }
                        })
                    });
                    const data = await geminiRes.json();
                    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (rawText) {
                        const parsed = JSON.parse(rawText);
                        return res.status(200).json({ success: true, insights: parsed.insights });
                    }
                } catch (e) {
                    console.error('Gemini API Insights error:', e);
                }
            }

            return res.status(200).json({
                success: true,
                insights: [
                    { foodItem: 'Leafy Greens (Palak/Dhaniya)', recommendation: 'Buy smaller 250g quantities. Blanch & freeze in ice trays on Day 1 to retain 100% nutrition for up to 3 weeks.', savingPotential: 'Save ₹350/mo & 1.4kg CO2' },
                    { foodItem: 'Dairy / Milk & Dahi', recommendation: 'Opt for tetra-packs or boil immediately upon purchase. Convert extra milk into Paneer or Dahi before expiry date.', savingPotential: 'Save ₹500/mo & 2.1kg CO2' },
                    { foodItem: 'Bakery / Bread', recommendation: 'Store half the loaf in the freezer immediately. Frozen slices toast directly in 2 minutes without spoiling!', savingPotential: 'Save ₹200/mo & 0.9kg CO2' }
                ]
            });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Waste AI Route error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
