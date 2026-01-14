'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export function CreateRoundForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        drawDate: '',
        openSellingAt: '',
        closeSellingAt: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await api.post('/admin/rounds', {
                ...formData,
                drawDate: new Date(formData.drawDate).toISOString(),
                openSellingAt: new Date(formData.openSellingAt).toISOString(),
                closeSellingAt: new Date(formData.closeSellingAt).toISOString(),
            });

            setSuccess(true);
            // Reset form
            setFormData({
                name: '',
                drawDate: '',
                openSellingAt: '',
                closeSellingAt: '',
            });

            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create round');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-8">
            <h2 className="text-2xl font-heading font-bold text-white mb-6">
                สร้างงวดใหม่
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Round Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        ชื่องวด
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="เช่น งวดวันที่ 1 กุมภาพันธ์ 2567"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                </div>

                {/* Draw Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        วันที่ออกรางวัล
                    </label>
                    <input
                        type="datetime-local"
                        required
                        value={formData.drawDate}
                        onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                </div>

                {/* Open Selling */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        เปิดขายเมื่อ
                    </label>
                    <input
                        type="datetime-local"
                        required
                        value={formData.openSellingAt}
                        onChange={(e) => setFormData({ ...formData, openSellingAt: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                </div>

                {/* Close Selling */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        ปิดขายเมื่อ
                    </label>
                    <input
                        type="datetime-local"
                        required
                        value={formData.closeSellingAt}
                        onChange={(e) => setFormData({ ...formData, closeSellingAt: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="p-4 bg-success/20 border border-success/50 rounded-lg text-success">
                        ✓ สร้างงวดใหม่สำเร็จ!
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
                    {loading ? 'กำลังสร้าง...' : 'สร้างงวดใหม่'}
                </Button>
            </form>
        </div>
    );
}
