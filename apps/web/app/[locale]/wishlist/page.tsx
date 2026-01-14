'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function WishlistPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [numbers, setNumbers] = useState<string[]>([]);
    const [newNumber, setNewNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [checking, setChecking] = useState(false);
    const [checkResult, setCheckResult] = useState<any>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchWishlist();
    }, [isAuthenticated, router]);

    const fetchWishlist = async () => {
        try {
            const response = await api.get('/lottery/wishlist');
            setNumbers(response.data.numbers || []);
        } catch (err) {
            console.error('Failed to fetch wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNumber = () => {
        if (newNumber.length !== 6 || !/^\d{6}$/.test(newNumber)) {
            alert('กรุณากรอกเลข 6 หลัก');
            return;
        }

        if (numbers.includes(newNumber)) {
            alert('เลขนี้มีอยู่ในรายการแล้ว');
            return;
        }

        setNumbers([...numbers, newNumber]);
        setNewNumber('');
    };

    const handleRemoveNumber = (number: string) => {
        setNumbers(numbers.filter(n => n !== number));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/lottery/wishlist', { numbers });
            alert('บันทึกเลขโปรดสำเร็จ!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save wishlist');
        } finally {
            setSaving(false);
        }
    };

    const handleCheckAgainstCurrent = async () => {
        setChecking(true);
        setCheckResult(null);

        try {
            // Get current round first
            const roundResponse = await api.get('/lottery/round/current');
            if (!roundResponse.data) {
                alert('ไม่มีงวดที่เปิดอยู่ในขณะนี้');
                return;
            }

            const response = await api.post(`/lottery/check-wishlist/${roundResponse.data.id}`);
            setCheckResult(response.data);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to check wishlist');
        } finally {
            setChecking(false);
        }
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
                        ⭐ เลขโปรด
                    </h1>
                    <p className="text-gray-400">
                        บันทึกเลขโปรดและตรวจสอบกับงวดปัจจุบันได้ทันที
                    </p>
                </div>

                {/* Add Number Form */}
                <div className="glass-card p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">เพิ่มเลขโปรด</h2>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            value={newNumber}
                            onChange={(e) => setNewNumber(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddNumber()}
                            placeholder="123456"
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-2xl font-mono text-center text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400 tracking-wider"
                        />
                        <Button
                            variant="primary"
                            onClick={handleAddNumber}
                            disabled={newNumber.length !== 6}
                        >
                            เพิ่ม
                        </Button>
                    </div>
                </div>

                {/* Numbers Grid */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">
                            เลขโปรดของคุณ ({numbers.length})
                        </h2>
                        {numbers.length > 0 && (
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
                            </Button>
                        )}
                    </div>

                    {numbers.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-5xl mb-4">🎯</p>
                            <p>ยังไม่มีเลขโปรด</p>
                            <p className="text-sm text-gray-500 mt-2">เพิ่มเลขโปรดของคุณด้านบน</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {numbers.map((number, index) => (
                                    <div
                                        key={index}
                                        className="relative bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/30 rounded-lg p-4 text-center"
                                    >
                                        <button
                                            onClick={() => handleRemoveNumber(number)}
                                            className="absolute top-2 right-2 w-6 h-6 bg-error/80 hover:bg-error rounded-full text-white text-xs"
                                        >
                                            ×
                                        </button>
                                        <p className="text-3xl font-mono font-bold text-white tracking-wider">
                                            {number}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6">
                                <Button
                                    variant="primary"
                                    onClick={handleCheckAgainstCurrent}
                                    disabled={checking}
                                    className="w-full"
                                    size="lg"
                                >
                                    {checking ? 'กำลังตรวจสอบ...' : '🔍 ตรวจสอบกับงวดปัจจุบัน'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Check Result */}
                {checkResult && (
                    <div className={`glass-card p-6 animate-fadeIn ${checkResult.matches.length > 0
                            ? 'border-2 border-success'
                            : 'border border-white/10'
                        }`}>
                        <h3 className="text-xl font-bold text-white mb-4">
                            ผลการตรวจสอบ
                        </h3>

                        <p className="text-lg text-gray-300 mb-4">{checkResult.message}</p>

                        {checkResult.matches.length > 0 && (
                            <>
                                <div className="bg-gradient-to-r from-success/20 to-primary-500/20 rounded-lg p-6 mb-4">
                                    <p className="text-sm text-gray-400 mb-2">รางวัลรวมที่อาจได้รับ</p>
                                    <p className="text-4xl font-heading font-bold text-gradient">
                                        ฿ {checkResult.totalPotentialPrize.toLocaleString()}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {checkResult.matches.map((match: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                                        >
                                            <div>
                                                <p className="text-2xl font-mono font-bold text-white">
                                                    {match.number}
                                                </p>
                                                <p className="text-sm text-gray-400">{match.tier}</p>
                                            </div>
                                            <p className="text-xl font-bold text-success">
                                                ฿{match.prize.toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                                    <p className="text-sm text-warning">
                                        ⚠️ หมายเหตุ: นี่เป็นการตรวจสอบเลขโปรดของคุณกับผลรางวัล
                                        ต้องซื้อสลากจริงจึงจะได้รับรางวัล
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-12 glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4">💡 เกี่ยวกับเลขโปรด</h3>
                    <div className="space-y-2 text-sm text-gray-400">
                        <p>• เลขโปรดคือเลขที่คุณชอบและต้องการติดตาม</p>
                        <p>• ระบบจะช่วยตรวจสอบเลขโปรดกับผลรางวัลอัตโนมัติ</p>
                        <p>• คุณสามารถบันทึกได้ไม่จำกัดจำนวน</p>
                        <p>• เมื่อมีงวดใหม่ คุณจะได้รับแจ้งเตือนหากเลขโปรดตรงกับผลรางวัล</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
