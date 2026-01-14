import React from 'react';
import { Button } from '../ui/Button';
import { useCartStore } from '@/store/cartStore';

interface TicketCardProps {
    ticket: {
        id: string;
        number: string;
        price: number;
        status: string; // รับ string ทั่วไปจาก API
        set: number;
        roundId: string;
    };
    onViewDetails?: () => void;
}

export function TicketCard({ ticket, onViewDetails }: TicketCardProps) {
    const addTicket = useCartStore((state) => state.addTicket);
    const cartTickets = useCartStore((state) => state.tickets);

    const isInCart = cartTickets.some((t) => t.id === ticket.id);
    const isAvailable = ticket.status === 'Available';

    const handleAddToCart = () => {
        if (isAvailable && !isInCart) {
            addTicket(ticket);
        }
    };

    const getStatusBadge = () => {
        const badges: Record<string, string> = {
            Available: 'bg-success/20 text-success',
            Reserved: 'bg-warning/20 text-warning',
            Sold: 'bg-error/20 text-error',
        };

        const badgeClass = badges[ticket.status] || 'bg-gray/20 text-gray-400';

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                {ticket.status === 'Available' ? 'ว่าง' : ticket.status === 'Reserved' ? 'จอง' : 'ขายแล้ว'}
            </span>
        );
    };

    return (
        <div className="glass-card p-6 hover:shadow-glow transition-all duration-300 group relative">
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">เลขสลาก</span>
                {getStatusBadge()}
            </div>

            {/* Ticket Number */}
            <div
                className="ticket-number mb-4 group-hover:scale-110 transition-transform cursor-pointer"
                onClick={onViewDetails}
            >
                {ticket.number}
            </div>

            {/* Price & Set */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-400">
                    <div>ชุดที่ {ticket.set}</div>
                </div>
                <div className="text-2xl font-bold text-primary-400">
                    ฿ {ticket.price}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {isInCart ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        อยู่ในตะกร้า
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={handleAddToCart}
                        disabled={!isAvailable}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {isAvailable ? 'เพิ่มในตะกร้า' : 'ไม่สามารถซื้อได้'}
                    </Button>
                )}

                {onViewDetails && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onViewDetails}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </Button>
                )}
            </div>
        </div>
    );
}
