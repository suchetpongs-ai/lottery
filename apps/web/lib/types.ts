export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum KycStatus {
    UNVERIFIED = 'Unverified',
    PENDING = 'Pending',
    VERIFIED = 'Verified',
    REJECTED = 'Rejected',
}

export interface User {
    id: number;
    username: string;
    phoneNumber: string;
    role: UserRole;
    kycStatus: KycStatus;
    twoFactorEnabled: boolean;
    createdAt?: string;
    lastLoginAt?: string;
}

export interface LoginResponse {
    accessToken: string;
    user: User;
}

export interface AnalyticsData {
    summary: {
        totalSales: number;
        activeUsers: number;
        totalOrders: number;
    };
    charts: {
        salesTrend: { date: string; value: number }[];
    };
}

export interface AuditLog {
    id: number;
    action: string;
    resource: string;
    resourceId?: string;
    userId?: number;
    user?: {
        username: string;
        role: string;
    };
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}
