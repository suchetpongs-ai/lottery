'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useCheckout } from '@/lib/api/hooks/useOrders';
import { Button } from '@/components/ui/Button';

export default function CheckoutPage() {
    const router = useRouter();
    const { tickets, getTotalPrice, clearCart } = useCartStore();
    const checkoutMutation = useCheckout();
    const [isProcessing, setIsProcessing] = useState(false);

    // Redirect if cart is empty
    if (tickets.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-white mb-2">ตะกร้าว่างเปล่า</h2>
                    <p className="text-gray-400 mb-6">กรุณาเพิ่มสลากลงตะกร้าก่อนชำระเงิน</p>
                    <Button variant="primary" onClick={() => router.push('/browse')}>
                        เลือกซื้อสลาก
                    </Button>
                </div>
            </div>
        );
    }

    const handleCheckout = async () => {
        try {
            setIsProcessing(true);
            const ticketIds = tickets.map((t) => Number(t.id));
            const order = await checkoutMutation.mutateAsync({ ticketIds });

            // Navigate to payment page
            router.push(`/payment/${order.id}`);
        } catch (error: any) {
            console.error('Checkout failed:', error);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gradient mb-2">
                        ยืนยันคำสั่งซื้อ
                    </h1>
                    <p className="text-gray-400">
                        กรุณาตรวจสอบรายการก่อนดำเนินการชำระเงิน
                    </p>
                </div>

                {/* Order Summary */}
                <div className="glass-card p-8 mb-6">
                    <h2 className="text-2xl font-heading font-bold text-white mb-6">
                        รายการสลาก ({tickets.length} ใบ)
                    </h2>

                    <div className="space-y-4 mb-6">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-heading font-bold text-gradient">
                                            {ticket.number}
                                        </div>
                                        {ticket.set !== undefined && (
                                            <div className="text-sm text-gray-400">
                                                ชุดที่ {ticket.set}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xl font-bold text-primary-400">
                                    ฿ {ticket.price}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10 my-6"></div>

                    {/* Total */}
                    <div className="flex items-center justify-between text-2xl">
                        <span className="text-gray-400 font-medium">ยอดรวมทั้งหมด</span>
                        <span className="text-4xl font-heading font-bold text-gradient">
                            ฿ {getTotalPrice().toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Important Notice */}
                <div className="glass-card p-6 mb-6 border-l-4 border-warning">
                    <div className="flex gap-3">
                        <svg className="w-6 h-6 text-warning flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-warning mb-2">คำเตือนสำคัญ</h3>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li>• คุณมีเวลา 15 นาที ในการชำระเงิน</li>
                                <li>• หากไม่ชำระภายในเวลาที่กำหนด คำสั่งซื้อจะถูกยกเลิกอัตโนมัติ</li>
                                <li>• สลากจะถูกสำรองไว้ให้คุณในระหว่างนี้</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => router.back()}
                        disabled={isProcessing}
                        className="flex-1"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับไปแก้ไข
                    </Button>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleCheckout}
                        isLoading={isProcessing}
                        className="flex-1"
                    >
                        {isProcessing ? 'กำลังสร้างคำสั่งซื้อ...' : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                ยืนยันและชำระเงิน
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
