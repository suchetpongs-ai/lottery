'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOrderById } from '@/lib/api/hooks/useOrders';
import { Button } from '@/components/ui/Button';

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const { data: order, isLoading } = useOrderById(orderId);

    const getStatusBadge = (status: string) => {
        const badges = {
            Pending: 'bg-warning/20 text-warning',
            Paid: 'bg-success/20 text-success',
            Expired: 'bg-error/20 text-error',
            Cancelled: 'bg-gray-500/20 text-gray-400',
        };

        const labels = {
            Pending: 'รอชำระเงิน',
            Paid: 'ชำระเงินแล้ว',
            Expired: 'หมดอายุ',
            Cancelled: 'ยกเลิก',
        };

        return (
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
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
                    <p className="text-gray-400 mb-6">คำสั่งซื้อนี้ไม่มีอยู่ในระบบ</p>
                    <Button variant="primary" onClick={() => router.push('/orders')}>
                        กลับไปดูคำสั่งซื้อทั้งหมด
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" onClick={() => router.push('/orders')}>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            กลับ
                        </Button>
                    </div>
                    <h1 className="text-4xl font-heading font-bold text-gradient mb-2">
                        รายละเอียดคำสั่งซื้อ
                    </h1>
                    <p className="text-gray-400">
                        เลขที่คำสั่งซื้อ: <span className="font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                </div>

                {/* Order Status Card */}
                <div className="glass-card p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="text-sm text-gray-400 mb-2">สถานะ</div>
                            {getStatusBadge(order.status)}
                        </div>
                        <div>
                            <div className="text-sm text-gray-400 mb-2">วันที่สั่งซื้อ</div>
                            <div className="text-white">
                                {new Date(order.createdAt).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        </div>
                        {order.status === 'Paid' && order.paidAt && (
                            <div>
                                <div className="text-sm text-gray-400 mb-2">วันที่ชำระเงิน</div>
                                <div className="text-white">
                                    {new Date(order.paidAt).toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        )}
                        {order.status === 'Pending' && (
                            <div>
                                <div className="text-sm text-gray-400 mb-2">หมดอายุ</div>
                                <div className="text-warning">
                                    {new Date(order.expireAt).toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tickets List */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-2xl font-heading font-bold text-white mb-6">
                        รายการสลาก ({order.tickets.length} ใบ)
                    </h2>

                    <div className="space-y-4">
                        {order.tickets.map((item: any, index: number) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                        <span className="text-primary-400 font-bold">#{index + 1}</span>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-heading font-bold text-gradient mb-1">
                                            {item.ticket.number}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            ชุดที่ {item.ticket.set}
                                            {item.ticket.status && (
                                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${item.ticket.status === 'Sold' ? 'bg-success/20 text-success' :
                                                        item.ticket.status === 'Reserved' ? 'bg-warning/20 text-warning' :
                                                            'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {item.ticket.status === 'Sold' ? 'ขายแล้ว' :
                                                        item.ticket.status === 'Reserved' ? 'จอง' : 'ว่าง'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xl font-bold text-primary-400">
                                    ฿ {item.price.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-heading font-bold text-white mb-6">
                        สรุปการชำระเงิน
                    </h2>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-gray-300">
                            <span>จำนวนสลาก</span>
                            <span>{order.tickets.length} ใบ</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-300">
                            <span>ราคาต่อใบ</span>
                            <span>฿ {(order.totalPrice / order.tickets.length).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between text-2xl">
                            <span className="text-gray-400 font-semibold">ยอดรวมทั้งหมด</span>
                            <span className="text-4xl font-heading font-bold text-gradient">
                                ฿ {order.totalPrice.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Actions based on status */}
                    <div className="mt-6">
                        {order.status === 'Pending' && (
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full"
                                onClick={() => router.push(`/payment/${order.id}`)}
                            >
                                ดำเนินการชำระเงิน
                            </Button>
                        )}
                        {order.status === 'Paid' && (
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full"
                                onClick={() => window.print()}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                พิมพ์ใบเสร็จ
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
