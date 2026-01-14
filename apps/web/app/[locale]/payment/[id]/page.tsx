'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CountdownTimer } from '@/components/checkout/CountdownTimer';
import { Button } from '@/components/ui/Button';
import { useOrderById, useConfirmPayment } from '@/lib/api/hooks/useOrders';
import { useCartStore } from '@/store/cartStore';

export default function PaymentPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;

    const { data: order, isLoading } = useOrderById(orderId);
    const confirmPaymentMutation = useConfirmPayment();
    const clearCart = useCartStore((state) => state.clearCart);

    const [isConfirming, setIsConfirming] = useState(false);

    const handleExpire = () => {
        alert('หมดเวลาชำระเงิน คำสั่งซื้อถูกยกเลิกแล้ว');
        router.push('/browse');
    };

    const handleConfirmPayment = async () => {
        try {
            setIsConfirming(true);
            await confirmPaymentMutation.mutateAsync(orderId);

            // Clear cart after successful payment
            clearCart();

            // Show success and redirect
            alert('ชำระเงินสำเร็จ! คุณสามารถตรวจสอบคำสั่งซื้อได้ที่หน้า "คำสั่งซื้อของฉัน"');
            router.push('/orders');
        } catch (error: any) {
            console.error('Payment confirmation failed:', error);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการยืนยันการชำระเงิน');
        } finally {
            setIsConfirming(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-heading font-bold text-white mb-2">ไม่พบคำสั่งซื้อ</h2>
                    <p className="text-gray-400 mb-6">คำสั่งซื้อนี้ไม่มีอยู่ หรือถูกยกเลิกไปแล้ว</p>
                    <Button variant="primary" onClick={() => router.push('/browse')}>
                        กลับไปเลือกซื้อสลาก
                    </Button>
                </div>
            </div>
        );
    }

    const isPending = order.status === 'Pending';
    const isPaid = order.status === 'Paid';
    const isExpired = order.status === 'Expired';

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gradient mb-4">
                        {isPaid ? '✓ ชำระเงินสำเร็จ' : 'ชำระเงิน'}
                    </h1>

                    {isPending && (
                        <>
                            <p className="text-gray-400 mb-4">
                                กรุณาชำระเงินภายในเวลาที่กำหนด
                            </p>
                            <CountdownTimer
                                expireAt={order.expireAt}
                                onExpire={handleExpire}
                            />
                        </>
                    )}
                </div>

                {/* Order Info */}
                <div className="glass-card p-8 mb-6">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                        <div>
                            <div className="text-sm text-gray-400 mb-1">เลขที่คำสั่งซื้อ</div>
                            <div className="font-mono text-lg text-white">#{order.id.slice(0, 8).toUpperCase()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400 mb-1">สถานะ</div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isPaid ? 'bg-success/20 text-success' :
                                    isPending ? 'bg-warning/20 text-warning' :
                                        'bg-error/20 text-error'
                                }`}>
                                {isPaid ? 'ชำระเงินแล้ว' : isPending ? 'รอชำระเงิน' : 'หมดอายุ'}
                            </span>
                        </div>
                    </div>

                    {/* Tickets */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-4">รายการสลาก</h3>
                        <div className="space-y-3">
                            {order.tickets.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                >
                                    <div className="font-heading font-bold text-xl text-gradient">
                                        {item.ticket.number}
                                    </div>
                                    <div className="text-primary-400 font-semibold">
                                        ฿ {item.price}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-white/10 pt-6">
                        <div className="flex items-center justify-between text-2xl">
                            <span className="text-gray-400">ยอดรวม</span>
                            <span className="text-4xl font-heading font-bold text-gradient">
                                ฿ {order.totalPrice.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Method (Mock) */}
                {isPending && (
                    <div className="glass-card p-8 mb-6">
                        <h3 className="text-xl font-heading font-bold text-white mb-4">
                            วิธีการชำระเงิน
                        </h3>

                        {/* Mock QR Code */}
                        <div className="bg-white p-8 rounded-lg mb-6 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-gray-500 text-sm">Mock QR Code</span>
                                </div>
                                <p className="text-gray-700 text-sm">
                                    สแกน QR Code เพื่อชำระเงิน
                                </p>
                            </div>
                        </div>

                        {/* Payment Instructions */}
                        <div className="space-y-2 text-sm text-gray-300 mb-6">
                            <p>📱 1. เปิดแอพธนาคารของคุณ</p>
                            <p>📷 2. สแกน QR Code ด้านบน</p>
                            <p>💰 3. ตรวจสอบยอดเงิน ฿ {order.totalPrice.toLocaleString()}</p>
                            <p>✅ 4. ยืนยันการชำระเงิน</p>
                            <p>🎫 5. กดปุ่ม "ยืนยันการชำระเงิน" ด้านล่าง</p>
                        </div>

                        {/* Confirm Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={handleConfirmPayment}
                            isLoading={isConfirming}
                        >
                            {isConfirming ? 'กำลังยืนยัน...' : 'ยืนยันการชำระเงิน'}
                        </Button>
                    </div>
                )}

                {/* Success Message */}
                {isPaid && (
                    <div className="glass-card p-8 text-center border-l-4 border-success">
                        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-heading font-bold text-success mb-2">
                            ชำระเงินสำเร็จ!
                        </h3>
                        <p className="text-gray-300 mb-6">
                            คำสั่งซื้อของคุณได้รับการยืนยันแล้ว
                        </p>
                        <Button variant="primary" onClick={() => router.push('/orders')}>
                            ดูคำสั่งซื้อทั้งหมด
                        </Button>
                    </div>
                )}

                {/* Back Button */}
                <div className="text-center mt-6">
                    <Button variant="ghost" onClick={() => router.push('/browse')}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับหน้าแรก
                    </Button>
                </div>
            </div>
        </div>
    );
}
