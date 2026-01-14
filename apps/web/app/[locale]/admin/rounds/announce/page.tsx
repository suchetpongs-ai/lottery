'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface Round {
    id: number;
    name: string;
    status: string;
    drawDate: string;
    winningNumbers?: any;
}

export default function AnnounceResultsPage() {
    const [rounds, setRounds] = useState<Round[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [winningNumbers, setWinningNumbers] = useState({
        firstPrize: '',
        nearby: ['', ''],
        threeDigitFront: ['', ''],
        threeDigitBack: ['', ''],
        twoDigit: '',
    });

    useEffect(() => {
        fetchRounds();
    }, []);

    const fetchRounds = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/rounds');
            // Filter rounds that are in OPEN or Closed status (not yet announced)
            const unannouncedRounds = response.data.filter(
                (r: Round) => !r.winningNumbers || r.status === 'OPEN' || r.status === 'Closed'
            );
            setRounds(unannouncedRounds);
            if (unannouncedRounds.length > 0) {
                setSelectedRoundId(unannouncedRounds[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch rounds:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRoundId) {
            alert('กรุณาเลือกงวดสลาก');
            return;
        }

        // Validate
        if (winningNumbers.firstPrize.length !== 6) {
            alert('รางวัลที่ 1 ต้องเป็นเลข 6 หลัก');
            return;
        }

        setSubmitting(true);

        try {
            await api.post(`/admin/rounds/${selectedRoundId}/announce-results`, {
                winningNumbers: {
                    firstPrize: winningNumbers.firstPrize,
                    nearby: winningNumbers.nearby.filter(n => n),
                    threeDigitFront: winningNumbers.threeDigitFront.filter(n => n),
                    threeDigitBack: winningNumbers.threeDigitBack.filter(n => n),
                    twoDigit: winningNumbers.twoDigit,
                },
            });

            alert('ประกาศผลรางวัลสำเร็จ! ระบบกำลังตรวจสอบสลากทั้งหมดและส่งการแจ้งเตือนให้ผู้ถูกรางวัล');

            // Reset form
            setWinningNumbers({
                firstPrize: '',
                nearby: ['', ''],
                threeDigitFront: ['', ''],
                threeDigitBack: ['', ''],
                twoDigit: '',
            });

            fetchRounds();
        } catch (error: any) {
            console.error('Error announcing results:', error);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการประกาศผล');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAutoSync = async () => {
        if (!selectedRoundId) {
            alert('กรุณาเลือกงวดสลาก');
            return;
        }

        if (!confirm('ต้องการดึงผลรางวัลจาก API อัตโนมัติ?')) {
            return;
        }

        setSubmitting(true);

        try {
            const response = await api.post(`/admin/rounds/${selectedRoundId}/sync-results`);
            alert('ดึงผลรางวัลและประกาศสำเร็จ! ระบบกำลังตรวจสอบสลากทั้งหมด');
            fetchRounds();
        } catch (error: any) {
            console.error('Error syncing results:', error);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงผล อาจเป็นเพราะยังไม่มีผลรางวัลในระบบ');
        } finally {
            setSubmitting(false);
        }
    };

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
                        🎉 ประกาศผลรางวัล
                    </h1>
                    <p className="text-gray-400">
                        ป้อนเลขที่ถูกรางวัลด้วยตนเองหรือดึงจาก API อัตโนมัติ
                    </p>
                </div>

                {/* Round Selector */}
                <div className="glass-card p-8 mb-6">
                    <h2 className="text-xl font-heading font-bold text-white mb-4">
                        เลือกงวดสลาก
                    </h2>
                    {rounds.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p>ไม่มีงวดที่ต้องประกาศผล</p>
                        </div>
                    ) : (
                        <select
                            value={selectedRoundId || ''}
                            onChange={(e) => setSelectedRoundId(parseInt(e.target.value))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="">-- เลือกงวด --</option>
                            {rounds.map((round) => (
                                <option key={round.id} value={round.id}>
                                    {round.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Auto Sync Option */}
                <div className="glass-card p-6 mb-6 border-l-4 border-primary-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                                🤖 ดึงผลอัตโนมัติจาก API
                            </h3>
                            <p className="text-sm text-gray-400">
                                ดึงข้อมูลจาก lotto.api.rayriffy.com (ต้องรอวันออกรางวัลถึงจะมีข้อมูล)
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleAutoSync}
                            disabled={submitting || !selectedRoundId}
                        >
                            ดึงผลอัตโนมัติ
                        </Button>
                    </div>
                </div>

                {/* Manual Entry Form */}
                <form onSubmit={handleManualSubmit} className="glass-card p-8">
                    <h2 className="text-xl font-heading font-bold text-white mb-6">
                        📝 กรอกผลรางวัลด้วยตนเอง
                    </h2>

                    <div className="space-y-6">
                        {/* First Prize */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                รางวัลที่ 1 (6 หลัก) *
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                pattern="[0-9]{6}"
                                value={winningNumbers.firstPrize}
                                onChange={(e) => setWinningNumbers({ ...winningNumbers, firstPrize: e.target.value })}
                                placeholder="123456"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-2xl font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        {/* Nearby Prizes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                รางวัลข้างเคียงรางวัลที่ 1 (6 หลัก, 2 รางวัล)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {winningNumbers.nearby.map((num, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        maxLength={6}
                                        pattern="[0-9]{6}"
                                        value={num}
                                        onChange={(e) => {
                                            const newNearby = [...winningNumbers.nearby];
                                            newNearby[idx] = e.target.value;
                                            setWinningNumbers({ ...winningNumbers, nearby: newNearby });
                                        }}
                                        placeholder={`รางวัลที่ ${idx + 1}`}
                                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Three Digit Front */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                เลข 3 ตัวหน้า (3 หลัก, 2 รางวัล)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {winningNumbers.threeDigitFront.map((num, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        maxLength={3}
                                        pattern="[0-9]{3}"
                                        value={num}
                                        onChange={(e) => {
                                            const newThree = [...winningNumbers.threeDigitFront];
                                            newThree[idx] = e.target.value;
                                            setWinningNumbers({ ...winningNumbers, threeDigitFront: newThree });
                                        }}
                                        placeholder={`รางวัลที่ ${idx + 1}`}
                                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Three Digit Back */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                เลข 3 ตัวท้าย (3 หลัก, 2 รางวัล)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {winningNumbers.threeDigitBack.map((num, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        maxLength={3}
                                        pattern="[0-9]{3}"
                                        value={num}
                                        onChange={(e) => {
                                            const newThree = [...winningNumbers.threeDigitBack];
                                            newThree[idx] = e.target.value;
                                            setWinningNumbers({ ...winningNumbers, threeDigitBack: newThree });
                                        }}
                                        placeholder={`รางวัลที่ ${idx + 1}`}
                                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Two Digit *

/}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                เลข 2 ตัวท้าย (2 หลัก) *
                            </label>
                            <input
                                type="text"
                                maxLength={2}
                                pattern="[0-9]{2}"
                                value={winningNumbers.twoDigit}
                                onChange={(e) => setWinningNumbers({ ...winningNumbers, twoDigit: e.target.value })}
                                placeholder="99"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-2xl font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={submitting}
                            disabled={!selectedRoundId}
                        >
                            {submitting ? 'กำลังประกาศผล...' : '🎉 ประกาศผลรางวัล'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
