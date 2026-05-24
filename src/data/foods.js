/* ============================================
   BiteBalance Suggestions Database
   ============================================ */

export const foodDatabase = {
  breakfast: [
    { name: 'Poha', tags: ['homemade', 'indian', 'light'] },
    { name: 'Idli with Sambar', tags: ['homemade', 'indian', 'healthy'] },
    { name: 'Oatmeal with Fruits', tags: ['fiber', 'healthy', 'quick'] },
    { name: 'Aloo Paratha', tags: ['indian', 'rich', 'comfort'] },
    { name: 'Whole Wheat Toast with Egg', tags: ['protein', 'healthy', 'quick'] },
    { name: 'Moong Dal Chilla', tags: ['protein', 'healthy', 'diet'] },
    { name: 'Upma', tags: ['indian', 'homemade', 'quick'] },
    { name: 'Cornflakes with Milk', tags: ['quick', 'processed'] },
    { name: 'Banana Smoothie', tags: ['fruits', 'energy', 'quick'] },
    { name: 'Masala Chai', tags: ['drink', 'indian', 'classic'] }
  ],
  lunch: [
    { name: 'Roti, Dal, and Mixed Veg', tags: ['homemade', 'indian', 'balanced'] },
    { name: 'Paneer Bhurji with Roti', tags: ['protein', 'indian', 'homemade'] },
    { name: 'Brown Rice with Rajma', tags: ['fiber', 'protein', 'indian'] },
    { name: 'Chicken Curry with Rice', tags: ['protein', 'indian', 'rich'] },
    { name: 'Subway Sandwich', tags: ['outside', 'quick', 'fresh'] },
    { name: 'Green Salad', tags: ['vegetables', 'healthy', 'diet'] },
    { name: 'Khichdi with Curd', tags: ['comfort', 'light', 'homemade'] },
    { name: 'Veg Biryani', tags: ['indian', 'rich', 'flavorful'] },
    { name: 'Curd Rice', tags: ['south-indian', 'light', 'cool'] }
  ],
  dinner: [
    { name: 'Roti, Dal Tadka, and Bhindi Sabzi', tags: ['homemade', 'indian', 'balanced'] },
    { name: 'Grilled Chicken with Veggies', tags: ['protein', 'diet', 'healthy'] },
    { name: 'Paneer Tikka with Salad', tags: ['protein', 'low-carb', 'delicious'] },
    { name: 'Sourdough Pizza', tags: ['comfort', 'italian', 'outside'] },
    { name: 'Pasta in Pesto Sauce', tags: ['italian', 'carbs', 'tasty'] },
    { name: 'Lentil Soup', tags: ['healthy', 'warm', 'soup'] },
    { name: 'Stir-fried Tofu & Broccoli', tags: ['vegan', 'protein', 'healthy'] },
    { name: 'Egg Curry with Chapati', tags: ['protein', 'indian', 'homemade'] }
  ],
  snacks: [
    { name: 'Apple with Peanut Butter', tags: ['fruit', 'healthy', 'snack'] },
    { name: 'Mixed Nuts & Seeds', tags: ['healthy', 'fats', 'quick'] },
    { name: 'Maggi Noodles', tags: ['processed', 'quick', 'comfort'] },
    { name: 'Roasted Makhana', tags: ['healthy', 'light', 'indian'] },
    { name: 'Samosa', tags: ['fried', 'indian', 'heavy'] },
    { name: 'Dark Chocolate', tags: ['sweet', 'energy', 'delight'] },
    { name: 'Greek Yogurt', tags: ['protein', 'healthy', 'cold'] },
    { name: 'Potato Chips', tags: ['processed', 'salty', 'junk'] },
    { name: 'Bhel Puri', tags: ['indian', 'tangy', 'snack'] }
  ],
  custom: [
    { name: 'Whey Protein Shake', tags: ['protein', 'fitness'] },
    { name: 'Diet Coke', tags: ['drink', 'zero-calorie'] },
    { name: 'Cold Coffee', tags: ['drink', 'sweet'] },
    { name: 'Coconut Water', tags: ['drink', 'hydrating', 'healthy'] },
    { name: 'Sprouted Moong Salad', tags: ['healthy', 'raw', 'protein'] }
  ]
};

// Flattened list for overall autocomplete
export const allSuggestions = [
  ...new Set([
    ...foodDatabase.breakfast.map(f => f.name),
    ...foodDatabase.lunch.map(f => f.name),
    ...foodDatabase.dinner.map(f => f.name),
    ...foodDatabase.snacks.map(f => f.name),
    ...foodDatabase.custom.map(f => f.name)
  ])
].sort();
