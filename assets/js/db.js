/**
 * MockDB - A simple localStorage wrapper to simulate a database.
 * Handles Users, Sessions, and Intake Data.
 */
class MockDB {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('nutri_users')) {
            this.seedData();
        }
    }

    seedData() {
        const users = [
            {
                id: 'u1',
                email: 'admin@nutri.com',
                password: 'password', // In production, never store plain text!
                name: 'Dr. Sarah Smith',
                role: 'admin',
                subscriptionTier: 'pro' // Admin gets pro for testing
            },
            {
                id: 'u2',
                email: 'client@nutri.com',
                password: 'password',
                name: 'John Doe',
                role: 'client',
                subscriptionTier: 'free',
                subscriptionExpiry: null,
                age: 30,
                gender: 'male',
                dietaryPreferences: {
                    dietType: 'omnivore',
                    allergies: []
                }
            },
            {
                id: 'u3',
                email: 'jane@nutri.com',
                password: 'password',
                name: 'Jane Roe',
                role: 'client',
                subscriptionTier: 'premium',
                subscriptionExpiry: '2024-12-31',
                age: 28,
                gender: 'female',
                dietaryPreferences: {
                    dietType: 'vegetarian',
                    allergies: ['peanuts']
                }
            }
        ];

        const clientData = {
            'u2': {
                bmi: 24.5,
                weight: 75,
                height: 175,
                goalWeight: 70, // Goal: Lose 5kg
                weightHistory: [
                    { date: '2023-08-15', weight: 80 },
                    { date: '2023-09-15', weight: 78 },
                    { date: '2023-10-15', weight: 75 }
                ],
                status: 'Normal',
                lastVisist: '2023-10-15',
                intakeCompleted: true
            },
            'u3': {
                bmi: 28.2,
                status: 'Overweight',
                lastVisist: '2023-10-20',
                intakeCompleted: true
            }
        };

        localStorage.setItem('nutri_users', JSON.stringify(users));
        localStorage.setItem('nutri_client_data', JSON.stringify(clientData));
        console.log('MockDB: Database simulated and seeded.');
    }

    // --- User Methods ---

    login(email, password) {
        const users = JSON.parse(localStorage.getItem('nutri_users'));
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Create specific session object
            const session = {
                userId: user.id,
                role: user.role,
                name: user.name,
                token: 'mock-token-' + Date.now()
            };
            localStorage.setItem('nutri_session', JSON.stringify(session));
            return { success: true, user: session };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    logout() {
        localStorage.removeItem('nutri_session');
    }

    getSession() {
        return JSON.parse(localStorage.getItem('nutri_session'));
    }

    // --- Data Methods ---

    getAllClients() {
        const users = JSON.parse(localStorage.getItem('nutri_users'));
        const clientData = JSON.parse(localStorage.getItem('nutri_client_data')) || {};

        return users
            .filter(u => u.role === 'client')
            .map(u => ({
                ...u,
                healthData: clientData[u.id] || {}
            }));
    }

    getClientData(userId) {
        const clientData = JSON.parse(localStorage.getItem('nutri_client_data')) || {};
        return clientData[userId] || null;
    }

    saveIntake(userId, intakeData) {
        const clientData = JSON.parse(localStorage.getItem('nutri_client_data')) || {};

        // --- Risk Analysis Logic ---
        const alerts = [];

        // 1. Obesity Risk (BMI > 30)
        const bmi = parseFloat(intakeData.bmi);
        if (bmi > 30) {
            alerts.push({ type: 'danger', msg: 'Obesity Class I or higher detected.' });
        }

        // 2. Cardiovascular Risk (Waist-to-Hip Ratio)
        const waist = parseFloat(intakeData.waist);
        const hip = parseFloat(intakeData.hip);
        if (waist && hip) {
            const whr = waist / hip;
            const gender = intakeData.gender; // 'male' or 'female'
            if ((gender === 'male' && whr > 0.9) || (gender === 'female' && whr > 0.85)) {
                alerts.push({ type: 'warning', msg: 'High Waist-to-Hip Ratio: Cardiovascular risk.' });
            }
        }

        // 3. Recovery Warning (Sleep < 6)
        const sleep = parseFloat(intakeData.sleepHours);
        if (sleep && sleep < 6) {
            alerts.push({ type: 'warning', msg: 'Low Sleep: Recovery & hormonal balance risk.' });
        }

        // 4. Diabetes Risk (Family History + BMI)
        // Check family history checkbox (assuming 'family_diabetes' value 'yes' or checkbox presence)
        const hasFamilyHistory = intakeData.family_diabetes === 'yes'; // HTML form sends 'yes' if checked? Or need to check existence.

        if (hasFamilyHistory && bmi > 25) {
            alerts.push({ type: 'danger', msg: 'High Diabetes Risk: Family history + overweight.' });
        }

        // Merge existing data with new intake data
        const currentData = clientData[userId] || {};
        const newWeight = parseFloat(intakeData.weight);
        const history = currentData.weightHistory || [];

        // Append current weight to history if different or new day
        const today = new Date().toISOString().split('T')[0];
        const lastEntry = history.length > 0 ? history[history.length - 1] : null;

        if (newWeight && (!lastEntry || lastEntry.date !== today)) {
            history.push({ date: today, weight: newWeight });
        } else if (newWeight && lastEntry && lastEntry.date === today) {
            // Update today's entry
            lastEntry.weight = newWeight;
        }

        clientData[userId] = {
            ...currentData, // Ensure object exists
            ...intakeData,
            weightHistory: history,
            goalWeight: intakeData.goalWeight || currentData.goalWeight,
            alerts: alerts, // Save alerts
            intakeCompleted: true,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem('nutri_client_data', JSON.stringify(clientData));
        return true;
    }

    updateClientProfile(userId, profileData) {
        const clientData = JSON.parse(localStorage.getItem('nutri_client_data')) || {};
        const currentData = clientData[userId] || {};

        // If weight changed, update history
        const newWeight = parseFloat(profileData.weight);
        const currentWeight = parseFloat(currentData.weight);

        if (newWeight && newWeight !== currentWeight) {
            const history = currentData.weightHistory || [];
            const today = new Date().toISOString().split('T')[0];
            const lastEntry = history.length > 0 ? history[history.length - 1] : null;

            if (!lastEntry || lastEntry.date !== today) {
                history.push({ date: today, weight: newWeight });
            } else {
                lastEntry.weight = newWeight;
            }
            currentData.weightHistory = history;
        }

        // Calculate new BMI if height or weight changed
        const height = profileData.height || currentData.height;
        const weight = newWeight || currentData.weight;

        if (height && weight) {
            const heightInMeters = height / 100;
            const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
            profileData.bmi = parseFloat(bmi);

            // Update status
            if (bmi < 18.5) profileData.status = 'Underweight';
            else if (bmi < 25) profileData.status = 'Normal';
            else if (bmi < 30) profileData.status = 'Overweight';
            else profileData.status = 'Obese';
        }

        // Merge profile data
        clientData[userId] = {
            ...currentData,
            ...profileData,
            weightHistory: currentData.weightHistory
        };

        localStorage.setItem('nutri_client_data', JSON.stringify(clientData));
        return true;
    }

    // --- Notes Methods ---

    getNotes(userId) {
        const notes = JSON.parse(localStorage.getItem('nutri_notes')) || {};
        return notes[userId] || '';
    }

    saveNotes(userId, noteContent) {
        const notes = JSON.parse(localStorage.getItem('nutri_notes')) || {};
        notes[userId] = noteContent;
        localStorage.setItem('nutri_notes', JSON.stringify(notes));
    }

    // --- Meal Plan Methods ---

    getMealPlan(userId) {
        const plans = JSON.parse(localStorage.getItem('nutri_meal_plans')) || {};
        return plans[userId] || {};
    }

    saveMealPlan(userId, plan) {
        const plans = JSON.parse(localStorage.getItem('nutri_meal_plans')) || {};
        plans[userId] = plan;
        localStorage.setItem('nutri_meal_plans', JSON.stringify(plans));
    }

    // --- Resource Methods ---

    // --- Resource Methods ---

    getGlobalResources() {
        if (!localStorage.getItem('nutri_resources')) {
            const defaults = [
                { id: 'r1', type: 'article', title: 'Understanding Macros', url: '#' },
                { id: 'r2', type: 'video', title: 'Meal Prep 101', url: '#' },
                { id: 'r3', type: 'guide', title: 'Hydration Habits', url: '#' },
                { id: 'r4', type: 'recipe', title: 'Low Carb Breakfasts', url: '#' }
            ];
            localStorage.setItem('nutri_resources', JSON.stringify(defaults));
        }
        return JSON.parse(localStorage.getItem('nutri_resources'));
    }

    addResource(resource) {
        const resources = this.getGlobalResources();
        resource.id = 'r' + Date.now();
        resources.push(resource);
        localStorage.setItem('nutri_resources', JSON.stringify(resources));
        return resource;
    }

    deleteResource(id) {
        let resources = this.getGlobalResources();
        resources = resources.filter(r => r.id !== id);
        localStorage.setItem('nutri_resources', JSON.stringify(resources));
    }

    getAssignedResources(userId) {
        const assignments = JSON.parse(localStorage.getItem('nutri_resource_assignments')) || {};
        const userResourceIds = assignments[userId] || []; // Should be array of strings
        const all = this.getGlobalResources();
        // filter where ID is in userResourceIds
        return all.filter(r => userResourceIds.includes(r.id));
    }

    assignResource(userId, resourceId) {
        const assignments = JSON.parse(localStorage.getItem('nutri_resource_assignments')) || {};
        if (!assignments[userId]) assignments[userId] = [];

        if (!assignments[userId].includes(resourceId)) {
            assignments[userId].push(resourceId);
        } else {
            // Toggle off if already exists (Fixing previous todo)
            assignments[userId] = assignments[userId].filter(id => id !== resourceId);
        }
        localStorage.setItem('nutri_resource_assignments', JSON.stringify(assignments));
    }

    // --- Subscription Methods ---

    canAccessFeature(userId, featureName) {
        const users = JSON.parse(localStorage.getItem('nutri_users'));
        const user = users.find(u => u.id === userId);

        if (!user) return false;

        const tier = user.subscriptionTier || 'free';

        // Feature definitions by tier
        const features = {
            free: ['intake', 'manual_meal_plan', 'basic_bmi'],
            premium: ['intake', 'manual_meal_plan', 'basic_bmi', 'ai_meal_gen', 'charts', 'pdf_reports', 'limited_resources'],
            pro: ['intake', 'manual_meal_plan', 'basic_bmi', 'ai_meal_gen', 'charts', 'pdf_reports', 'unlimited_resources', 'advanced_analytics']
        };

        return features[tier]?.includes(featureName) || false;
    }

    getUserSubscription(userId) {
        const users = JSON.parse(localStorage.getItem('nutri_users'));
        const user = users.find(u => u.id === userId);
        return {
            tier: user?.subscriptionTier || 'free',
            expiry: user?.subscriptionExpiry || null
        };
    }

    updateSubscription(userId, tier, expiry = null) {
        const users = JSON.parse(localStorage.getItem('nutri_users'));
        const user = users.find(u => u.id === userId);

        if (user) {
            user.subscriptionTier = tier;
            user.subscriptionExpiry = expiry;
            localStorage.setItem('nutri_users', JSON.stringify(users));
            return true;
        }
        return false;
    }

    // --- User Management Methods ---

    getUserByEmail(email) {
        const users = JSON.parse(localStorage.getItem('nutri_users')) || [];
        return users.find(u => u.email === email);
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('nutri_users')) || [];
    }

    addUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('nutri_users', JSON.stringify(users));
        return user;
    }

    saveClientData(userId, data) {
        const clientData = JSON.parse(localStorage.getItem('nutri_client_data')) || {};
        clientData[userId] = {
            ...clientData[userId],
            ...data
        };
        localStorage.setItem('nutri_client_data', JSON.stringify(clientData));
        return true;
    }
}

const db = new MockDB();
