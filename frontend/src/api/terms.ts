import api from './index';

export const termsApi = {
    getLatest: async () => {
        const response = await api.get('/terms');
        return response.data;
    },
    checkStatus: async () => {
        const response = await api.get('/terms/status');
        return response.data;
    },
    accept: async (termsId: string) => {
        const response = await api.post('/terms/accept', { termsId });
        return response.data;
    },
    update: async (content: string) => {
        const response = await api.post('/terms/update', { content });
        return response.data;
    }
};
