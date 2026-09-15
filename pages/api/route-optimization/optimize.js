// Haversine distance formula (in km)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
}

// Calculate total path distance for an ordered list of points starting from origin
function calculatePathDistance(origin, points) {
    if (!points || points.length === 0) return 0;
    let total = calculateHaversineDistance(origin.lat, origin.lng, points[0].lat, points[0].lng);
    for (let i = 0; i < points.length - 1; i++) {
        total += calculateHaversineDistance(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
    }
    return parseFloat(total.toFixed(2));
}

// Fallback heuristic sort if Gemini is unavailable
function fallbackOptimizeRoute(startLocation, locations) {
    const urgencyScore = { High: 3, Medium: 2, Low: 1 };
    let current = { ...startLocation };
    let remaining = [...locations];
    let ordered = [];

    while (remaining.length > 0) {
        remaining.sort((a, b) => {
            const distA = calculateHaversineDistance(current.lat, current.lng, a.lat, a.lng);
            const distB = calculateHaversineDistance(current.lat, current.lng, b.lat, b.lng);
            const scoreA = (urgencyScore[a.urgency] || 1) / (distA + 0.1);
            const scoreB = (urgencyScore[b.urgency] || 1) / (distB + 0.1);
            return scoreB - scoreA;
        });

        const next = remaining.shift();
        ordered.push(next);
        current = { lat: next.lat, lng: next.lng };
    }

    const recommendedSequence = ordered.map(item => item.id);
    const priorities = {};
    ordered.forEach(item => {
        priorities[item.id] = item.urgency || 'Medium';
    });

    const highUrgentItem = ordered.find(i => i.urgency === 'High');

    return {
        recommendedSequence,
        priorities,
        orderedLocations: ordered,
        reason: highUrgentItem
            ? `Prioritized ${highUrgentItem.name} because it has urgent time-sensitive food approaching expiry, combined with geographic proximity.`
            : 'Route optimized by balancing shortest travel distance with food freshness levels.',
        recommendation: `Collect food starting from ${ordered[0]?.name || 'first point'} to minimize total travel time and avoid food spoilage.`,
        isFallback: true
    };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { startLocation, selectedLocations } = req.body;

        if (!startLocation || !startLocation.lat || !startLocation.lng) {
            return res.status(400).json({ success: false, message: 'Valid starting location with lat & lng is required.' });
        }

        if (!Array.isArray(selectedLocations) || selectedLocations.length === 0) {
            return res.status(400).json({ success: false, message: 'At least 1 pickup location must be selected.' });
        }

        // 1. Calculate Unoptimized Distance (Original user order)
        const unoptimizedDistance = calculatePathDistance(startLocation, selectedLocations);

        // Prepare data summary for Gemini AI
        const pickupSummary = selectedLocations.map((loc) => ({
            id: loc.id,
            name: loc.name,
            foodType: loc.foodType,
            quantity: loc.quantity,
            urgency: loc.urgency || 'Medium',
            availableTime: loc.availableTime || 'N/A',
            distanceFromStartKm: calculateHaversineDistance(startLocation.lat, startLocation.lng, loc.lat, loc.lng)
        }));

        let aiResult = null;
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

        if (apiKey) {
            const promptText = `
You are the ReFoodify AI Route Optimization & Food Rescue Engine.
Analyze the following food pickup locations and determine the most efficient, time-sensitive pickup sequence for an NGO volunteer.

Starting Location: ${startLocation.address || 'Volunteer Hub'} (${startLocation.lat}, ${startLocation.lng})

Pickup Locations Data:
${JSON.stringify(pickupSummary, null, 2)}

Optimization Guidelines:
1. Give HIGHER priority to food items with "High" urgency or shorter availability windows to prevent food waste.
2. Balance urgency with geographic distance to minimize unnecessary travel back-and-forth.
3. Return a strictly valid JSON object with NO markdown formatting, matching this exact structure:

{
  "recommendedSequence": ["location_id_1", "location_id_2", "location_id_3"],
  "priorities": {
    "location_id_1": "High",
    "location_id_2": "Medium"
  },
  "reason": "Detailed 1-2 sentence explanation of why this pickup order was chosen (referencing urgency, expiry, or distance).",
  "recommendation": "1-sentence summary recommendation for the volunteer driver."
}
`;

            const modelChain = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

            for (const model of modelChain) {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    const resp = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        signal: controller.signal,
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: promptText }] }],
                            generationConfig: { temperature: 0.1 }
                        })
                    });
                    clearTimeout(timeoutId);

                    if (!resp.ok) continue;

                    const data = await resp.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) continue;

                    const jsonString = text
                        .replace(/```json/gi, '')
                        .replace(/```/g, '')
                        .trim();

                    const parsed = JSON.parse(jsonString);
                    if (parsed.recommendedSequence && Array.isArray(parsed.recommendedSequence)) {
                        aiResult = parsed;
                        break;
                    }
                } catch (err) {
                    console.warn(`Gemini model ${model} fetch failed:`, err.message);
                }
            }
        }

        // If AI call failed or key wasn't available, use fallback optimization algorithm
        if (!aiResult || !aiResult.recommendedSequence) {
            aiResult = fallbackOptimizeRoute(startLocation, selectedLocations);
        }

        // Map recommended sequence back to location objects safely using String IDs
        const locationMap = new Map(selectedLocations.map(loc => [String(loc.id), loc]));
        let orderedLocations = (aiResult.recommendedSequence || [])
            .map(id => locationMap.get(String(id)))
            .filter(Boolean);

        // Include any missing locations if sequence missed some
        if (orderedLocations.length < selectedLocations.length) {
            const addedIds = new Set(orderedLocations.map(l => l.id));
            const missing = selectedLocations.filter(l => !addedIds.has(l.id));
            orderedLocations = [...orderedLocations, ...missing];
        }

        // 2. Calculate Optimized Distance
        const optimizedDistance = calculatePathDistance(startLocation, orderedLocations);
        const distanceSaved = Math.max(0, parseFloat((unoptimizedDistance - optimizedDistance).toFixed(2)));

        // Estimated travel time in minutes (assumes 25 km/h urban speed + 8 mins per pickup stop)
        const travelMins = Math.round((optimizedDistance / 25) * 60);
        const stopMins = orderedLocations.length * 8;
        const totalEstimatedTimeMins = travelMins + stopMins;

        // Build pairwise distance info between sequence points
        const sequenceDetails = [];
        let prevPoint = startLocation;
        orderedLocations.forEach((loc, idx) => {
            const distFromPrev = calculateHaversineDistance(prevPoint.lat, prevPoint.lng, loc.lat, loc.lng);
            sequenceDetails.push({
                sequenceNumber: idx + 1,
                id: loc.id,
                name: loc.name,
                address: loc.address,
                foodType: loc.foodType,
                quantity: loc.quantity,
                urgency: aiResult.priorities?.[loc.id] || loc.urgency || 'Medium',
                distanceFromPrevKm: distFromPrev,
                lat: loc.lat,
                lng: loc.lng
            });
            prevPoint = { lat: loc.lat, lng: loc.lng };
        });

        res.status(200).json({
            success: true,
            startLocation,
            unoptimizedDistanceKm: unoptimizedDistance,
            optimizedDistanceKm: optimizedDistance,
            distanceSavedKm: distanceSaved,
            estimatedTravelTimeMins: totalEstimatedTimeMins,
            recommendedSequence: sequenceDetails,
            priorities: aiResult.priorities || {},
            reason: aiResult.reason,
            recommendation: aiResult.recommendation,
            isAiGenerated: !aiResult.isFallback
        });

    } catch (error) {
        console.error('Route optimization API error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to optimize route. Please try again.',
            error: error.message
        });
    }
}
