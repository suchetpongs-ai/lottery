'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Stats {
    totalSales: number;
    salesToday: number;
    salesYesterday: number;
    ticketsSold: number;
    ticketsAvailable: number;
    activeRounds: number;
    pendingOrders: number;
    totalUsers: number;
    newUsersToday: number;
}

export function AdminStats() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
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

    const salesGrowth = stats.salesYesterday > 0
        ? ((stats.salesToday - stats.salesYesterday) / stats.salesYesterday) * 100
        : 100;

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
                    {stats.salesToday > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${salesGrowth >= 0 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                            {salesGrowth >= 0 ? '+' : ''}{salesGrowth.toFixed(1)}%
                        </span>
                    )}
                </div>
                <div className="text-sm text-gray-400 mb-1">ยอดขายวันนี้</div>
                <div className="text-3xl font-heading font-bold text-gradient">
                    ฿ {stats.salesToday.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    รวมทั้งหมด ฿ {stats.totalSales.toLocaleString()}
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
                <div className="text-xs text-gray-500 mt-2">
                    คงเหลือ {stats.ticketsAvailable.toLocaleString()} ใบ
                </div>
            </div>

            {/* Users */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    {stats.newUsersToday > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-info/20 text-info">
                            +{stats.newUsersToday} วันนี้
                        </span>
                    )}
                </div>
                <div className="text-sm text-gray-400 mb-1">สมาชิกทั้งหมด</div>
                <div className="text-3xl font-heading font-bold text-white">
                    {stats.totalUsers.toLocaleString()}
                </div>
            </div>

            {/* Active Rounds */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div className="text-sm text-gray-400 mb-1">งวดที่เปิดอยู่</div>
                <div className="text-3xl font-heading font-bold text-white">
                    {stats.activeRounds}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    รอการตรวจสอบ {stats.pendingOrders} คำสั่งซื้อ
                </div>
            </div>
        </div>
    );
}
