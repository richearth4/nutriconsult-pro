import api from './index';

export const authApi = {
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    verify: async () => {
        const response = await api.get('/auth/verify');
        return response.data;
    }
};
