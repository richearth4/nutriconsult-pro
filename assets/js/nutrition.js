/**
 * Nutrition Logic Engine
 * Handles BMR, TDEE, and Macro calculations.
 */

class NutritionEngine {
    constructor() { }

    /**
     * Calculate BMR using Mifflin-St Jeor Equation
     */
    calculateBMR(weight, height, age, gender) {
        // Weight in kg, Height in cm, Age in years
        let s = gender === 'female' ? -161 : 5;
        return (10 * weight) + (6.25 * height) - (5 * age) + s;
    }

    /**
     * Calculate Total Daily Energy Expenditure (TDEE)
     */
    calculateTDEE(bmr, activityLevel) {
        const multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        };
        return bmr * (multipliers[activityLevel] || 1.2);
    }

    /**
     * Calculate Target Calories based on Goal
     */
    calculateTargetCalories(tdee, goal) {
        const adjustments = {
            'lose': -500,  // Deficit
            'maintain': 0,
            'gain': 300    // Surplus
        };
        return Math.round(tdee + (adjustments[goal] || 0));
    }

    /**
     * Calculate Macros based on Target Calories and Ratios
     */
    calculateMacros(calories, goal) {
        // Standard Ratios (can be adjusted by goal)
        let ratios = { p: 0.3, f: 0.25, c: 0.45 };

        if (goal === 'lose') ratios = { p: 0.4, f: 0.3, c: 0.3 };
        if (goal === 'gain') ratios = { p: 0.3, f: 0.2, c: 0.5 };

        return {
            protein: Math.round((calories * ratios.p) / 4), // 4 cal/g
            fat: Math.round((calories * ratios.f) / 9),     // 9 cal/g
            carbs: Math.round((calories * ratios.c) / 4)    // 4 cal/g
        };
    }

    /**
     * Generate Full Recommendation
     */
    generateRecommendations(clientData) {
        // Defaults if missing data
        const weight = parseFloat(clientData.weight) || 70;
        const height = parseFloat(clientData.height) || 170;
        const age = 30; // Default age if not captured in intake (TODO: Add DOB to Step 1 properly)
        const gender = clientData.gender || 'female';
        const activity = clientData.activity || 'sedentary';
        const goal = clientData.goal || 'lose'; // Default goal

        const bmr = this.calculateBMR(weight, height, age, gender);
        const tdee = this.calculateTDEE(bmr, activity);
        const targetCalories = this.calculateTargetCalories(tdee, goal);
        const macros = this.calculateMacros(targetCalories, goal);

        return {
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories,
            macros,
            goal
        };
    }
    /**
     * Generate Meal Plan
     */
    generateMealPlan(targetCalories, preferences = {}) {
        // Expanded Meal Database
        const mealDB = {
            breakfast: [
                { name: "Oatmeal with Blueberries & Almonds", cal: 350, p: 12, f: 10, c: 55, tags: ['vegetarian', 'vegan'], allergens: ['tree nuts'] },
                { name: "Vegetable Omelette", cal: 300, p: 20, f: 18, c: 5, tags: ['vegetarian'], allergens: ['eggs', 'dairy'] },
                { name: "Greek Yogurt Parfait", cal: 280, p: 22, f: 6, c: 35, tags: ['vegetarian'], allergens: ['dairy'] },
                { name: "Avocado Toast with Egg", cal: 400, p: 15, f: 20, c: 30, tags: ['vegetarian'], allergens: ['eggs', 'gluten'] },
                { name: "Smoothie Bowl", cal: 320, p: 10, f: 8, c: 50, tags: ['vegetarian', 'vegan'], allergens: [] }
            ],
            lunch: [
                { name: "Grilled Chicken Salad", cal: 450, p: 40, f: 20, c: 15, tags: [], allergens: [] },
                { name: "Quinoa & Black Bean Bowl", cal: 500, p: 18, f: 15, c: 75, tags: ['vegetarian', 'vegan'], allergens: [] },
                { name: "Turkey Wrap", cal: 420, p: 30, f: 12, c: 45, tags: [], allergens: ['gluten'] },
                { name: "Lentil Soup with Bread", cal: 380, p: 18, f: 5, c: 60, tags: ['vegetarian', 'vegan'], allergens: ['gluten'] },
                { name: "Tuna Salad Nicoise", cal: 400, p: 35, f: 22, c: 10, tags: ['pescatarian'], allergens: ['fish'] }
            ],
            dinner: [
                { name: "Baked Salmon with Asparagus", cal: 550, p: 45, f: 25, c: 10, tags: ['pescatarian'], allergens: ['fish'] },
                { name: "Stir-Fry Tofu & Veggies", cal: 400, p: 20, f: 15, c: 50, tags: ['vegetarian', 'vegan'], allergens: ['soy'] },
                { name: "Lean Beef Tacos", cal: 600, p: 35, f: 28, c: 40, tags: [], allergens: ['gluten', 'dairy'] },
                { name: "Zucchini Noodles with Pesto", cal: 350, p: 8, f: 25, c: 15, tags: ['vegetarian', 'vegan', 'keto'], allergens: ['tree nuts'] },
                { name: "Chicken Curry with Rice", cal: 550, p: 30, f: 20, c: 60, tags: [], allergens: [] }
            ]
        };

        // Enhanced filtering: diet type AND allergies
        const filterMealsByPreferences = (meals, preferences) => {
            let filtered = meals;

            // Filter by diet type
            if (preferences.dietType && preferences.dietType !== 'omnivore') {
                filtered = filtered.filter(m => m.tags.includes(preferences.dietType));
            }

            // Filter by allergies
            if (preferences.allergies && preferences.allergies.length > 0) {
                filtered = filtered.filter(meal => {
                    // Check if meal contains any allergens
                    const allergens = meal.allergens || [];
                    return !preferences.allergies.some(allergy =>
                        allergens.includes(allergy.toLowerCase())
                    );
                });
            }

            return filtered.length > 0 ? filtered : meals; // Fallback to all if no matches
        };

        // Apply preference filtering
        let breakfastOptions = filterMealsByPreferences(mealDB.breakfast, preferences);
        let lunchOptions = filterMealsByPreferences(mealDB.lunch, preferences);
        let dinnerOptions = filterMealsByPreferences(mealDB.dinner, preferences);

        // Helper to pick random
        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

        // Try to distribute calories: 25% B, 35% L, 40% D
        const b = pick(breakfastOptions);
        const l = pick(lunchOptions);
        const d = pick(dinnerOptions);

        const totalCal = b.cal + l.cal + d.cal;
        const totalMacros = {
            p: b.p + l.p + d.p,
            f: b.f + l.f + d.f,
            c: b.c + l.c + d.c
        };

        return {
            meals: {
                breakfast: b.name,
                lunch: l.name,
                dinner: d.name
            },
            stats: {
                calories: totalCal,
                macros: totalMacros
            }
        };
    }
}

const nutritionEngine = new NutritionEngine();
