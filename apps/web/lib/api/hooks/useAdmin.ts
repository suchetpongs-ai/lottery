import { apiClient } from '../client';

export function useAdminStats() {
    return useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/stats');
            return data;
        },
    });
}

export function useCreateRound() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (roundData: { drawDate: string; openDate: string }) => {
            const { data } = await apiClient.post('/admin/rounds', roundData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lottery', 'round'] });
        },
    });
}

export function useUploadTickets() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ticketsData: {
            roundId: string;
            tickets: { number: string; price: number; set: number }[];
        }) => {
            const { data } = await apiClient.post('/admin/tickets', ticketsData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lottery'] });
        },
    });
}
