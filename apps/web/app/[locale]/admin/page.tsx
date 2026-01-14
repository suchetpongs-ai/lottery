'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { AdminStats } from '@/components/admin/AdminStats';
import { CreateRoundForm } from '@/components/admin/CreateRoundForm';
import { UploadTicketsForm } from '@/components/admin/UploadTicketsForm';
import { OrdersList } from '@/components/admin/OrdersList';
import { AnnounceResults } from '@/components/admin/AnnounceResults';
import { UserManagement } from '@/components/admin/UserManagement';
import { ClaimManagement } from '@/components/admin/ClaimManagement';

type TabType = 'stats' | 'rounds' | 'tickets' | 'orders' | 'results' | 'users' | 'claims';

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('stats');

    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated) {
            router.push('/login');
        }
        // TODO: Add admin role check when role system is implemented
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    const tabs = [
        { id: 'stats' as TabType, label: 'สถิติ', icon: '📊' },
        { id: 'rounds' as TabType, label: 'สร้างงวด', icon: '➕' },
        { id: 'tickets' as TabType, label: 'อัพโหลดสลาก', icon: '📤' },
        { id: 'results' as TabType, label: 'ประกาศผล', icon: '🎉' },
        { id: 'users' as TabType, label: 'จัดการผู้ใช้', icon: '👥' },
        { id: 'claims' as TabType, label: 'รับเงินรางวัล', icon: '💰' },
        { id: 'orders' as TabType, label: 'คำสั่งซื้อ', icon: '🛒' },
    ];

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gradient mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400">
                        จัดการระบบสลากกินแบ่งรัฐบาล
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-fadeIn">
                    {activeTab === 'stats' && <AdminStats />}
                    {activeTab === 'rounds' && <CreateRoundForm />}
                    {activeTab === 'tickets' && <UploadTicketsForm />}
                    {activeTab === 'results' && <AnnounceResults />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'claims' && <ClaimManagement />}
                    {activeTab === 'orders' && <OrdersList />}
                </div>
            </div>
        </div>
    );
}
