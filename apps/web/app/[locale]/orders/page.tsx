'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserOrders } from '@/lib/api/hooks/useOrders';
import { Button } from '@/components/ui/Button';

type OrderStatus = 'All' | 'Pending' | 'Paid' | 'Expired' | 'Cancelled';

export default function OrdersPage() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<OrderStatus>('All');

    const { data: orders, isLoading } = useUserOrders();

    const filteredOrders = orders?.filter((order: any) =>
        statusFilter === 'All' || order.status === statusFilter
    ) || [];

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
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gradient mb-2">
                        คำสั่งซื้อของฉัน
                    </h1>
                    <p className="text-gray-400">
                        ตรวจสอบประวัติการสั่งซื้อและสลากของคุณ
                    </p>
                </div>

                {/* Filters */}
                <div className="glass-card p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {(['All', 'Pending', 'Paid', 'Expired', 'Cancelled'] as OrderStatus[]).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                    }`}
                            >
                                {status === 'All' ? 'ทั้งหมด' :
                                    status === 'Pending' ? 'รอชำระเงิน' :
                                        status === 'Paid' ? 'ชำระแล้ว' :
                                            status === 'Expired' ? 'หมดอายุ' : 'ยกเลิก'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
                    </div>
                )}

                {/* Orders List */}
                {!isLoading && filteredOrders.length > 0 && (
                    <div className="space-y-4">
                        {filteredOrders.map((order: any) => (
                            <div
                                key={order.id}
                                className="glass-card p-6 hover:shadow-glow transition-all cursor-pointer"
                                onClick={() => router.push(`/orders/${order.id}`)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="text-sm text-gray-400">
                                                เลขที่คำสั่งซื้อ
                                            </div>
                                            <div className="font-mono text-sm text-white">
                                                #{order.id.slice(0, 8).toUpperCase()}
                                            </div>
                                            {getStatusBadge(order.status)}
                                        </div>

                                        <div className="flex items-center gap-6 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(order.createdAt).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                {order.tickets.length} ใบ
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm text-gray-400 mb-1">ยอดรวม</div>
                                            <div className="text-2xl font-heading font-bold text-primary-400">
                                                ฿ {order.totalPrice.toLocaleString()}
                                            </div>
                                        </div>

                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredOrders.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-heading font-bold text-white mb-2">
                            {statusFilter === 'All' ? 'ยังไม่มีคำสั่งซื้อ' : `ไม่มีคำสั่งซื้อที่${statusFilter === 'Pending' ? 'รอชำระเงิน' : statusFilter === 'Paid' ? 'ชำระแล้ว' : 'หมดอายุ'}`}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            เริ่มต้นซื้อสลากเพื่อสร้างคำสั่งซื้อแรกของคุณ
                        </p>
                        <Button variant="primary" onClick={() => router.push('/browse')}>
                            เลือกซื้อสลาก
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
