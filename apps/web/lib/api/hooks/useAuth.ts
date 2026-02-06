import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth';
import apiClient from '../client';

interface RegisterData {
    username: string;
    phoneNumber: string;
    password: string;
}

interface LoginData {
    phoneNumber: string;
    password: string;
    twoFactorCode?: string;
}

interface AuthResponse {
    accessToken: string;
    user: {
        id: number;
        username: string;
        phoneNumber: string;
        kycStatus: string;
        role: string;
    };
}

export function useRegister(): UseMutationResult<AuthResponse, Error, RegisterData> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: RegisterData) => {
            const response = await apiClient.post('/auth/register', data);
            // Store token
            if (response.data.accessToken) {
                localStorage.setItem('authToken', response.data.accessToken);
            }
            return response.data;
        },
        onSuccess: (data) => {
            // Update React Query Cache
            queryClient.setQueryData(['user'], data.user);
            queryClient.invalidateQueries({ queryKey: ['user'] });

            // Sync with Zustand Store
            useAuthStore.getState().login(data.accessToken, data.user);
        },
    });
}

export function useLogin(): UseMutationResult<AuthResponse, Error, LoginData> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: LoginData) => {
            const response = await apiClient.post('/auth/login', data);
            // Store token
            // in useLogin mutationFn
            if (response.data.accessToken) {
                localStorage.setItem('authToken', response.data.accessToken);
                document.cookie = `auth_token=${response.data.accessToken}; path=/; max-age=86400`; // 1 day
            }
            return response.data;
        },
        onSuccess: (data) => {
            // Update React Query Cache
            queryClient.setQueryData(['user'], data.user);
            queryClient.invalidateQueries({ queryKey: ['user'] });

            // Sync with Zustand Store
            useAuthStore.getState().login(data.accessToken, data.user);
        },
    });
}

export function useLogout() {
    return () => {
        localStorage.removeItem('authToken');
        document.cookie = 'auth_token=; path=/; max-age=0';
        useAuthStore.getState().logout();
        window.location.href = '/login';
    };
}

export function useUser() {
    return useQuery<AuthResponse['user']>({
        queryKey: ['user'],
        queryFn: async () => {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No token found');
            const response = await apiClient.get('/auth/profile');
            return response.data;
        },
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
