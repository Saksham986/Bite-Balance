/* ============================================
   BiteBalance Gemini REST API Client
   ============================================ */

import { systemPrompt, geminiSchema } from './prompts.js';
import { store } from './store.js';

export async function analyzeDayWithAI(dateStr, meals) {
  const apiKey = store.profile.apiKey;
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  // Prep prompt input
  const foodDetails = [];
  
  const mealKeys = ['breakfast', 'lunch', 'dinner', 'snacks', 'custom'];
  mealKeys.forEach(meal => {
    const items = meals[meal] || [];
    if (items.length > 0) {
      items.forEach(item => {
        const itemInfo = [
          `Meal: ${meal}`,
          `Item: ${item.name}`,
          item.quantity ? `Quantity/Portion: ${item.quantity}` : null,
          item.details?.homemade !== undefined ? `Source: ${item.details.homemade ? 'Homemade' : 'Ordered Outside / Packaged'}` : null,
          item.details?.flour ? `Flour type: ${item.details.flour}` : null,
          item.details?.sugar ? `Sugar type: ${item.details.sugar}` : null,
          item.details?.oil ? `Cooking oil: ${item.details.oil}` : null,
          item.details?.proteinVeg ? `Added Protein/Veggies: ${item.details.proteinVeg}` : null,
          item.details?.notes ? `Notes: ${item.details.notes}` : null
        ].filter(Boolean).join(', ');
        
        foodDetails.push(itemInfo);
      });
    }
  });

  if (foodDetails.length === 0) {
    throw new Error('NO_FOOD_LOGGED');
  }

  const promptText = `Please analyze the following food log for date ${dateStr}:\n\n` + 
    foodDetails.map((detail, index) => `${index + 1}. ${detail}`).join('\n') + 
    `\n\nProvide the scoring feedback according to instructions.`;

  // We use gemini-2.5-flash as the standard model for structured JSON generation
  const modelName = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          { text: promptText }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: geminiSchema
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      console.error('Gemini API Error details:', errorJson);
      throw new Error(`API_RESPONSE_ERROR_${response.status}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      throw new Error('EMPTY_AI_RESPONSE');
    }

    const analysisResult = JSON.parse(candidateText.trim());
    return analysisResult;

  } catch (error) {
    console.error('Failed to contact Gemini API:', error);
    throw error;
  }
}

// Local mock rating system if API key fails or offline, to keep the app working
export function getLocalMockScore(meals) {
  let score = 75;
  let itemsCount = 0;
  const breakdown = [];
  const strengths = [];
  const weakspots = [];
  const suggestions = [];

  const positiveKeywords = ['fruit', 'salad', 'apple', 'banana', 'coconut', 'egg', 'paneer', 'tofu', 'dal', 'roti', 'khichdi', 'curd', 'oatmeal', 'moong', 'seeds', 'nuts'];
  const negativeKeywords = ['maggi', 'coke', 'pepsi', 'soda', 'pizza', 'burger', 'chips', 'samosa', 'fried', 'refined', 'sugar', 'maida'];

  const mealKeys = ['breakfast', 'lunch', 'dinner', 'snacks', 'custom'];
  mealKeys.forEach(meal => {
    const items = meals[meal] || [];
    items.forEach(item => {
      itemsCount++;
      const nameLower = item.name.toLowerCase();
      
      let itemImpact = 'neutral';
      let itemExplanation = `Analyzed locally. Custom portion logged.`;

      // Simple keyword detection
      const isPositive = positiveKeywords.some(kw => nameLower.includes(kw));
      const isNegative = negativeKeywords.some(kw => nameLower.includes(kw));

      if (isPositive) {
        score += 5;
        itemImpact = 'positive';
        itemExplanation = `${item.name} is generally highly nutritious, rich in protein or micronutrients.`;
      } else if (isNegative) {
        score -= 10;
        itemImpact = 'negative';
        itemExplanation = `${item.name} is processed or has added sugars/refined flour, which can impact glucose levels if frequent.`;
      } else if (item.details?.homemade) {
        score += 2;
        itemImpact = 'positive';
        itemExplanation = `${item.name} is homemade. Cooking at home generally uses healthier oils and portion control.`;
      }

      breakdown.push({
        name: item.name,
        mealType: meal,
        impact: itemImpact,
        explanation: itemExplanation
      });
    });
  });

  // Bound score
  score = Math.max(10, Math.min(100, score));

  if (score >= 80) {
    strengths.push("Excellent meal choices today with natural wholefoods.");
    suggestions.push("Maintain this consistency tomorrow!");
  } else {
    weakspots.push("Some processed foods or sugars were logged.");
    suggestions.push("Try adding a portion of fruit or raw salad tomorrow.");
  }

  return {
    overallScore: score,
    dailyVerdict: `[Local Estimate Mode] You logged ${itemsCount} items. Your estimated health score is ${score}/100. Enter your API key in Settings to unlock deep Gemini AI nutrition coaching!`,
    mealFeedback: {
      breakfast: "Evaluated locally. Try to keep protein high.",
      lunch: "Evaluated locally. Include leafy greens.",
      dinner: "Evaluated locally. Keep dinner light.",
      snacks: "Evaluated locally. Replace processed snacks with wholefoods."
    },
    itemBreakdown: breakdown,
    strengths: strengths.length > 0 ? strengths : ["You completed logging today's food intake!"],
    weakspots: weakspots.length > 0 ? weakspots : ["Could include more green vegetables."],
    suggestions: suggestions.length > 0 ? suggestions : ["Drink plenty of water and plan ahead."]
  };
}
