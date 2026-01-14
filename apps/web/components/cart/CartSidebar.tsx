'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { Button } from '../ui/Button';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
    const router = useRouter();
    const { tickets, removeTicket, clearCart, getTotalPrice, getTicketCount } = useCartStore();

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-secondary-800 border-l border-white/10 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h2 className="text-xl font-heading font-bold text-white">
                                ตะกร้าของฉัน
                                {getTicketCount() > 0 && (
                                    <span className="ml-2 text-sm text-primary-400">({getTicketCount()})</span>
                                )}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-400 mb-2">ตะกร้าว่างเปล่า</h3>
                                <p className="text-sm text-gray-500 mb-6">เพิ่มสลากลงตะกร้าเพื่อเริ่มซื้อ</p>
                                <Button variant="primary" onClick={onClose}>
                                    เลือกซื้อสลาก
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="glass-card p-4 flex items-center justify-between group hover:shadow-glow transition-all"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-gray-400">เลขสลาก</span>
                                                <span className="px-2 py-0.5 bg-success/20 text-success text-xs rounded-full">
                                                    ว่าง
                                                </span>
                                            </div>
                                            <div className="text-2xl font-heading font-bold text-gradient">
                                                {ticket.number}
                                            </div>
                                            <div className="text-sm text-gray-400 mt-1">
                                                ชุดที่ {ticket.set}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-primary-400">
                                                    ฿ {ticket.price}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeTicket(ticket.id)}
                                                className="p-2 hover:bg-error/20 rounded-lg transition-colors group-hover:opacity-100 opacity-0"
                                                aria-label="Remove ticket"
                                            >
                                                <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {tickets.length > 0 && (
                        <div className="border-t border-white/10 p-6 space-y-4">
                            {/* Total */}
                            <div className="flex items-center justify-between text-lg">
                                <span className="text-gray-400">ยอดรวม</span>
                                <span className="text-3xl font-heading font-bold text-gradient">
                                    ฿ {getTotalPrice().toLocaleString()}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    onClick={handleCheckout}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    ดำเนินการชำระเงิน
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างตะกร้า?')) {
                                            clearCart();
                                        }
                                    }}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    ล้างตะกร้า
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
