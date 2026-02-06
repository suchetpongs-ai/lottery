import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    hasHydrated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
    setHasHydrated: (state: boolean) => void;
}


export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            hasHydrated: false,
            login: (token, user) => {
                localStorage.setItem('token', token);
                set({ token, user, isAuthenticated: true });
            },
            logout: () => {
                localStorage.removeItem('token');
                set({ token: null, user: null, isAuthenticated: false });
            },
            setUser: (user) => set({ user }),
            setHasHydrated: (state) => set({ hasHydrated: state }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
