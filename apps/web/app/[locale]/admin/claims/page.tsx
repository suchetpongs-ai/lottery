'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface Claim {
    id: number;
    ticketId: number;
    userId: number;
    amount: number;
    status: string;
    claimedAt: string;
    processedAt?: string;
    rejectionReason?: string;
    ticket: {
        number: string;
        round: {
            name: string;
        };
    };
    user: {
        id: number;
        username: string;
        phoneNumber: string;
    };
}

export default function AdminClaimsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        // TODO: Add admin role check when role system is implemented
        fetchClaims();
    }, [isAuthenticated, filter, router]);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const url = filter ? `/admin/claims?status=${filter}` : '/admin/claims';
            const response = await api.get(url);
            setClaims(response.data);
        } catch (err) {
            console.error('Failed to fetch claims:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (claimId: number) => {
        if (!confirm('ยืนยันการอนุมัติคำขอรับเงินรางวัล?')) return;

        try {
            setProcessingId(claimId);
            await api.put(`/admin/claims/${claimId}/approve`);
            await fetchClaims();
        } catch (err: any) {
            alert(err.response?.data?.message || 'ไม่สามารถอนุมัติได้');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (claimId: number) => {
        const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:', '');
        if (!reason) return;

        try {
            setProcessingId(claimId);
            await api.put(`/admin/claims/${claimId}/reject`, { reason });
            await fetchClaims();
        } catch (err: any) {
            alert(err.response?.data?.message || 'ไม่สามารถปฏิเสธได้');
        } finally {
            setProcessingId(null);
        }
    };

    const handleMarkAsPaid = async (claimId: number) => {
        if (!confirm('ยืนยันว่าได้โอนเงินรางวัลเรียบร้อยแล้ว?')) return;

        try {
            setProcessingId(claimId);
            await api.put(`/admin/claims/${claimId}/pay`);
            await fetchClaims();
        } catch (err: any) {
            alert(err.response?.data?.message || 'ไม่สามารถอัปเดตได้');
        } finally {
            setProcessingId(null);
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
            PENDING: 'รอดำเนินการ',
            APPROVED: 'อนุมัติแล้ว',
            REJECTED: 'ปฏิเสธ',
            PAID: 'โอนเงินแล้ว',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || ''}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gradient mb-2">
                        🎫 จัดการคำขอรับเงินรางวัล
                    </h1>
                    <p className="text-gray-400">
                        อนุมัติ/ปฏิเสธ และจัดการการขอรับเงินรางวัล
                    </p>
                </div>

                {/* Filters */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setFilter('')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === '' ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            ทั้งหมด ({claims.length})
                        </button>
                        <button
                            onClick={() => setFilter('PENDING')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'PENDING' ? 'bg-warning text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            รอดำเนินการ
                        </button>
                        <button
                            onClick={() => setFilter('APPROVED')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'APPROVED' ? 'bg-success text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            อนุมัติแล้ว
                        </button>
                        <button
                            onClick={() => setFilter('PAID')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'PAID' ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            โอนเงินแล้ว
                        </button>
                    </div>
                </div>

                {/* Claims List */}
                {claims.length === 0 ? (
                    <div className="glass-card p-12 text-center text-gray-400">
                        <p className="text-xl">ไม่มีคำขอรับเงินรางวัล</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {claims.map((claim) => (
                            <div key={claim.id} className="glass-card p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-3xl font-mono font-bold text-white">
                                                {claim.ticket.number}
                                            </span>
                                            {getStatusBadge(claim.status)}
                                        </div>
                                        <p className="text-sm text-gray-400 mb-1">
                                            <strong>ผู้ใช้:</strong> {claim.user.username} ({claim.user.phoneNumber})
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            <strong>งวด:</strong> {claim.ticket.round?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400 mb-1">จำนวนเงิน</p>
                                        <p className="text-3xl font-bold text-gradient">
                                            ฿{Number(claim.amount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {claim.rejectionReason && (
                                    <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-lg">
                                        <p className="text-sm text-error">
                                            <strong>เหตุผลที่ปฏิเสธ:</strong> {claim.rejectionReason}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <p className="text-xs text-gray-500">
                                        ส่งคำขอเมื่อ: {new Date(claim.claimedAt).toLocaleString('th-TH')}
                                        {claim.processedAt && (
                                            <> • ประมวลผลเมื่อ: {new Date(claim.processedAt).toLocaleString('th-TH')}</>
                                        )}
                                    </p>

                                    <div className="flex gap-2">
                                        {claim.status === 'PENDING' && (
                                            <>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleApprove(claim.id)}
                                                    disabled={processingId === claim.id}
                                                >
                                                    ✅ อนุมัติ
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleReject(claim.id)}
                                                    disabled={processingId === claim.id}
                                                >
                                                    ❌ ปฏิเสธ
                                                </Button>
                                            </>
                                        )}
                                        {claim.status === 'APPROVED' && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleMarkAsPaid(claim.id)}
                                                disabled={processingId === claim.id}
                                            >
                                                💰 ทำเครื่องหมายว่าโอนเงินแล้ว
                                            </Button>
                                        )}
                                        {claim.status === 'PAID' && (
                                            <span className="text-sm text-success">✓ ดำเนินการเสร็จสิ้น</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
