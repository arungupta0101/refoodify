export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message } = req.body;
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    // Fallback for demo if key is missing
    return res.status(200).json({ reply: "Please configure GOOGLE_GEMINI_API_KEY in your .env file to enable AI chat." });
  }

  try {
    const promptText = `You are a helpful AI assistant for Refoodify, a food donation platform. Your goal is to help users donate food, find NGOs, or volunteer. Keep answers concise, friendly and helpful. User: ${message}`;

    const candidates = [
      { model: 'gemini-2.5-flash', method: 'generateContent' },
      { model: 'gemini-2.0-flash', method: 'generateContent' },
      { model: 'gemini-2.0-flash-lite', method: 'generateContent' },
      { model: 'gemini-flash-latest', method: 'generateContent' }
    ];

    const tryRequest = async (url, body) => {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await resp.json().catch(() => ({}));
      return { resp, data };
    };

    const extractReply = (data) => {
      if (!data) return null;
      if (typeof data === 'string') return data;
      // common paths
      const a = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (a) return a;
      const b = data?.candidates?.[0]?.output?.[0]?.content?.text;
      if (b) return b;
      const c = data?.output?.[0]?.content?.text || data?.outputText || data?.text;
      if (c) return c;
      // deep search for first string value under keys named 'text'
      const walk = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        for (const k of Object.keys(obj)) {
          const v = obj[k];
          if (typeof v === 'string' && v.trim()) return v;
          if (typeof v === 'object') {
            const found = walk(v);
            if (found) return found;
          }
        }
        return null;
      };
      return walk(data);
    };

    let lastError = null;
    let attemptDetails = [];
    
    for (const c of candidates) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${c.model}:${c.method}?key=${apiKey}`;

      // payloads differ between methods; try a couple of variants
      const payloads = [];
      // variant for generateContent
      payloads.push({ contents: [{ parts: [{ text: promptText }] }] });

      for (const body of payloads) {
        try {
          const { resp, data } = await tryRequest(url, body);
          const detail = `${c.model}:${c.method} -> ${resp.status}`;
          attemptDetails.push(detail);
          
          if (resp && resp.ok) {
            const reply = extractReply(data) || "I didn't understand that.";
            return res.status(200).json({ reply });
          }
          // Not OK: keep trying other payloads/models
          lastError = data?.error?.message || JSON.stringify(data || resp?.statusText || 'unknown');
          console.warn(`Attempt failed ${c.model}:${c.method} (${resp.status}) ->`, lastError);
        } catch (err) {
          lastError = String(err);
          console.error(`Request attempt error for ${c.model}:${c.method}`, err);
        }
      }
    }

    console.error('All Gemini attempts failed:', lastError);
    console.error('Attempts made:', attemptDetails);
    return res.status(200).json({ 
      reply: `AI Error: ${lastError || 'Failed to connect to Google AI'}`,
      debug: { lastError, attemptDetails }
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ reply: "I'm having trouble thinking right now. Please try again later." });
  }
}