import { useMutation, UseMutationResult } from '@tanstack/react-query';
import apiClient from '../client';

interface RegisterData {
    username: string;
    phoneNumber: string;
    password: string;
}

interface LoginData {
    phoneNumber: string;
    password: string;
}

interface AuthResponse {
    accessToken: string;
    user: {
        id: number;
        username: string;
        phoneNumber: string;
        kycStatus: string;
    };
}

export function useRegister(): UseMutationResult<AuthResponse, Error, RegisterData> {
    return useMutation({
        mutationFn: async (data: RegisterData) => {
            const response = await apiClient.post('/auth/register', data);
            // Store token
            if (response.data.accessToken) {
                localStorage.setItem('authToken', response.data.accessToken);
            }
            return response.data;
        },
    });
}

export function useLogin(): UseMutationResult<AuthResponse, Error, LoginData> {
    return useMutation({
        mutationFn: async (data: LoginData) => {
            const response = await apiClient.post('/auth/login', data);
            // Store token
            if (response.data.accessToken) {
                localStorage.setItem('authToken', response.data.accessToken);
            }
            return response.data;
        },
    });
}

export function useLogout() {
    return () => {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    };
}
