import { useMutation, useQuery, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import apiClient from '../client';

interface CheckoutData {
    ticketIds: string[]; // เปลี่ยนเป็น string[] เพราะ ticket.id เป็น string
}

interface Order {
    id: string;
    userId: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    expireAt: string;
    items: OrderItem[];
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

export function useConfirmPayment(): UseMutationResult<any, Error, number> {
    return useMutation({
        mutationFn: async (orderId: number) => {
            const response = await apiClient.post(`/order/${orderId}/confirm-payment`);
            return response.data;
        },
    });
}

export function useUserOrders(): UseQueryResult<Order[], Error> {
    return useQuery({
        queryKey: ['orders', 'user'],
        queryFn: async () => {
            const response = await apiClient.get('/order/user');
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
