import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const inventoryRef = collection(db, 'inventory');
    
    // Dates calculate karein (Next 3 days)
    const now = new Date();
    const todayStr = now.toISOString();
    
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysStr = threeDaysFromNow.toISOString();

    // 1. Fetch items expiring in next 3 days from Firestore
    const q = query(
      inventoryRef,
      where("status", "==", "active"),
      where("expiryDate", "<=", threeDaysStr),
      where("expiryDate", ">=", todayStr),
      orderBy("expiryDate", "asc")
    );

    const querySnapshot = await getDocs(q);
    const expiringItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Recipe suggestions logic
    const suggestions = expiringItems.map(item => {
      let recipes = [];

      switch (item.category?.toLowerCase()) {
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
        default:
          recipes = ['Quick Stir Fry', 'Simple Salad', 'Soup', 'Sandwich Filling'];
      }

      return {
        item: item.name,
        category: item.category,
        expiryDate: item.expiryDate,
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