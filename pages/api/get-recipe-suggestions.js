import dbConnect from '../../lib/mongodb';
import { Inventory } from '../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Dates calculate karein (Next 7 days)
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0];

    // 1. Fetch items expiring soon from MongoDB
    const expiringItems = await Inventory.find({
      userId,
      expiry: { $gte: todayStr, $lte: sevenDaysStr }
    }).sort({ expiry: 1 });

    // 2. Recipe suggestions logic
    const suggestions = expiringItems.map(item => {
      let recipes = [];
      const itemName = item.name.toLowerCase();

      switch (true) {
        case 'vegetables':
          recipes = ['Vegetable Stir Fry', 'Vegetable Soup', 'Veggie Salad', 'Roasted Vegetables'];
          break;
        case 'fruits':
          recipes = ['Fruit Salad', 'Smoothie', 'Fruit Compote', 'Baked Fruit Dessert'];
          break;
        case 'dairy':
          recipes = ['Cheese Omelette', 'Yogurt Parfait', 'Cream Soup', 'Cheese Sandwich'];
          break;
        case 'meat':
          recipes = ['Stir Fry', 'Curry', 'Stew', 'Sandwiches'];
          break;
        case 'grains':
          recipes = ['Rice Dishes', 'Pasta', 'Salad', 'Soup Base'];
          break;
        // Name based matching
        case itemName.includes('milk'):
          recipes = ['Rice Pudding', 'Milkshake', 'White Sauce Pasta'];
          break;
        case itemName.includes('bread'):
          recipes = ['Bread Pudding', 'Croutons', 'French Toast'];
          break;
        case itemName.includes('tomato'):
          recipes = ['Tomato Soup', 'Salsa', 'Pasta Sauce'];
          break;
        case itemName.includes('banana'):
          recipes = ['Banana Bread', 'Smoothie', 'Pancakes'];
          break;
        default:
          recipes = ['Quick Stir Fry', 'Simple Salad', 'Soup', 'Sandwich Filling'];
      }

      return {
        item: item.name,
        expiryDate: item.expiry,
        recipes: recipes,
        quantity: item.quantity,
        unit: item.unit
      };
    });

    res.status(200).json({
      suggestions,
      totalItems: expiringItems.length
    });
  } catch (error) {
    console.error("Recipe Suggestion Error:", error);
    res.status(500).json({ error: error.message });
  }
}