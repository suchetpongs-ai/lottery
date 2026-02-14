'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface Claim {
    id: number;
    ticketId: number;
    userId: number;
    amount: number;
    status: string;
    claimedAt: string;
    rejectionReason?: string;
    ticket: {
        number: string;
        prizeTier: string;
    };
    user: {
        username: string;
        phoneNumber: string;
    };
}

type TabType = 'pending' | 'history';

export function ClaimManagement() {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('pending');

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            // Fetch all claims
            const response = await api.get('/admin/claims');
            setClaims(response.data);
        } catch (err) {
            console.error('Failed to fetch claims:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (claimId: number) => {
        if (!confirm('ยืนยันการอนุมัติการรับเงินรางวัล?')) return;

        try {
            await api.put(`/admin/claims/${claimId}/approve`);
            fetchClaims();
            alert('อนุมัติสำเร็จ!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to approve claim');
        }
    };

    const handleReject = async (claimId: number) => {
        const reason = prompt('เหตุผลที่ปฏิเสธ:');
        if (!reason) return;

        try {
            await api.put(`/admin/claims/${claimId}/reject`, { reason });
            fetchClaims();
            alert('ปฏิเสธสำเร็จ!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to reject claim');
        }
    };

    const handleMarkAsPaid = async (claimId: number) => {
        if (!confirm('ยืนยันว่าได้โอนเงินรางวัลเรียบร้อยแล้ว?')) return;

        try {
            await api.put(`/admin/claims/${claimId}/pay`);
            fetchClaims();
            alert('อัปเดตสถานะสำเร็จ!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to mark as paid');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-warning/20 text-warning border-warning/50',
            APPROVED: 'bg-success/20 text-success border-success/50',
            REJECTED: 'bg-error/20 text-error border-error/50',
            PAID: 'bg-primary-500/20 text-primary-300 border-primary-500/50',
        };

        const labels: Record<string, string> = {
            PENDING: 'รออนุมัติ',
            APPROVED: 'อนุมัติแล้ว (รอโอน)',
            REJECTED: 'ปฏิเสธ',
            PAID: 'จ่ายเงินแล้ว',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || ''}`}>
                {labels[status] || status}
            </span>
        );
    };

    // Filter claims based on active tab
    const filteredClaims = claims.filter(claim => {
        if (activeTab === 'pending') {
            return claim.status === 'PENDING' || claim.status === 'APPROVED';
        } else {
            return claim.status === 'PAID' || claim.status === 'REJECTED';
        }
    });

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-white">
                💰 จัดการการรับเงินรางวัล
            </h2>

            {/* Tabs */}
            <div className="border-b border-white/10">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === 'pending'
                                ? 'border-primary-500 text-primary-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'}
                        `}
                    >
                        📝 รับเงินรางวัล ({claims.filter(c => c.status === 'PENDING' || c.status === 'APPROVED').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === 'history'
                                ? 'border-primary-500 text-primary-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'}
                        `}
                    >
                        ✅ รับเงินรางวัลแล้ว / ประวัติ ({claims.filter(c => c.status === 'PAID' || c.status === 'REJECTED').length})
                    </button>
                </nav>
            </div>

            {/* Claims Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
                </div>
            ) : filteredClaims.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    {activeTab === 'pending' ? 'ไม่มีรายการที่ต้องดำเนินการ' : 'ไม่มีประวัติการจ่ายเงินรางวัล'}
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">หมายเลขสลาก</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ผู้ใช้</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">รางวัล</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">จำนวนเงิน</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">สถานะ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">วันที่ขอ/ดำเนินการ</th>
                                    {activeTab === 'pending' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">การกระทำ</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredClaims.map((claim) => (
                                    <tr key={claim.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 text-sm font-mono font-bold text-white">
                                            {claim.ticket.number}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <p className="text-white font-medium">{claim.user.username}</p>
                                            <p className="text-gray-500 text-xs">{claim.user.phoneNumber}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {claim.ticket.prizeTier}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-primary-300">
                                            ฿{claim.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(claim.status)}
                                            {claim.rejectionReason && (
                                                <p className="text-xs text-error mt-1">{claim.rejectionReason}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(claim.claimedAt).toLocaleDateString('th-TH')}
                                        </td>
                                        {activeTab === 'pending' && (
                                            <td className="px-6 py-4">
                                                {claim.status === 'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleApprove(claim.id)}
                                                            className="bg-success hover:bg-success/80"
                                                        >
                                                            ✓ อนุมัติ
                                                        </Button>
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleReject(claim.id)}
                                                            className="bg-error hover:bg-error/80"
                                                        >
                                                            × ปฏิเสธ
                                                        </Button>
                                                    </div>
                                                )}
                                                {claim.status === 'APPROVED' && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleMarkAsPaid(claim.id)}
                                                    >
                                                        💰 แจ้งโอนเงิน
                                                    </Button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
