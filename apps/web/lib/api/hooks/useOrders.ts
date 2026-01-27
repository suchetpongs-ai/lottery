import { useMutation, useQuery, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import apiClient from '../client';

interface CheckoutData {
    ticketIds: number[]; // Backend expects numbers
}

interface Order {
    id: string;
    userId: number;
    totalAmount: number;
    totalPrice: number;
    status: string;
    createdAt: string;
    expireAt: string;
    paidAt?: string;
    items: OrderItem[];
    tickets: OrderItem[];
    payments: Payment[];
}

interface OrderItem {
    id: string;
    orderId: string;
    ticketId: string;
    priceAtPurchase: number;
    ticket: any;
}

interface Payment {
    id: string;
    orderId: string;
    amount: number;
    method: string;
    status: string;
    paidAt: string;
}

export function useCheckout(): UseMutationResult<Order, Error, CheckoutData> {
    return useMutation({
        mutationFn: async (data: CheckoutData) => {
            const response = await apiClient.post('/order/checkout', data);
            return response.data;
        },
    });
}

export function useConfirmPayment(): UseMutationResult<any, Error, string> {
    return useMutation({
        mutationFn: async (orderId: string) => {
            const response = await apiClient.post(`/order/${orderId}/pay`);
            return response.data;
        },
    });
}

export function useUserOrders(): UseQueryResult<Order[], Error> {
    return useQuery({
        queryKey: ['orders', 'user'],
        queryFn: async () => {
            const response = await apiClient.get('/order/my-orders');
            return response.data;
        },
    });
}

export function useOrderById(orderId: string): UseQueryResult<Order, Error> {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const response = await apiClient.get(`/order/${orderId}`);
            return response.data;
        },
        enabled: !!orderId,
    });
}
