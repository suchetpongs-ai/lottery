'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface WinningTicket {
    ticketNumber: string;
    prizeAmount: number;
    prizeTier: string;
    roundName: string;
    checkedAt: string;
    claimed: boolean;
    claimStatus?: string;
}

export default function MyPrizesPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [prizes, setPrizes] = useState<WinningTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchPrizes();
    }, [isAuthenticated, router]);

    const fetchPrizes = async () => {
        try {
            const response = await api.get('/lottery/my-prizes');
            setPrizes(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch prizes');
        } finally {
            setLoading(false);
        }
    };

    const getTierLabel = (tier: string) => {
        const labels: Record<string, string> = {
            firstPrize: '🥇 รางวัลที่ 1',
            nearby: '🥈 รางวัลข้างเคียง',
            threeDigitFront: '🥉 เลขหน้า 3 ตัว',
            threeDigitBack: '🥉 เลขท้าย 3 ตัว',
            twoDigit: '🎖️ เลขท้าย 2 ตัว',
        };
        return labels[tier] || tier;
    };

    const getStatusBadge = (status?: string) => {
        if (!status) {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/50">
                    ยังไม่ได้ขอรับ
                </span>
            );
        }

        const styles: Record<string, string> = {
            PENDING: 'bg-warning/20 text-warning border-warning/50',
            APPROVED: 'bg-success/20 text-success border-success/50',
            REJECTED: 'bg-error/20 text-error border-error/50',
            PAID: 'bg-primary-500/20 text-primary-300 border-primary-500/50',
        };

        const labels: Record<string, string> = {
            PENDING: 'รออนุมัติ',
            APPROVED: 'อนุมัติแล้ว',
            REJECTED: 'ปฏิเสธ',
            PAID: 'จ่ายแล้ว',
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
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gradient mb-2">
                        🏆 รางวัลของฉัน
                    </h1>
                    <p className="text-gray-400">
                        รายการรางวัลที่คุณถูกทั้งหมด
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="glass-card p-6 border-error/20 mb-8">
                        <p className="text-error">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {prizes.length === 0 && !error && (
                    <div className="glass-card p-12 text-center">
                        <div className="text-6xl mb-4">🎰</div>
                        <p className="text-xl text-gray-400 mb-2">ยังไม่มีรางวัล</p>
                        <p className="text-sm text-gray-500 mb-6">
                            ซื้อสลากและรอประกาศผลเพื่อลุ้นรางวัล
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => router.push('/browse')}
                        >
                            ซื้อสลาก
                        </Button>
                    </div>
                )}

                {/* Prizes List */}
                {prizes.length > 0 && (
                    <>
                        {/* Total Summary */}
                        <div className="glass-card p-6 mb-8 bg-gradient-to-r from-success/10 to-primary-500/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">รางวัลรวมทั้งหมด</p>
                                    <p className="text-4xl font-heading font-bold text-gradient">
                                        ฿ {prizes.reduce((sum, p) => sum + p.prizeAmount, 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400 mb-1">จำนวนรางวัล</p>
                                    <p className="text-3xl font-bold text-white">
                                        {prizes.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Prizes Grid */}
                        <div className="space-y-4">
                            {prizes.map((prize, index) => (
                                <div key={index} className="glass-card p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-3xl font-mono font-bold text-white tracking-wider">
                                                    {prize.ticketNumber}
                                                </span>
                                                {getStatusBadge(prize.claimStatus)}
                                            </div>
                                            <p className="text-sm text-gray-400">{prize.roundName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400 mb-1">
                                                {getTierLabel(prize.prizeTier)}
                                            </p>
                                            <p className="text-3xl font-bold text-gradient">
                                                ฿{prize.prizeAmount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <p className="text-xs text-gray-500">
                                            ตรวจสอบเมื่อ: {new Date(prize.checkedAt).toLocaleString('th-TH')}
                                        </p>

                                        {!prize.claimed && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={async () => {
                                                    try {
                                                        setLoading(true);
                                                        await api.post('/lottery/claim-prize', {
                                                            ticketId: prize.ticketId || 0, // Will need to add ticketId to the response
                                                        });
                                                        // Refresh prizes after claiming
                                                        await fetchPrizes();
                                                        alert('ส่งคำขอรับเงินรางวัลเรียบร้อย กรุณารอการอนุมัติ');
                                                    } catch (err: any) {
                                                        alert(err.response?.data?.message || 'ไม่สามารถส่งคำขอรับเงินรางวัลได้');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                disabled={loading}
                                            >
                                                💰 ขอรับเงินรางวัล
                                            </Button>
                                        )}

                                        {prize.claimStatus === 'PAID' && (
                                            <span className="text-sm text-success">✓ รับเงินแล้ว</span>
                                        )}

                                        {prize.claimStatus === 'PENDING' && (
                                            <span className="text-sm text-warning">⏳ รออนุมัติ...</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Help Section */}
                <div className="mt-12 glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4">❓ คำถามที่พบบ่อย</h3>
                    <div className="space-y-3 text-sm text-gray-400">
                        <div>
                            <p className="font-semibold text-white mb-1">เมื่อไหร่จะได้รับเงินรางวัล?</p>
                            <p>หลังจากกดขอรับเงินรางวัล ระบบจะตรวจสอบและอนุมัติภายใน 3-5 วันทำการ</p>
                        </div>
                        <div>
                            <p className="font-semibold text-white mb-1">เงินรางวัลจะโอนเข้าที่ไหน?</p>
                            <p>โอนเข้าบัญชีธนาคารที่ท่านลงทะเบียนไว้ในระบบ</p>
                        </div>
                        <div>
                            <p className="font-semibold text-white mb-1">มีค่าธรรมเนียมหรือไม่?</p>
                            <p>ไม่มีค่าธรรมเนียมใดๆ ท่านจะได้รับเงินรางวัลเต็มจำนวน</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
