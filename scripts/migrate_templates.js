require('dotenv').config();
const db = require('../config/database');

async function migrate() {
    console.log('🔄 Running template migrations...');

    try {
        // Create meal_plan_templates table
        await db.query(`
      CREATE TABLE IF NOT EXISTS meal_plan_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Meal plan templates table created');

        // Add some default templates
        const defaultTemplates = [
            {
                name: 'Weight Loss Starter',
                description: 'Low calorie, high protein 7-day plan.',
                data: {
                    monday: { b: 'Egg white omelette with spinach', l: 'Grilled chicken salad', d: 'Baked salmon with broccoli' },
                    tuesday: { b: 'Greek yogurt with berries', l: 'Turkey wrap with lettuce', d: 'Lean beef stir-fry' },
                    wednesday: { b: 'Oatmeal with chia seeds', l: 'Tuna salad (no mayo)', d: 'Zucchini noodles with shrimp' },
                    thursday: { b: 'Protein smoothie', l: 'Quinoa bowl with chickpeas', d: 'Grilled turkey breast with asparagus' },
                    friday: { b: 'Cottage cheese with pineapple', l: 'Lentil soup', d: 'Roasted chicken with cauliflower' },
                    saturday: { b: 'Scrambled eggs with avocado', l: 'Shrimp salad', d: 'Baked cod' },
                    sunday: { b: 'Protein pancakes', l: 'Vegetable soup', d: 'Grilled chicken skewers' }
                }
            },
            {
                name: 'Muscle Gain Plan',
                description: 'High calorie, high carb plan for mass building.',
                data: {
                    monday: { b: 'Whole egg omelette + 2 toast', l: 'Chicken breast + brown rice + avocado', d: 'Steak + sweet potato + asparagus' },
                    tuesday: { b: 'Oatmeal with peanut butter & banana', l: 'Pasta with lean ground beef', d: 'Salmon + quinoa + mixed greens' },
                    wednesday: { b: 'Greek yogurt with granola & nuts', l: 'Turkey sandwich on whole grain + fruit', d: 'Chicken thighs + roasted potatoes' },
                    thursday: { b: 'Power smoothie (oats, protein, milk)', l: 'Beef burrito bowl with extra beans', d: 'Pork tenderloin + rice + broccoli' },
                    friday: { b: 'Scrambled eggs with cheese & ham', l: 'Tuna melt on sourdough', d: 'Tofu stir-fry with loads of veggies & rice' },
                    saturday: { b: 'French toast with maple syrup & protein shake', l: 'Burger (lean beef) with side salad', d: 'Lasagna' },
                    sunday: { b: 'Large omelette + bagel', l: 'Leftover lasagna', d: 'Roasted chicken feast' }
                }
            }
        ];

        for (const t of defaultTemplates) {
            await db.query(`
        INSERT INTO meal_plan_templates (name, description, data)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [t.name, t.description, JSON.stringify(t.data)]);
        }
        console.log('✅ Default templates seeded');

        console.log('🎉 Template migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Template migration failed:', error);
        process.exit(1);
    }
}

migrate();
