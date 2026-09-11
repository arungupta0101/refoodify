import dbConnect from '../../lib/mongodb';
import { Inventory } from '../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    let itemsToUse = [];
    let customItems = '';

    let recipeLanguage = 'English';

    if (req.method === 'POST') {
      const { selectedItems, extraIngredients, recipeLanguage: lang } = req.body || {};
      if (Array.isArray(selectedItems) && selectedItems.length > 0) {
        itemsToUse = selectedItems;
      }
      if (extraIngredients) {
        customItems = extraIngredients;
      }
      if (lang) {
        recipeLanguage = lang;
      }
    } else {
      // GET method - fetch from DB if userId present
      const { userId, language } = req.query;
      if (language) recipeLanguage = language;
      if (userId) {
        await dbConnect();
        const dbItems = await Inventory.find({ userId }).sort({ expiry: 1 }).limit(10);
        itemsToUse = dbItems.map(i => i.name);
      }
    }

    // If itemsToUse is empty, provide default common inventory items
    if (itemsToUse.length === 0 && !customItems) {
      itemsToUse = ['Potato', 'Tomato', 'Onion', 'Rice', 'Milk'];
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const itemListStr = itemsToUse.map(i => (typeof i === 'string' ? i : i.name)).join(', ');
    const combinedIngredients = customItems ? `${itemListStr}, ${customItems}` : itemListStr;

    let languageInstruction = "LANGUAGE INSTRUCTION: You MUST write all titles, descriptions, instructions, and chef tips in ENGLISH language.";
    if (recipeLanguage.toLowerCase() === 'hindi') {
      languageInstruction = "LANGUAGE INSTRUCTION: You MUST write all titles, descriptions, instructions, and chef tips in HINDI (हिन्दी - Devanagari script).";
    } else if (recipeLanguage.toLowerCase() === 'hinglish') {
      languageInstruction = "LANGUAGE INSTRUCTION: You MUST write all titles, descriptions, instructions, and chef tips in HINGLISH (Hindi written using English/Latin alphabet, e.g., 'Tel garam karein aur aloo ubaalein. Serve hot with roti.').";
    }

    if (apiKey) {
      const promptText = `
You are an expert Indian chef and food waste prevention AI assistant.
The user has the following ingredients available in their kitchen/inventory:
[ ${combinedIngredients} ]

${languageInstruction}

Generate 3 to 4 realistic, simple, and tasty **INDIAN recipes** (dishes) that can be prepared using these selected ingredients along with standard household Indian kitchen staples (like oil, salt, basic spices: turmeric, cumin, chili powder, water).

CRITICAL REQUIREMENT:
Return ONLY a valid JSON array of recipe objects (no markdown, no explanatory text outside JSON).

Each recipe object in the JSON array MUST have the following structure:
[
  {
    "title": "Dish Name",
    "description": "Short 1-2 sentence delicious description of the dish",
    "prepTime": "15-20 mins",
    "difficulty": "Easy",
    "cuisine": "Indian",
    "usedInventoryItems": ["Item 1", "Item 2"],
    "otherPantryItems": ["Oil", "Turmeric", "Salt"],
    "instructions": [
      "Step 1: Wash and chop vegetables...",
      "Step 2: Heat 1 tbsp oil...",
      "Step 3: Add spices...",
      "Step 4: Serve hot."
    ],
    "chefTip": "Quick tip for best taste or avoiding waste."
  }
]
`;

      const candidates = [
        { model: 'gemini-2.0-flash', method: 'generateContent' },
        { model: 'gemini-1.5-flash', method: 'generateContent' },
        { model: 'gemini-1.5-pro', method: 'generateContent' },
        { model: 'gemini-2.0-flash-lite', method: 'generateContent' }
      ];

      for (const c of candidates) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${c.model}:${c.method}?key=${apiKey}`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
          });

          if (resp.ok) {
            const data = await resp.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Extract JSON array using regex matching [ { ... } ]
            const jsonMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) {
              const recipes = JSON.parse(jsonMatch[0]);
              if (Array.isArray(recipes) && recipes.length > 0) {
                return res.status(200).json({
                  success: true,
                  source: 'gemini',
                  language: recipeLanguage,
                  ingredientsUsed: combinedIngredients,
                  recipes: recipes
                });
              }
            }
          } else {
            console.warn(`Gemini API call failed for model ${c.model} with status ${resp.status}`);
          }
        } catch (err) {
          console.warn(`Gemini attempt with model ${c.model} failed:`, err.message);
        }
      }
    }

    // Fallback if Gemini fails or key missing
    const fallbackRecipes = generateFallbackIndianRecipes(itemsToUse, recipeLanguage);
    return res.status(200).json({
      success: true,
      source: 'fallback',
      language: recipeLanguage,
      ingredientsUsed: combinedIngredients,
      recipes: fallbackRecipes
    });

  } catch (error) {
    console.error("Recipe API error:", error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// Smart fallback Indian recipe generator (guarantees 3 recipes for any language & items)
function generateFallbackIndianRecipes(items, recipeLanguage = 'English') {
  const itemNames = items.map(i => (typeof i === 'string' ? i : i?.name || '').toLowerCase());
  const lang = recipeLanguage.toLowerCase();
  const recipes = [];

  const mainIngredients = items.length > 0 ? items.map(i => (typeof i === 'string' ? i : i?.name || '')) : ['Vegetables', 'Spices'];

  if (lang === 'hindi') {
    recipes.push({
      title: "जीरा आलू मसाला (Jeera Aloo Masala)",
      description: "स्वादिष्ट और झटपट बनने वाले आलू जो जीरा और बेसिक भारतीय मसालों से तैयार होते हैं।",
      prepTime: "15 मिनट",
      difficulty: "Easy (आसान)",
      cuisine: "Indian",
      usedInventoryItems: mainIngredients.slice(0, 2),
      otherPantryItems: ["तेल", "जीरा", "हल्दी", "लाल मिर्च", "नमक"],
      instructions: [
        "उबले आलू या उपलब्ध सब्जियों को मध्यम टुकड़ों में काट लें।",
        "एक पैन में 2 चम्मच तेल गरम करें और 1 चम्मच जीरा चटकाएं।",
        "हल्दी, लाल मिर्च पाउडर, नमक और कटी सब्जियां मिलाएं।",
        "मध्यम आंच पर 5-7 मिनट तक भूनें जब तक कि सब्जियां क्रिस्पी न हो जाएं।",
        "हरे धनिये से सजाएं और गरम-गरम परोसें।"
      ],
      chefTip: "समय बचाने के लिए उबले हुए आलू का इस्तेमाल करें!"
    });

    recipes.push({
      title: "देसी ब्रेड उपमा (Desi Bread Upma)",
      description: "ब्रेड क्यूब्स, प्याज और सरसों के दानों से बना झटपट और स्वादिष्ट नाश्ता।",
      prepTime: "10 मिनट",
      difficulty: "Easy (आसान)",
      cuisine: "Indian",
      usedInventoryItems: mainIngredients.slice(0, 2),
      otherPantryItems: ["तेल", "राई (सरसों)", "प्याज", "हरी मिर्च", "हल्दी"],
      instructions: [
        "ब्रेड की स्लाइस को छोटे चौकोर टुकड़ों में काट लें।",
        "पैन में तेल गरम करें, राई, कटी हरी मिर्च और प्याज डालकर भूनें।",
        "हल्दी और नमक डालें, फिर ब्रेड के टुकड़े डालकर 2 मिनट टॉस करें।",
        "गरम चाय के साथ परोसें।"
      ],
      chefTip: "हल्की सूखी ब्रेड का उपयोग करने के लिए यह सबसे बेहतरीन रेसिपी है।"
    });

    recipes.push({
      title: "सब्जी कड़ाही फ्राई (Quick Veggie Stir-Fry)",
      description: "गरम मसाले के स्वाद से भरपूर पौष्टिक और रंग-बिरंगी मिक्स सब्जी।",
      prepTime: "15 मिनट",
      difficulty: "Easy (आसान)",
      cuisine: "Indian",
      usedInventoryItems: mainIngredients.slice(0, 3),
      otherPantryItems: ["तेल", "गरम मसाला", "धनिया पाउडर", "नमक"],
      instructions: [
        "सभी उपलब्ध सब्जियों को छोटे टुकड़ों में काट लें।",
        "कढ़ाई में तेल गरम करें और सब्जियों को 4-5 मिनट तेज आंच पर भूनें।",
        "नमक, धनिया पाउडर और गरम मसाला डालकर मिलाएं।",
        "गरम-गरम परोसें।"
      ],
      chefTip: "सब्जियों का क्रंच बनाए रखने के लिए तेज आंच पर पकाएं।"
    });

  } else if (lang === 'hinglish') {
    recipes.push({
      title: "Masala Jeera Aloo",
      description: "Tasty aur jhatpat banne wale fried aloo jo jeera aur basic Indian masalon se tayyar hote hain.",
      prepTime: "15 mins",
      difficulty: "Easy",
      cuisine: "Indian",
      usedInventoryItems: mainIngredients.slice(0, 2),
      otherPantryItems: ["Oil", "Jeera", "Haldi", "Lal Mirch", "Namak"],
      instructions: [
        "3-4 aloo ubaalein aur medium pieces me kaat lein.",
        "Pan me 2 tbsp oil garam karein aur 1 tsp jeera daalein.",
        "Haldi, lal mirch, namak aur aloo daal kar ache se mix karein.",
        "Medium flame par 5-7 minutes fry karein jab tak crispy na ho jayein.",
        "Hara dhaniya daal kar garam-garam roti ke saath serve karein."
      ],
      chefTip: "Time bachane ke liye pehle se uble aloo ka use karein!"
    });

    recipes.push({
      title: "Desi Bread Upma / Poha",
      description: "Bread slices se banne wala jhatpat aur tasty South-Asian nashta.",
      prepTime: "10 mins",
      difficulty: "Easy",
      cuisine: "Indian",
      usedInventoryItems: mainIngredients.slice(0, 2),
      otherPantryItems: ["Oil", "Rai (Mustard)", "Pyaz", "Hari Mirch", "Haldi"],
      instructions: [
        "Bread slices ko chhote pieces me kaat lein.",
        "Pan me tel garam karke rai, hari mirch aur pyaz ko halka golden hone tak bhunein.",
        "Haldi aur namak daalein, fir bread pieces daal kar 2 minute mix karein.",
        "Garam chai ke saath serve karein."
      ],
      chefTip: "Purane bread slices ko utilize karne ka ye best tarika hai!"
    });

    recipes.push({
      title: "Quick Veggie Kadai Stir-Fry",
      description: "Sabhi available veggies se banne wali healthy Indian stir-fry dish.",
      prepTime: "15 mins",
      difficulty: "Easy",
      cuisine: "Indian",
      usedInventoryItems: mainIngredients.slice(0, 3),
      otherPantryItems: ["Oil", "Garam Masala", "Coriander Powder", "Namak"],
      instructions: [
        "Sabhi veggies ko chote strips me kaat lein.",
        "Kadai me tel garam karein aur veggies ko high flame par 4-5 mins stir-fry karein.",
        "Namak, dhaniya powder aur garam masala daal kar mix karein.",
        "Hot serve karein."
      ],
      chefTip: "High heat par pakaein taaki veggies crunchy rahein."
    });

  } else {
    // English
    recipes.push({
      title: "Masala Aloo Jeera",
      description: "Quick, flavorful fried potatoes tempered with cumin seeds and basic Indian spices.",
      prepTime: "15 mins",
      difficulty: "Easy",
      cuisine: "Indian",
      usedInventoryItems: mainIngredients.slice(0, 2),
      otherPantryItems: ["Oil", "Cumin (Jeera)", "Turmeric", "Red Chili Powder", "Salt"],
      instructions: [
        "Boil 3-4 potatoes or use available veggies cut into medium cubes.",
        "Heat 2 tbsp oil in a pan and add 1 tsp cumin seeds until they sizzle.",
        "Add turmeric, red chili powder, salt, and the cubed potatoes.",
        "Sauté on medium flame for 5-7 minutes until crispy and golden.",
        "Garnish with fresh coriander or lemon juice and serve warm."
      ],
      chefTip: "Use leftover boiled potatoes to save cooking time!"
    });

    recipes.push({
      title: "Desi Bread Upma",
      description: "A fast, tasty breakfast made with bread cubes sautéed in onions and spices.",
      prepTime: "10 mins",
      difficulty: "Easy",
      cuisine: "Indian",
      usedInventoryItems: mainIngredients.slice(0, 2),
      otherPantryItems: ["Oil", "Mustard Seeds", "Onion", "Green Chili", "Turmeric"],
      instructions: [
        "Cut 4 slices of bread into small square bites.",
        "Heat oil in a pan, add mustard seeds, green chili, and finely chopped onion.",
        "Add turmeric and salt once onions turn light golden.",
        "Add bread cubes, toss into the pan, and mix gently for 2 minutes.",
        "Serve hot with a cup of Indian Chai."
      ],
      chefTip: "Perfect recipe for utilizing slightly stale bread slices."
    });

    recipes.push({
      title: "Quick Veggie Kadai Stir-Fry",
      description: "Healthy and vibrant Indian vegetable fry infused with garam masala.",
      prepTime: "15 mins",
      difficulty: "Easy",
      cuisine: "Indian",
      usedInventoryItems: mainIngredients.slice(0, 3),
      otherPantryItems: ["Oil", "Garam Masala", "Coriander Powder", "Salt"],
      instructions: [
        "Chop all available veggies into bite-sized strips.",
        "Heat oil in a kadai or wok on high heat.",
        "Toss in the vegetables and stir-fry for 4-5 minutes while keeping them crunchy.",
        "Season with salt, coriander powder, and a dash of garam masala.",
        "Serve hot as a side dish."
      ],
      chefTip: "Keep heat high to retain crunch and vitamins."
    });
  }

  return recipes;
}
