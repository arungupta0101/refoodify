export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: "GOOGLE_GEMINI_API_KEY not configured" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    // Extract model names and supported methods
    const models = data.models?.map(m => ({
      name: m.name,
      displayName: m.displayName,
      description: m.description,
      version: m.version,
      supportedGenerationMethods: m.supportedGenerationMethods
    })) || [];

    res.status(200).json({ 
      totalModels: models.length,
      models 
    });

  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}
