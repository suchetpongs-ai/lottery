'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Stats {
    totalSales: number;
    ticketsSold: number;
    ticketsAvailable: number;
    activeRounds: number;
    pendingOrders: number;
}

export function AdminStats() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/lottery/stats');
            setStats(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch stats');
        } finally {
            setLoading(false);
        }
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
                <p className="text-error">Error loading stats: {error}</p>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Sales */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div className="text-sm text-gray-400 mb-1">ยอดขายรวม</div>
                <div className="text-3xl font-heading font-bold text-gradient">
                    ฿ {stats.totalSales.toLocaleString()}
                </div>
            </div>

            {/* Tickets Sold */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                </div>
                <div className="text-sm text-gray-400 mb-1">สลากที่ขายแล้ว</div>
                <div className="text-3xl font-heading font-bold text-white">
                    {stats.ticketsSold.toLocaleString()}
                </div>
            </div>

            {/* Tickets Available */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                </div>
                <div className="text-sm text-gray-400 mb-1">สลากคงเหลือ</div>
                <div className="text-3xl font-heading font-bold text-white">
                    {stats.ticketsAvailable.toLocaleString()}
                </div>
            </div>

            {/* Active Rounds */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-error/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div className="text-sm text-gray-400 mb-1">งวดที่เปิดอยู่</div>
                <div className="text-3xl font-heading font-bold text-white">
                    {stats.activeRounds}
                </div>
            </div>
        </div>
    );
}
