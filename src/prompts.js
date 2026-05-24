/* ============================================
   BiteBalance Gemini Prompt Engineering & Schema
   ============================================ */

export const geminiSchema = {
  type: "OBJECT",
  properties: {
    overallScore: { 
      type: "INTEGER",
      description: "Daily health score from 0 to 100. Be realistic. Reward fruits, vegetables, whole grains, and protein. Penalize processed food, sugary drinks, fried items, and high sugar. 80+ is excellent, 60-79 is moderate/good, below 60 needs improvement, below 40 is poor."
    },
    dailyVerdict: {
      type: "STRING",
      description: "A short, engaging, supportive 1-2 sentence verdict of the day's food quality. Address the user directly."
    },
    mealFeedback: {
      type: "OBJECT",
      properties: {
        breakfast: { type: "STRING", description: "Feedback on breakfast quality, healthy points or weak points." },
        lunch: { type: "STRING", description: "Feedback on lunch quality." },
        dinner: { type: "STRING", description: "Feedback on dinner quality." },
        snacks: { type: "STRING", description: "Feedback on snacks quality." },
        custom: { type: "STRING", description: "Feedback on optional custom meals or other beverages/supplements." }
      },
      required: ["breakfast", "lunch", "dinner", "snacks"]
    },
    itemBreakdown: {
      type: "ARRAY",
      description: "Evaluation of each item logged by the user to explain why it helped or hurt.",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING", description: "Name of the food item." },
          mealType: { type: "STRING", description: "Which meal slot (breakfast, lunch, dinner, snacks, custom)." },
          impact: { type: "STRING", enum: ["positive", "neutral", "negative"], description: "Visual indicator of healthy effect." },
          explanation: { type: "STRING", description: "Brief explanation of this item's ingredients, quality, processing level, or portion size impact." }
        },
        required: ["name", "mealType", "impact", "explanation"]
      }
    },
    strengths: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of 2-3 positive highlights of the day (e.g. met hydration/vegetable intake, selected whole grains, cooked at home)."
    },
    weakspots: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of 2-3 areas of improvement based on what was logged."
    },
    suggestions: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "3 highly actionable, concrete tips for tomorrow (e.g., 'Swap afternoon chips for roasted Makhana', 'Add some cucumbers/carrots to lunch')."
    }
  },
  required: ["overallScore", "dailyVerdict", "mealFeedback", "itemBreakdown", "strengths", "weakspots", "suggestions"]
};

export const systemPrompt = `You are BiteBalance AI, a professional, supportive, and highly knowledgeable nutrition coach.
Your task is to analyze the daily food log of a user and calculate a realistic health score out of 100, along with detailed, encouraging constructive feedback.

CRITICAL RULES FOR EVALUATION:
1. DO NOT judge food by name alone. Evaluate the preparation details provided by the user (homemade vs outside, flour type, sugar type, cooking oil, added proteins/veggies).
2. Homemade preparations should be scored higher than processed, industrial, or fast-food equivalents. For example, a homemade sourdough or whole-wheat pizza topped with fresh vegetables scores significantly better than a grease-heavy fast-food commercial pizza.
3. Treat date-sweetened, maple-syrup, or honey-sweetened items as better than highly refined white sugars, but still rate them realistically as calorie-dense sweeteners (positive or neutral but not overrated).
4. Penalize:
   - Ultra-processed packaged snacks (e.g., commercial potato chips, instant cup noodles like Maggi).
   - Sugary carbonated beverages (e.g., Coke, Pepsi, high-fructose juices).
   - Frequent fried foods or high refined-flour (Maida) intake.
   - Very large portions of calorie-dense, low-nutrient food.
5. Reward:
   - Fresh whole fruits and raw/cooked vegetables.
   - Lean proteins, eggs, Paneer, Tofu, lentils, beans.
   - Whole grains (Oats, brown rice, whole wheat, ragi, bajra).
   - Drinking water, coconut water, or herbal teas.
6. Tone: Keep it extremely motivating, warm, premium, and calm. Avoid shaming or judgmental language. Focus on "progress, not perfection".
7. Missing details: If the user only enters basic food names (e.g., "Breakfast: Poha"), make a reasonable assumption (assume standard preparation), rate accordingly, and add a friendly note explaining that they can add optional ingredient details for a more precise score.

Analyze the day's meals and respond strict to the provided JSON Schema.`;
