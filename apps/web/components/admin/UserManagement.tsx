'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface User {
    id: number;
    username: string;
    phoneNumber: string;
    createdAt: string;
    isBanned: boolean;
    bannedAt?: string;
    bannedReason?: string;
    _count: {
        orders: number;
    };
}

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterBanned, setFilterBanned] = useState<boolean | undefined>();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, [search, filterBanned, page]);

    const fetchUsers = async () => {
        try {
            const params: any = { page };
            if (search) params.search = search;
            if (filterBanned !== undefined) params.isBanned = filterBanned;

            const response = await api.get('/admin/users', { params });
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (userId: number) => {
        const reason = prompt('เหตุผลในการแบน:');
        if (!reason) return;

        try {
            await api.put(`/admin/users/${userId}/ban`, { reason });
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to ban user');
        }
    };

    const handleUnban = async (userId: number) => {
        if (!confirm('ต้องการปลดแบนผู้ใช้นี้?')) return;

        try {
            await api.put(`/admin/users/${userId}/unban`);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to unban user');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-white">
                👥 จัดการผู้ใช้
            </h2>

            {/* Filters */}
            <div className="glass-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            ค้นหา
                        </label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="ชื่อหรือเบอร์โทร..."
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            สถานะ
                        </label>
                        <select
                            value={filterBanned === undefined ? '_all' : filterBanned.toString()}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFilterBanned(val === '_all' ? undefined : val === 'true');
                                setPage(1);
                            }}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                        >
                            <option value="_all">ทั้งหมด</option>
                            <option value="false">ปกติ</option>
                            <option value="true">ถูกแบน</option>
                        </select>
                    </div>

                    {/* Refresh Button */}
                    <div className="flex items-end">
                        <Button
                            variant="primary"
                            onClick={fetchUsers}
                            className="w-full"
                        >
                            🔄 รีเฟรช
                        </Button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    ไม่พบผู้ใช้
                </div>
            ) : (
                <>
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ชื่อผู้ใช้</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">เบอร์โทร</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">คำสั่งซื้อ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">สถานะ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">การกระทำ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5">
                                            <td className="px-6 py-4 text-sm text-gray-300">{user.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-white">{user.username}</td>
                                            <td className="px-6 py-4 text-sm text-gray-300">{user.phoneNumber}</td>
                                            <td className="px-6 py-4 text-sm text-gray-300">{user._count.orders}</td>
                                            <td className="px-6 py-4">
                                                {user.isBanned ? (
                                                    <div>
                                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-error/20 text-error border border-error/50">
                                                            ถูกแบน
                                                        </span>
                                                        {user.bannedReason && (
                                                            <p className="text-xs text-gray-500 mt-1">{user.bannedReason}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success border border-success/50">
                                                        ปกติ
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isBanned ? (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleUnban(user.id)}
                                                    >
                                                        ปลดแบน
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleBan(user.id)}
                                                        className="bg-error hover:bg-error/80"
                                                    >
                                                        แบน
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                ← ก่อนหน้า
                            </Button>
                            <span className="px-4 py-2 text-gray-300">
                                หน้า {page} / {totalPages}
                            </span>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                            >
                                ถัดไป →
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
