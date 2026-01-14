'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface TicketUpload {
    number: string;
    price: number;
    set: number;
}

interface Round {
    id: number;
    name: string;
    status: string;
}

export default function UploadTicketsPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tickets, setTickets] = useState<TicketUpload[]>([]);
    const [bulkInput, setBulkInput] = useState('');
    const [rounds, setRounds] = useState<Round[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRounds();
    }, []);

    const fetchRounds = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/rounds');
            setRounds(response.data.filter((r: Round) => r.status === 'OPEN'));
            if (response.data.length > 0) {
                setSelectedRoundId(response.data[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch rounds:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAdd = () => {
        const lines = bulkInput.trim().split('\n');
        const newTickets: TicketUpload[] = [];

        lines.forEach((line) => {
            const parts = line.trim().split(',');
            if (parts.length === 3) {
                const [number, price, set] = parts;
               if (number && number.length === 6 && price && !isNaN(+price) && set && !isNaN(+set)) {
                    newTickets.push({
                        number: number.trim(),
                        price: parseFloat(price.trim()),
                        set: parseInt(set.trim()),
                    });
                }
            }
        });

        setTickets([...tickets, ...newTickets]);
        setBulkInput('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (tickets.length === 0) {
            alert('กรุณาเพิ่มสลากอย่างน้อย 1 ใบ');
            return;
        }

        if (!selectedRoundId) {
            alert('กรุณาเลือกงวดสลาก');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post('/admin/tickets', {
                roundId: selectedRoundId,
                tickets: tickets,
            });

            alert(`อัพโหลดสลากสำเร็จ ${tickets.length} ใบ!`);
            router.push('/admin');
        } catch (error: any) {
            console.error('Error uploading tickets:', error);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพโหลดสลาก');
        } finally {
            setIsSubmitting(false);
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
                    <Button variant="ghost" onClick={() => router.push('/admin')} className="mb-4">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับ
                    </Button>
                    <h1 className="text-4xl font-heading font-bold text-gradient mb-2">
                        อัพโหลดสลาก
                    </h1>
                    <p className="text-gray-400">
                        เพิ่มสลากเข้าสู่ระบบ
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Round Selector */}
                    <div className="glass-card p-8">
                        <h2 className="text-xl font-heading font-bold text-white mb-4">
                            เลือกงวดสลาก
                        </h2>
                        {rounds.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p className="mb-4">ไม่มีงวดที่เปิดขายอยู่</p>
                                <Button variant="primary" onClick={() => router.push('/admin/rounds/create')}>
                                    สร้างงวดใหม่
                                </Button>
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

                    {/* Bulk Input */}
                    <div className="glass-card p-8">
                        <h2 className="text-xl font-heading font-bold text-white mb-4">
                            เพิ่มหลายรายการ (CSV Format)
                        </h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                รูปแบบ: เลขสลาก,ราคา,ชุด (แต่ละบรรทัด)
                            </label>
                            <textarea
                                value={bulkInput}
                                onChange={(e) => setBulkInput(e.target.value)}
                                placeholder="123456,80,1&#10;789012,80,1&#10;345678,80,2"
                                rows={8}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                            />
                        </div>

                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleBulkAdd}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            เพิ่มรายการ ({bulkInput.split('\n').filter(l => l.trim()).length})
                        </Button>
                    </div>

                    {/* Preview */}
                    {tickets.length > 0 && (
                        <div className="glass-card p-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-heading font-bold text-white">
                                    รายการสลาก ({tickets.length} ใบ)
                                </h2>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTickets([])}
                                >
                                    ล้างทั้งหมด
                                </Button>
                            </div>

                            <div className="max-h-96 overflow-y-auto space-y-2">
                                {tickets.slice(0, 50).map((ticket, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg text-sm"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-500">#{index + 1}</span>
                                            <span className="font-mono text-xl font-bold text-gradient">
                                                {ticket.number}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-300">
                                            <span>฿ {ticket.price}</span>
                                            <span>ชุด {ticket.set}</span>
                                            <button
                                                type="button"
                                                onClick={() => setTickets(tickets.filter((_, i) => i !== index))}
                                                className="text-error hover:text-error/80"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {tickets.length > 50 && (
                                    <div className="text-center text-gray-400 text-sm py-4">
                                        ... และอีก {tickets.length - 50} รายการ
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="glass-card p-6">
                        <div className="flex gap-4">
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
                                disabled={tickets.length === 0}
                            >
                                {isSubmitting ? 'กำลังอัพโหลด...' : `อัพโหลด ${tickets.length} ใบ`}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
