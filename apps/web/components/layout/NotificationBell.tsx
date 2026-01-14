'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { api } from '@/lib/api';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export function NotificationBell() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000); // Every 30s
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/lottery/notifications/unread-count');
            setUnreadCount(response.data);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/lottery/notifications?limit=10');
            setNotifications(response.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen && notifications.length === 0) {
            fetchNotifications();
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.post(`/lottery/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/lottery/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const getNotificationIcon = (type: string) => {
        const icons: Record<string, string> = {
            NEW_ROUND: '🎰',
            PRIZE_WIN: '🎉',
            CLAIM_APPROVED: '✅',
            CLAIM_REJECTED: '❌',
            CLAIM_PAID: '💰',
            ORDER_EXPIRING: '⏰',
        };
        return icons[type] || '📢';
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={handleOpen}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
                <svg
                    className="w-6 h-6 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-error rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Notification Panel */}
                    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] glass-card border border-white/20 shadow-xl z-50">
                        {/* Header */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">การแจ้งเตือน</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-sm text-primary-400 hover:text-primary-300"
                                    >
                                        อ่านทั้งหมด
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-4xl mb-2">🔔</p>
                                    <p className="text-sm">ไม่มีการแจ้งเตือน</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                        className={`p-4 border-b border-white/10 cursor-pointer transition-colors ${!notification.isRead ? 'bg-primary-500/10 hover:bg-primary-500/20' : 'hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl flex-shrink-0">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-semibold text-white text-sm">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0 mt-1"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(notification.createdAt).toLocaleString('th-TH')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-4 border-t border-white/10 text-center">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push('/notifications');
                                    }}
                                    className="text-sm text-primary-400 hover:text-primary-300"
                                >
                                    ดูทั้งหมด →
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
