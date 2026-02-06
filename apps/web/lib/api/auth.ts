import { api } from '../api';
import { LoginResponse, User } from '../types';

export const authApi = {
    login: async (credentials: any): Promise<LoginResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (data: any): Promise<LoginResponse> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    setupTwoFactor: async (): Promise<{ secret: string; qrCodeUrl: string }> => {
        const response = await api.post('/auth/2fa/setup');
        return response.data;
    },

    enableTwoFactor: async (code: string): Promise<{ message: string }> => {
        const response = await api.post('/auth/2fa/enable', { code });
        return response.data;
    },

    disableTwoFactor: async (): Promise<{ message: string }> => {
        const response = await api.post('/auth/2fa/disable');
        return response.data;
    },
};
