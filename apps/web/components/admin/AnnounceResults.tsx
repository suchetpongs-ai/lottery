'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export function AnnounceResults() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        roundId: '',
        firstPrize: '',
        nearby1: '',
        nearby2: '',
        threeDigitFront1: '',
        threeDigitFront2: '',
        threeDigitBack1: '',
        threeDigitBack2: '',
        twoDigit1: '',
        twoDigit2: '',
    });

    const [syncLoading, setSyncLoading] = useState(false);

    const handleSync = async () => {
        if (!formData.roundId) return;
        setSyncLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await api.post(`/admin/rounds/${formData.roundId}/sync-results`);
            setSuccess(true);
            // Optionally clear form or fetch data to show it?
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to sync results');
        } finally {
            setSyncLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Validate 6-digit numbers
            if (formData.firstPrize.length !== 6) {
                throw new Error('รางวัลที่ 1 ต้องเป็นเลข 6 หลัก');
            }

            // Build winning numbers object
            const winningNumbers = {
                firstPrize: formData.firstPrize,
                nearby: [formData.nearby1, formData.nearby2].filter(Boolean),
                threeDigitFront: [formData.threeDigitFront1, formData.threeDigitFront2].filter(Boolean),
                threeDigitBack: [formData.threeDigitBack1, formData.threeDigitBack2].filter(Boolean),
                twoDigit: [formData.twoDigit1, formData.twoDigit2].filter(Boolean),
            };

            await api.post(`/admin/rounds/${formData.roundId}/announce-results`, {
                winningNumbers,
            });

            setSuccess(true);
            // Reset form
            setFormData({
                roundId: '',
                firstPrize: '',
                nearby1: '',
                nearby2: '',
                threeDigitFront1: '',
                threeDigitFront2: '',
                threeDigitBack1: '',
                threeDigitBack2: '',
                twoDigit1: '',
                twoDigit2: '',
            });

            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to announce results');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-8">
            <h2 className="text-2xl font-heading font-bold text-white mb-6">
                🎉 ประกาศผลรางวัล
            </h2>

            {/* Auto Sync Section */}
            <div className="mb-8 p-6 bg-primary-500/10 rounded-xl border border-primary-500/20">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-primary-300 mb-2">🔄 ดึงผลจากกองสลากฯ (Auto Sync)</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            ระบบจะดึงผลรางวัลจาก API ภายนอกและบันทึกลงระบบทันที ไม่ต้องกรอกเอง
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 items-end">
                    <div className="flex-1 max-w-xs">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            เลขที่งวด (Round ID)
                        </label>
                        <input
                            type="number"
                            placeholder="ระบุ ID งวด"
                            value={formData.roundId}
                            onChange={(e) => setFormData({ ...formData, roundId: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={handleSync}
                        disabled={syncLoading || !formData.roundId}
                        variant="secondary"
                        className="bg-primary-600 hover:bg-primary-700 text-white border-transparent h-[42px]"
                    >
                        {syncLoading ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูลทันที'}
                    </Button>
                </div>
            </div>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#1a1c2e] text-gray-500">หรือ กรอกผลรางวัลเอง</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Round ID */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        เลขที่งวด (Round ID) *
                    </label>
                    <input
                        type="number"
                        required
                        value={formData.roundId}
                        onChange={(e) => setFormData({ ...formData, roundId: e.target.value })}
                        placeholder="1"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                </div>

                {/* First Prize */}
                <div className="border border-primary-500/30 rounded-lg p-6 bg-primary-500/5">
                    <h3 className="text-lg font-bold text-primary-300 mb-4">รางวัลที่ 1 (6 หลัก)</h3>
                    <input
                        type="text"
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        value={formData.firstPrize}
                        onChange={(e) => setFormData({ ...formData, firstPrize: e.target.value })}
                        placeholder="123456"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-2xl font-mono text-center text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">รางวัลละ 6,000,000 บาท</p>
                </div>

                {/* Nearby Prizes */}
                <div className="border border-success/30 rounded-lg p-6 bg-success/5">
                    <h3 className="text-lg font-bold text-success mb-4">รางวัลข้างเคียงรางวัลที่ 1</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            value={formData.nearby1}
                            onChange={(e) => setFormData({ ...formData, nearby1: e.target.value })}
                            placeholder="123455"
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono text-center text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-success"
                        />
                        <input
                            type="text"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            value={formData.nearby2}
                            onChange={(e) => setFormData({ ...formData, nearby2: e.target.value })}
                            placeholder="123457"
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono text-center text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-success"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">รางวัลละ 100,000 บาท</p>
                </div>

                {/* 3 Digits Front */}
                <div className="border border-warning/30 rounded-lg p-6 bg-warning/5">
                    <h3 className="text-lg font-bold text-warning mb-4">เลขหน้า 3 ตัว</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            maxLength={3}
                            pattern="[0-9]{3}"
                            value={formData.threeDigitFront1}
                            onChange={(e) => setFormData({ ...formData, threeDigitFront1: e.target.value })}
                            placeholder="123"
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono text-center text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-warning"
                        />
                        <input
                            type="text"
                            maxLength={3}
                            pattern="[0-9]{3}"
                            value={formData.threeDigitFront2}
                            onChange={(e) => setFormData({ ...formData, threeDigitFront2: e.target.value })}
                            placeholder="456"
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono text-center text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-warning"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">รางวัลละ 4,000 บาท</p>
                </div>

                {/* 3 Digits Back */}
                <div className="border border-warning/30 rounded-lg p-6 bg-warning/5">
                    <h3 className="text-lg font-bold text-warning mb-4">เลขท้าย 3 ตัว</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            maxLength={3}
                            pattern="[0-9]{3}"
                            value={formData.threeDigitBack1}
                            onChange={(e) => setFormData({ ...formData, threeDigitBack1: e.target.value })}
                            placeholder="456"
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono text-center text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-warning"
                        />
                        <input
                            type="text"
                            maxLength={3}
                            pattern="[0-9]{3}"
                            value={formData.threeDigitBack2}
                            onChange={(e) => setFormData({ ...formData, threeDigitBack2: e.target.value })}
                            placeholder="789"
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono text-center text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-warning"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">รางวัลละ 4,000 บาท</p>
                </div>

                {/* 2 Digits */}
                <div className="border border-error/30 rounded-lg p-6 bg-error/5">
                    <h3 className="text-lg font-bold text-error mb-4">เลขท้าย 2 ตัว</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            maxLength={2}
                            pattern="[0-9]{2}"
                            value={formData.twoDigit1}
                            onChange={(e) => setFormData({ ...formData, twoDigit1: e.target.value })}
                            placeholder="56"
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono text-center text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-error"
                        />
                        <input
                            type="text"
                            maxLength={2}
                            pattern="[0-9]{2}"
                            value={formData.twoDigit2}
                            onChange={(e) => setFormData({ ...formData, twoDigit2: e.target.value })}
                            placeholder="89"
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono text-center text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-error"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">รางวัลละ 2,000 บาท</p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="p-4 bg-success/20 border border-success/50 rounded-lg text-success">
                        ✓ ประกาศผลรางวัลสำเร็จ! ระบบกำลังตรวจสอบรางวัลอัตโนมัติ...
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-error/20 border border-error/50 rounded-lg text-error">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? 'กำลังประกาศผล...' : '🎉 ประกาศผลรางวัล'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                    * เมื่อกดประกาศ ระบบจะตรวจสอบรางวัลอัตโนมัติสำหรับสลากที่ขายแล้วทั้งหมด
                </p>
            </form>
        </div>
    );
}
