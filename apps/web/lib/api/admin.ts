import { api } from '../api';
import { AnalyticsData, AuditLog } from '../types';

export const analyticsApi = {
    getDashboardStats: async (): Promise<AnalyticsData> => {
        const response = await api.get('/analytics/dashboard');
        return response.data;
    },
};

export const auditApi = {
    getLogs: async (page = 1, limit = 20, userId?: number, action?: string): Promise<{ data: AuditLog[]; pagination: any }> => {
        const params = { page, limit, userId, action };
        const response = await api.get('/audit-logs', { params });
        return response.data;
    },
};
