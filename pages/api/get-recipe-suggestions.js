import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('refoodify_db');

    // Get items expiring in next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringItems = await db.collection('inventory')
      .find({
        status: 'active',
        expiryDate: {
          $lte: threeDaysFromNow,
          $gte: new Date()
        }
      })
      .toArray();

    // Simple recipe suggestions based on item categories
    const suggestions = [];

    expiringItems.forEach(item => {
      let recipes = [];

      switch (item.category?.toLowerCase()) {
        case 'vegetables':
          recipes = [
            'Vegetable Stir Fry',
            'Vegetable Soup',
            'Veggie Salad',
            'Roasted Vegetables'
          ];
          break;
        case 'fruits':
          recipes = [
            'Fruit Salad',
            'Smoothie',
            'Fruit Compote',
            'Baked Fruit Dessert'
          ];
          break;
        case 'dairy':
          recipes = [
            'Cheese Omelette',
            'Yogurt Parfait',
            'Cream Soup',
            'Cheese Sandwich'
          ];
          break;
        case 'meat':
          recipes = [
            'Stir Fry',
            'Curry',
            'Stew',
            'Sandwiches'
          ];
          break;
        case 'grains':
          recipes = [
            'Rice Dishes',
            'Pasta',
            'Salad',
            'Soup Base'
          ];
          break;
        default:
          recipes = [
            'Quick Stir Fry',
            'Simple Salad',
            'Soup',
            'Sandwich Filling'
          ];
      }

      suggestions.push({
        item: item.name,
        category: item.category,
        expiryDate: item.expiryDate,
        recipes: recipes,
        quantity: item.quantity,
        unit: item.unit
      });
    });

    res.status(200).json({
      suggestions,
      totalItems: expiringItems.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}