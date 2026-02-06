'use client';

import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api/admin';
import { AnalyticsData } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminStats() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000); // 1 min update
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const result = await analyticsApi.getDashboardStats();
            setData(result);
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

    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <div className="text-sm text-gray-400 mb-1">ยอดขายรวม</div>
                    <div className="text-3xl font-heading font-bold text-gradient">
                        ฿ {data.summary.totalSales.toLocaleString()}
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-sm text-gray-400 mb-1">ผู้ใช้งานทั้งหมด</div>
                    <div className="text-3xl font-heading font-bold text-white">
                        {data.summary.activeUsers.toLocaleString()}
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-sm text-gray-400 mb-1">คำสั่งซื้อทั้งหมด</div>
                    <div className="text-3xl font-heading font-bold text-white">
                        {data.summary.totalOrders.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-6">แนวโน้มยอดขาย</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.charts.salesTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                tickFormatter={(str) => new Date(str).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                            />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                labelFormatter={(label) => new Date(label).toLocaleDateString('th-TH')}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

