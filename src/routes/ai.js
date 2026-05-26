const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const OpenAI = require('openai');
const logger = require('../utils/logger');
const db = require('../config/database');
const MealLogModel = require('../models/mealLogModel');

// Initialize OpenAI conditionally
let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * @route   POST /api/ai/generate-meal-plan
 * @desc    Generate a meal plan using AI
 * @access  Private (Admin only)
 */
router.post('/generate-meal-plan', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can generate AI meal plans' });
        }

        const { clientProfile, days = 7, focus = 'balanced weight loss' } = req.body;

        if (!openai) {
            // Mock response if no API key is present
            console.log('No OpenAI API key found, returning mock meal plan.');
            return res.json({
                success: true,
                mealPlan: {
                    monday: { b: 'Akara (Bean Cakes) with Pap (Ogi)', l: 'Efo Riro with 1 wrap of Pounded Yam', d: 'Light Pepper Soup with Goat Meat' },
                    tuesday: { b: 'Boiled Yam with Egg Sauce', l: 'Jollof Rice with Grilled Chicken', d: 'Okra Soup with Semovita' },
                    wednesday: { b: 'Moi Moi with Custard', l: 'Unripe Plantain Porridge with Ugu', d: 'Catfish Pepper Soup' },
                    thursday: { b: 'Oats with Sliced Bananas', l: 'Ofada Rice with Ayamase Stew', d: 'Vegetable Salad with Suya' },
                    friday: { b: 'Sweet Potatoes with Fish Stew', l: 'Egusi Soup with Eba', d: 'Grilled Titus Fish with Roasted Plantain (Boli)' },
                    saturday: { b: 'Akamu and Bean Pudding', l: 'Fried Rice with Coleslaw', d: 'Edikang Ikong Soup with Wheat' },
                    sunday: { b: 'Pancakes (Plantain-based)', l: 'Sunday Jollof with Fried Turkey', d: 'Fruit Salad and Nuts' }
                },
                isMock: true
            });
        }

        const prompt = `
            You are an expert Nigerian nutritionist. Generate a ${days}-day meal plan for a client with the following profile:
            ${JSON.stringify(clientProfile)}
            
            The focus of this meal plan should be: ${focus}.
            
            CRITICAL INSTRUCTIONS:
            - ONLY use Nigerian local dishes, swallows, and ingredients (e.g., Efo Riro, Amala, Ofada Rice, Ugu, Plantain, Egusi, Suya).
            - Avoid generic western diets like "quinoa", "kale", or "salmon" unless explicitly requested. Suggest local alternatives (e.g. Acha instead of Quinoa, Titus fish instead of Salmon).
            - Use culturally relatable portion sizes when applicable (e.g., "1 wrap", "2 spoons").
            - Be mindful of health conditions common in Nigeria (e.g., reducing palm oil or Maggi for hypertension).
            
            Return ONLY a valid JSON object where keys are the days of the week (lowercase: monday, tuesday, etc.) and values are objects with "b" (breakfast), "l" (lunch), and "d" (dinner) keys containing short meal descriptions.
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const mealPlan = JSON.parse(response.choices[0].message.content);
        res.json({ success: true, mealPlan });

    } catch (error) {
        console.error('AI Meal Plan Error:', error);
        res.status(500).json({ error: 'Failed to generate AI meal plan' });
    }
});

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with the Smart Virtual Assistant
 * @access  Private
 */
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!openai) {
            return res.json({
                success: true,
                reply: "Hello! I am the NutriAI Assistant (Mock Mode). To enable real AI responses, please configure the OPENAI_API_KEY in the server environment.",
                isMock: true
            });
        }

        const messages = [
            { role: 'system', content: 'You are NutriAI, an empathetic, expert virtual nutritionist specializing in the Nigerian diet and lifestyle. Provide helpful, culturally relevant answers about local foods, portions, and wellness. Substitute western advice with Nigerian realities (e.g. using Ugu/Waterleaf, managing Maggi/salt for high BP).' },
            ...history,
            { role: 'user', content: message }
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 300
        });

        res.json({ success: true, reply: response.choices[0].message.content });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to process AI chat response' });
    }
});

/**
 * @route   POST /api/ai/analyze-meal-image
 * @desc    Analyze a meal photo using AI Vision
 * @access  Private
 */
router.post('/analyze-meal-image', authenticateToken, async (req, res) => {
    try {
        const { image } = req.body; // Base64 image string

        if (!openai) {
            // Mock Response for Nigerian Food Recognition
            return res.json({
                success: true,
                isMock: true,
                analysis: {
                    dish: 'Jollof Rice with Grilled Chicken & Fried Plantain (Dodo)',
                    confidence: 0.98,
                    estimatedPortion: '1 standard serving',
                    macros: {
                        calories: 650,
                        protein: '35g',
                        carbs: '85g',
                        fat: '18g'
                    },
                    insights: 'High in protein and carbohydrates. Consider adding a side of steamed vegetables (e.g. Ugu) to increase fiber content.'
                }
            });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert Nigerian nutritionist. Analyze the meal image and return ONLY a JSON object with this EXACT structure:
                    {
                      "dish": "Name of dish",
                      "confidence": 0.95,
                      "estimatedPortion": "Description",
                      "macros": {
                        "calories": "Number only or with kcal",
                        "protein": "Value with g",
                        "carbs": "Value with g",
                        "fat": "Value with g"
                      },
                      "insights": "Short nutritional advice"
                    }`
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this Nigerian meal.' },
                        { type: 'image_url', image_url: { url: image } }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
        });

        const raw = JSON.parse(response.choices[0].message.content);
        console.log('--- RAW AI VISION RESPONSE ---');
        console.log(JSON.stringify(raw, null, 2));

        // Aggressive fuzzy matching helper
        const findVal = (keys, obj) => {
            for (const key of keys) {
                const lowerKey = key.toLowerCase();
                // Check top level
                for (const [k, v] of Object.entries(obj)) {
                    if (k.toLowerCase() === lowerKey) return v;
                }
                // Check nested 'macros', 'nutrients', 'nutritional_info', etc.
                const nested = obj.macros || obj.nutrients || obj.nutritional_info || obj.breakdown || obj.nutrition || {};
                for (const [k, v] of Object.entries(nested)) {
                    if (k.toLowerCase() === lowerKey) return v;
                }
            }
            return 'N/A';
        };

        const analysis = {
            dish: raw.dish || raw.name || raw.meal || 'Unknown Nigerian Dish',
            confidence: raw.confidence || 0.9,
            estimatedPortion: raw.estimatedPortion || raw.portion || 'Standard serving',
            macros: {
                calories: findVal(['calories', 'kcal', 'energy'], raw),
                protein: findVal(['protein', 'prot', 'p'], raw),
                carbs: findVal(['carbs', 'carbohydrates', 'c'], raw),
                fat: findVal(['fat', 'fats', 'f'], raw)
            },
            insights: raw.insights || raw.description || raw.advice || 'Enjoy your meal!'
        };
        
        res.json({ success: true, analysis });

    } catch (error) {
        console.error('AI Vision Error:', error);
        res.status(500).json({ error: 'Failed to analyze meal image' });
    }
});

/**
 * @route   GET /api/ai/today-meals
 * @desc    Get all meals logged today by the user
 * @access  Private
 */
router.post('/save-meal-log', authenticateToken, async (req, res) => {
    logger.info('📥 RECEIVED: Save Meal Log Request', { userId: req.user.userId });
    
    try {
        const { analysis } = req.body; // image excluded — too large for DB
        const userId = req.user.userId;

        if (!analysis || !analysis.macros) {
            logger.error('❌ VALIDATION FAILED: Missing analysis or macros', { body: req.body });
            return res.status(400).json({ error: 'Invalid analysis data' });
        }

        const dish = analysis.dish || 'Unknown Dish';
        const calories = String(analysis.macros.calories || '0');
        const protein = String(analysis.macros.protein || '0');
        const carbs = String(analysis.macros.carbs || '0');
        const fat = String(analysis.macros.fat || '0');

        logger.info('📝 ATTEMPTING DB INSERT', { dish, userId, calories });

        const loggedMeal = await MealLogModel.create({
            userId,
            dish,
            calories,
            protein,
            carbs,
            fat
        });

        logger.info('✅ DB INSERT SUCCESSFUL', { mealLogId: loggedMeal.id });
        res.json({ success: true, message: 'Meal logged successfully', id: loggedMeal.id });

    } catch (error) {
        logger.error('💥 CRITICAL FAILURE in save-meal-log:', {
            errorMessage: error.message,
            dbCode: error.code,
            userId: req.user?.userId
        });
        res.status(500).json({ 
            error: 'Failed to save meal log', 
            details: error.message 
        });
    }
});

router.get('/today-meals', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const meals = await MealLogModel.findRecentByUserId(userId, 10);
        res.json({ success: true, meals });
    } catch (error) {
        logger.error('Error fetching today meals:', error);
        res.status(500).json({ error: 'Failed to fetch meal logs' });
    }
});

module.exports = router;
