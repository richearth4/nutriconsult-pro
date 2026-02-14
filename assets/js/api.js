// Production API Configuration
const API_CONFIG = {
    baseURL: 'https://nutriconsult-pro-production.up.railway.app',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
};

// API Helper Functions
const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('nutri_token');
        const config = {
            ...options,
            headers: {
                ...API_CONFIG.headers,
                ...options.headers,
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        try {
            const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth endpoints
    async login(email, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async register(email, password, name) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });
    },

    async verifyToken() {
        return this.request('/api/auth/verify');
    },

    // Client endpoints
    async getClientData(userId) {
        return this.request(`/api/clients/${userId}`);
    },

    async updateClientProfile(userId, data) {
        return this.request(`/api/clients/${userId}/profile`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async getWeightHistory(userId) {
        return this.request(`/api/clients/${userId}/weight-history`);
    },

    async updateClientData(userId, data) {
        return this.request(`/api/clients/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async saveIntake(userId, intakeData) {
        return this.request(`/api/clients/${userId}/intake`, {
            method: 'POST',
            body: JSON.stringify(intakeData)
        });
    },

    // Meal plan endpoints
    async getMealPlan(userId) {
        return this.request(`/api/mealplans/${userId}`);
    },

    async saveMealPlan(userId, day, meals) {
        return this.request(`/api/mealplans/${userId}`, {
            method: 'POST',
            body: JSON.stringify({ day, ...meals })
        });
    },

    async getTemplates() {
        return this.request('/api/mealplans/templates');
    },

    async applyTemplate(userId, templateId) {
        return this.request(`/api/mealplans/${userId}/apply-template`, {
            method: 'POST',
            body: JSON.stringify({ templateId })
        });
    },

    // Resource endpoints
    async getResources() {
        return this.request('/api/resources');
    },

    async getAssignedResources(userId) {
        return this.request(`/api/resources/assigned/${userId}`);
    },

    async assignResource(userId, resourceId) {
        return this.request('/api/resources/assign', {
            method: 'POST',
            body: JSON.stringify({ userId, resourceId })
        });
    },

    async addResource(resource) {
        return this.request('/api/resources', {
            method: 'POST',
            body: JSON.stringify(resource)
        });
    },

    async deleteResource(resourceId) {
        return this.request(`/api/resources/${resourceId}`, {
            method: 'DELETE'
        });
    },

    // Admin endpoints
    async getAllClients() {
        return this.request('/api/clients');
    },

    async saveNotes(userId, notes) {
        return this.request(`/api/clients/${userId}/notes`, {
            method: 'POST',
            body: JSON.stringify({ notes })
        });
    },

    async getNotes(userId) {
        try {
            const data = await this.request(`/api/clients/${userId}/notes`);
            return data.notes;
        } catch (e) {
            return '';
        }
    },

    // Analytics endpoints
    async getAnalyticsSummary() {
        return this.request('/api/analytics/summary');
    },

    async getAnalyticsTrends() {
        return this.request('/api/analytics/trends');
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}
