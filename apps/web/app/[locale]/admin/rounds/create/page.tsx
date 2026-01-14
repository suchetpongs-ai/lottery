'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function CreateRoundPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        drawDate: '',
        openSellingAt: '',
        closeSellingAt: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.name || `งวดวันที่ ${new Date(formData.drawDate).toLocaleDateString('th-TH')}`,
                drawDate: new Date(formData.drawDate).toISOString(),
                openSellingAt: new Date(formData.openSellingAt).toISOString(),
                closeSellingAt: new Date(formData.closeSellingAt).toISOString(),
                status: 'OPEN',
            };

            await api.post('/admin/rounds', payload);
            alert('สร้างงวดสำเร็จ!');
            router.push('/admin');
        } catch (error: any) {
            console.error('Error creating round:', error);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างงวด');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => router.push('/admin')} className="mb-4">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับ
                    </Button>
                    <h1 className="text-4xl font-heading font-bold text-gradient mb-2">
                        สร้างงวดใหม่
                    </h1>
                    <p className="text-gray-400">
                        กำหนดวันออกรางวัลและวันเปิดขาย
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card p-8">
                    <div className="space-y-6">
                        {/* Round Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                ชื่องวด (ถ้าไม่ระบุจะสร้างอัตโนมัติ)
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="เช่น งวดวันที่ 1 มกราคม 2569"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {/* Draw Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                วันออกรางวัล *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.drawDate}
                                onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="mt-2 text-sm text-gray-400">
                                วันที่จะมีการออกรางวัล
                            </p>
                        </div>

                        {/* Open Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                วันเปิดขาย *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.openSellingAt}
                                onChange={(e) => setFormData({ ...formData, openSellingAt: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="mt-2 text-sm text-gray-400">
                                วันที่เริ่มเปิดให้ซื้อสลาก
                            </p>
                        </div>

                        {/* Close Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                วันปิดขาย *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.closeSellingAt}
                                onChange={(e) => setFormData({ ...formData, closeSellingAt: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="mt-2 text-sm text-gray-400">
                                วันที่หยุดให้ซื้อสลาก (ควรอยู่ก่อนวันออกรางวัล)
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="glass-card p-4 bg-primary-500/10 border-l-4 border-primary-500">
                            <div className="flex gap-3">
                                <svg className="w-6 h-6 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-gray-300">
                                    <p className="font-semibold mb-1">หมายเหตุ:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>วันเปิดขายควรอยู่ก่อนวันออกรางวัล</li>
                                        <li>หลังจากสร้างงวดแล้ว จะต้องอัพโหลดสลากก่อนเปิดขาย</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="flex-1"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="flex-1"
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? 'กำลังสร้าง...' : 'สร้างงวด'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
