'use client';

import { useCartStore } from '@/store/cartStore';

interface CartIconProps {
    onClick: () => void;
}

export function CartIcon({ onClick }: CartIconProps) {
    const ticketCount = useCartStore((state) => state.getTicketCount());

    return (
        <button
            onClick={onClick}
            className="relative p-2 hover:bg-white/10 rounded-lg transition-all group"
            aria-label="Shopping Cart"
        >
            <svg
                className="w-6 h-6 text-gray-300 group-hover:text-primary-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
            </svg>

            {ticketCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {ticketCount}
                </span>
            )}
        </button>
    );
}
