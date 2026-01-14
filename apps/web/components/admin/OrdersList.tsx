'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Order {
    id: number;
    userId: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    expiresAt: string;
    user?: {
        username: string;
        phoneNumber: string;
    };
    tickets?: Array<{
        ticketNumber: string;
        price: number;
    }>;
}

export function OrdersList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
        // Refresh every 10 seconds
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/order');
            setOrders(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: 'bg-warning/20 text-warning border-warning/50',
            PAID: 'bg-success/20 text-success border-success/50',
            CANCELLED: 'bg-error/20 text-error border-error/50',
            EXPIRED: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || 'bg-white/10 text-gray-400'}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-6 border-error/20">
                <p className="text-error">Error loading orders: {error}</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <p className="text-gray-400">ไม่มีคำสั่งซื้อในขณะนี้</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading font-bold text-white">
                    คำสั่งซื้อทั้งหมด ({orders.length})
                </h2>
                <button
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                >
                    🔄 รีเฟรช
                </button>
            </div>

            <div className="space-y-3">
                {orders.map((order) => (
                    <div key={order.id} className="glass-card p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-white">
                                        Order #{order.id}
                                    </h3>
                                    {getStatusBadge(order.status)}
                                </div>
                                {order.user && (
                                    <p className="text-sm text-gray-400">
                                        {order.user.username} ({order.user.phoneNumber})
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gradient">
                                    ฿{order.totalAmount.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {order.tickets?.length || 0} สลาก
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-400">สร้างเมื่อ:</span>
                                <span className="text-white ml-2">
                                    {new Date(order.createdAt).toLocaleString('th-TH')}
                                </span>
                            </div>
                            {order.status === 'PENDING' && (
                                <div>
                                    <span className="text-gray-400">หมดอายุ:</span>
                                    <span className="text-warning ml-2">
                                        {new Date(order.expiresAt).toLocaleString('th-TH')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Tickets List */}
                        {order.tickets && order.tickets.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs text-gray-400 mb-2">หมายเลขสลาก:</p>
                                <div className="flex flex-wrap gap-2">
                                    {order.tickets.slice(0, 10).map((ticket, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-white/5 rounded text-sm font-mono text-primary-300"
                                        >
                                            {ticket.ticketNumber}
                                        </span>
                                    ))}
                                    {order.tickets.length > 10 && (
                                        <span className="px-3 py-1 text-sm text-gray-500">
                                            +{order.tickets.length - 10} อื่นๆ
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
