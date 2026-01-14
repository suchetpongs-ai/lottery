import { useQuery, UseQueryResult } from '@tanstack/react-query';
import apiClient from '../client';

interface Ticket {
    id: string;
    roundId: number;
    number: string;
    price: number;
    setSize: number;
    set?: number;
    status: string; // API ส่งมาเป็น string
    imageUrl?: string;
    round?: Round; // Optional เพราะบางกรณีอาจไม่มี
}

export interface WinningNumbers {
    firstPrize: string;
    nearby: string[];
    threeDigitFront: string[];
    threeDigitBack: string[];
    twoDigit: string[];
}

export interface Round {
    id: number;
    name?: string;
    drawDate: string;
    status: string;
    openSellingAt: string;
    winningNumbers?: WinningNumbers;
}

interface SearchParams {
    number?: string;
    roundId?: number;
    searchType?: 'exact' | 'prefix' | 'suffix';
    page?: number;
    limit?: number;
}

interface SearchResponse {
    data: Ticket[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function useSearchTickets(
    params: SearchParams
): UseQueryResult<SearchResponse, Error> {
    return useQuery({
        queryKey: ['tickets', 'search', params],
        queryFn: async () => {
            const response = await apiClient.get('/lottery/search', { params });
            return response.data;
        },
        enabled: true,
    });
}

export function useCurrentRound(): UseQueryResult<Round, Error> {
    return useQuery({
        queryKey: ['round', 'current'],
        queryFn: async () => {
            const response = await apiClient.get('/lottery/round/current');
            return response.data;
        },
    });
}

export function useTicketById(ticketId: string): UseQueryResult<Ticket, Error> {
    return useQuery({
        queryKey: ['ticket', ticketId],
        queryFn: async () => {
            const response = await apiClient.get(`/lottery/ticket/${ticketId}`);
            return response.data;
        },
        enabled: !!ticketId,
    });
}

export function usePastResults(): UseQueryResult<Round[], Error> {
    return useQuery({
        queryKey: ['results'],
        queryFn: async () => {
            const response = await apiClient.get('/lottery/results');
            return response.data;
        },
    });
}
