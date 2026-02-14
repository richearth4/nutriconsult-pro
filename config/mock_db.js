const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

class MockDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, 'db_mock.json');
        this.load();
    }

    load() {
        if (fs.existsSync(this.dbPath)) {
            this.data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
        } else {
            this.data = {
                users: [
                    {
                        id: '7253b216-56be-4581-9964-672522af3918',
                        email: 'admin@nutri.com',
                        password_hash: bcrypt.hashSync('password', 10),
                        name: 'Admin Test',
                        role: 'admin',
                        subscription_tier: 'pro'
                    },
                    {
                        id: 'e499dce4-28b9-43c9-9404-586b3f7de174',
                        email: 'client@nutri.com',
                        password_hash: bcrypt.hashSync('password', 10),
                        name: 'Client Test',
                        role: 'client',
                        subscription_tier: 'free'
                    }
                ],
                client_data: [],
                weight_history: [],
                meal_plans: [],
                resources: [
                    { id: 'r1', title: 'Healthy Eating Guide', type: 'article', url: 'https://example.com/guide' },
                    { id: 'r2', title: 'Macro Calculator', type: 'tool', url: 'https://example.com/macros' }
                ],
                resource_assignments: [],
                consultation_notes: [],
                meal_plan_templates: []
            };
            this.save();
        }
    }

    save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    }

    async query(text, params) {
        // Very basic SQL mock for the most common app queries
        const lowerText = text.toLowerCase().trim();

        // AUTH: Get user by email
        if (lowerText.includes('select') && lowerText.includes('from users') && lowerText.includes('email = $1')) {
            const user = this.data.users.find(u => u.email === params[0]);
            return { rows: user ? [user] : [] };
        }

        // AUTH: Get user by ID
        if (lowerText.includes('select') && lowerText.includes('from users') && lowerText.includes('id = $1')) {
            const user = this.data.users.find(u => u.id === params[0]);
            return { rows: user ? [user] : [] };
        }

        // CLIENTS: Get all clients
        if (lowerText.includes('select') && lowerText.includes('from users') && lowerText.includes("role = 'client'")) {
            const clients = this.data.users.filter(u => u.role === 'client').map(u => {
                const cd = this.data.client_data.find(c => c.user_id === u.id) || {};
                return { ...u, ...cd };
            });
            return { rows: clients };
        }

        // CLIENT DATA: Get by user_id
        if (lowerText.includes('select') && lowerText.includes('from client_data') && lowerText.includes('user_id = $1')) {
            const cd = this.data.client_data.find(c => c.user_id === params[0]);
            return { rows: cd ? [cd] : [] };
        }

        // WEIGHT HISTORY
        if (lowerText.includes('select') && lowerText.includes('from weight_history')) {
            const history = this.data.weight_history.filter(h => h.user_id === params[0]);
            return { rows: history };
        }

        // MEAL PLANS
        if (lowerText.includes('select') && lowerText.includes('from meal_plans')) {
            const plans = this.data.meal_plans.filter(p => p.user_id === params[0]);
            return { rows: plans };
        }

        // NOTES
        if (lowerText.includes('select') && lowerText.includes('from consultation_notes')) {
            const notes = this.data.consultation_notes.filter(n => n.user_id === params[0]);
            return { rows: notes };
        }

        // RESOURCES
        if (lowerText.includes('select') && lowerText.includes('from resources') && !lowerText.includes('assigned')) {
            return { rows: this.data.resources };
        }

        if (lowerText.includes('select') && lowerText.includes('resource_assignments')) {
            const assignments = this.data.resource_assignments.filter(a => a.user_id === params[0]);
            const res = this.data.resources.filter(r => assignments.some(a => a.resource_id === r.id));
            return { rows: res };
        }

        // MEAL PLAN TEMPLATES
        if (lowerText.includes('select') && lowerText.includes('from meal_plan_templates')) {
            return { rows: this.data.meal_plan_templates || [] };
        }

        // INSERT/UPDATE (Simplified)
        if (lowerText.startsWith('insert') || lowerText.startsWith('update')) {
            // Special case for templates insert
            if (lowerText.includes('insert into meal_plan_templates')) {
                const newTemplate = {
                    id: Math.random().toString(36).substring(7),
                    name: params[0],
                    description: params[1],
                    data: typeof params[2] === 'string' ? JSON.parse(params[2]) : params[2],
                    created_at: new Date().toISOString()
                };
                if (!this.data.meal_plan_templates) this.data.meal_plan_templates = [];
                this.data.meal_plan_templates.push(newTemplate);
                this.save();
                return { rows: [newTemplate], rowCount: 1 };
            }
            // For other testing purposes, we'll just say success
            return { rows: [], rowCount: 1 };
        }

        console.warn('Unhandled mock query:', text);
        return { rows: [] };
    }
}

module.exports = new MockDatabase();
