'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface PrizeResult {
    ticketNumber: string;
    roundName: string;
    isWinner: boolean;
    prizeTier?: string;
    prizeAmount?: number;
    message: string;
}

export default function CheckPrizePage() {
    const [ticketNumber, setTicketNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PrizeResult | null>(null);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await api.post('/lottery/check-prize', {
                ticketNumber: ticketNumber.trim(),
            });
            setResult(response.data);
        } catch (err: any) {
            setResult({
                ticketNumber,
                roundName: 'ข้อผิดพลาด',
                isWinner: false,
                message: err.response?.data?.message || 'ไม่สามารถตรวจสอบได้ กรุณาลองใหม่อีกครั้ง',
            });
        } finally {
            setLoading(false);
        }
    };

    const getTierText = (tier?: string) => {
        const tiers: Record<string, string> = {
            firstPrize: 'รางวัลที่ 1',
            nearby: 'รางวัลข้างเคียง',
            threeDigitFront: 'เลขหน้า 3 ตัว',
            threeDigitBack: 'เลขท้าย 3 ตัว',
            twoDigit: 'เลขท้าย 2 ตัว',
        };
        return tier ? tiers[tier] : '';
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-heading font-bold text-gradient mb-4">
                        🎰 ตรวจรางวัล
                    </h1>
                    <p className="text-xl text-gray-400">
                        กรอกหมายเลขสลากเพื่อตรวจสอบรางวัล
                    </p>
                </div>

                {/* Check Form */}
                <div className="glass-card p-8 mb-8">
                    <form onSubmit={handleCheck} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                หมายเลขสลาก (6 หลัก)
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                pattern="[0-9]{6}"
                                value={ticketNumber}
                                onChange={(e) => setTicketNumber(e.target.value)}
                                placeholder="123456"
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-lg text-3xl font-mono text-center text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400 tracking-widest"
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            disabled={loading || ticketNumber.length !== 6}
                        >
                            {loading ? 'กำลังตรวจสอบ...' : '🔍 ตรวจสอบ'}
                        </Button>
                    </form>
                </div>

                {/* Result Display */}
                {result && (
                    <div className={`glass-card p-8 animate-fadeIn ${result.isWinner
                            ? 'border-2 border-success shadow-lg shadow-success/30'
                            : 'border border-white/10'
                        }`}>
                        {/* Ticket Number */}
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-400 mb-2">หมายเลขที่ตรวจสอบ</p>
                            <p className="text-4xl font-mono font-bold text-white tracking-widest">
                                {result.ticketNumber}
                            </p>
                        </div>

                        {/* Round Name */}
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-400">{result.roundName}</p>
                        </div>

                        {/* Result */}
                        {result.isWinner ? (
                            <>
                                {/* Winner Animation */}
                                <div className="text-center py-8 space-y-4">
                                    <div className="text-7xl animate-bounce">🎉</div>
                                    <h2 className="text-4xl font-heading font-bold text-gradient">
                                        ยินดีด้วย!
                                    </h2>
                                    <p className="text-2xl text-success font-bold">
                                        {result.message}
                                    </p>
                                </div>

                                {/* Prize Details */}
                                <div className="bg-gradient-to-r from-success/20 to-primary-500/20 rounded-lg p-6 text-center">
                                    <p className="text-lg text-gray-300 mb-2">
                                        {getTierText(result.prizeTier)}
                                    </p>
                                    <p className="text-5xl font-heading font-bold text-gradient">
                                        ฿ {result.prizeAmount?.toLocaleString()}
                                    </p>
                                </div>

                                {/* Next Steps */}
                                <div className="mt-8 p-4 bg-white/5 rounded-lg">
                                    <p className="text-sm text-gray-400 text-center mb-4">
                                        📌 ขั้นตอนถัดไป
                                    </p>
                                    <ol className="text-sm text-gray-300 space-y-2">
                                        <li>1. เข้าสู่ระบบหรือสมัครสมาชิก</li>
                                        <li>2. ไปที่เมนู "รางวัลของฉัน"</li>
                                        <li>3. กดปุ่ม "ขอรับเงินรางวัล"</li>
                                        <li>4. รอการอนุมัติจากผู้ดูแลระบบ</li>
                                    </ol>
                                </div>
                            </>
                        ) : (
                            /* Not Winner */
                            <div className="text-center py-8 space-y-4">
                                <div className="text-6xl">😢</div>
                                <p className="text-2xl text-gray-400">
                                    {result.message}
                                </p>
                                <p className="text-sm text-gray-500">
                                    ลองโชคใหม่ในงวดถัดไป!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-12 glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4">💡 ข้อมูลรางวัล</h3>
                    <div className="space-y-2 text-sm text-gray-400">
                        <p>🥇 รางวัลที่ 1: <span className="text-white font-bold">6,000,000 บาท</span></p>
                        <p>🥈 รางวัลข้างเคียง: <span className="text-white font-bold">100,000 บาท</span></p>
                        <p>🥉 เลข 3 ตัว: <span className="text-white font-bold">4,000 บาท</span></p>
                        <p>🎖️ เลข 2 ตัว: <span className="text-white font-bold">2,000 บาท</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
