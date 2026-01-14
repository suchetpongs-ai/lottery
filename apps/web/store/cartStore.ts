import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartTicket {
    id: string;
    number: string;
    price: number;
    roundId: number | string; // รองรับทั้ง number และ string
    set?: number; // เพิ่ม set property
    status?: string; // เพิ่ม status property
}

interface CartStore {
    tickets: CartTicket[];
    addTicket: (ticket: CartTicket) => void;
    removeTicket: (ticketId: string) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTicketCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            tickets: [],

            addTicket: (ticket) => {
                set((state) => {
                    // Check if ticket already in cart
                    if (state.tickets.find((t) => t.id === ticket.id)) {
                        return state;
                    }
                    return { tickets: [...state.tickets, ticket] };
                });
            },

            removeTicket: (ticketId) => {
                set((state) => ({
                    tickets: state.tickets.filter((t) => t.id !== ticketId),
                }));
            },

            clearCart: () => {
                set({ tickets: [] });
            },

            getTotalPrice: () => {
                return get().tickets.reduce((total, ticket) => total + ticket.price, 0);
            },

            getTicketCount: () => {
                return get().tickets.length;
            },
        }),
        {
            name: 'lottery-cart-storage',
        }
    )
);
