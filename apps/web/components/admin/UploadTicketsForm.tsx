'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface Ticket {
    id: number;
    number: string;
    price: number;
    setSize: number;
    status: string;
}

export function UploadTicketsForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'csv' | 'manual'>('csv');

    const [roundId, setRoundId] = useState('');
    const [file, setFile] = useState<File | null>(null);

    // Manual Entry State
    const [manualTicket, setManualTicket] = useState({ number: '', price: '80', amount: '1' });

    // Ticket List State
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [search, setSearch] = useState('');

    const fetchTickets = useCallback(async () => {
        if (!roundId) return;
        setLoadingTickets(true);
        try {
            const { data } = await api.get(`/admin/tickets?roundId=${roundId}&search=${search}`);
            setTickets(data.data || []);
        } catch (err) {
            console.error('Failed to fetch tickets', err);
        } finally {
            setLoadingTickets(false);
        }
    }, [roundId, search]);

    useEffect(() => {
        if (roundId) {
            fetchTickets();
        } else {
            setTickets([]);
        }
    }, [roundId, fetchTickets]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('ยืนยันการลบสลากนี้?')) return;
        try {
            await api.delete(`/admin/tickets/${id}`);
            fetchTickets();
        } catch (err) {
            alert('ลบสลากไม่สำเร็จ');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            let ticketsPayload = [];

            if (mode === 'csv') {
                if (!file) throw new Error('กรุณาเลือกไฟล์');
                const text = await file.text();
                const lines = text.split('\n').filter(line => line.trim());
                ticketsPayload = lines.slice(1).map(line => {
                    const [ticketNumber, priceStr] = line.split(',');
                    return {
                        number: ticketNumber?.trim() || '',
                        price: parseFloat(priceStr?.trim() || '0'),
                        set: 1,
                    };
                }).filter(ticket => ticket.number && !isNaN(ticket.price));
            } else {
                if (manualTicket.number.length !== 6) throw new Error('เลขสลากต้องมี 6 หลัก');
                ticketsPayload = [{
                    number: manualTicket.number,
                    price: parseFloat(manualTicket.price),
                    set: parseInt(manualTicket.amount),
                }];
            }

            await api.post('/admin/tickets', {
                roundId: parseInt(roundId),
                tickets: ticketsPayload,
            });

            setSuccess(true);
            setFile(null);
            setManualTicket({ number: '', price: '80', amount: '1' });

            if (mode === 'csv') {
                const fileInput = document.getElementById('ticket-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }

            // Refresh list
            fetchTickets();

            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || err.response?.data?.message || 'Failed to upload tickets');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="glass-card p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-heading font-bold text-white">
                        จัดการสลาก
                    </h2>
                    <div className="flex bg-white/5 p-1 rounded-lg">
                        <button
                            onClick={() => setMode('csv')}
                            className={`px-4 py-1.5 rounded-md text-sm transition-all ${mode === 'csv' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            อัพโหลด CSV
                        </button>
                        <button
                            onClick={() => setMode('manual')}
                            className={`px-4 py-1.5 rounded-md text-sm transition-all ${mode === 'manual' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            เพิ่มทีละใบ
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            เลขที่งวด (Round ID)
                        </label>
                        <input
                            type="number"
                            required
                            value={roundId}
                            onChange={(e) => setRoundId(e.target.value)}
                            placeholder="ใส่เลขงวดเพื่อจัดการข้อมูล"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                        />
                    </div>

                    {mode === 'csv' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                ไฟล์ CSV
                            </label>
                            <input
                                id="ticket-file"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                            />
                            <p className="text-xs text-gray-500 mt-2">Format: ticketNumber,price</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">เลขสลาก</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={manualTicket.number}
                                    onChange={(e) => setManualTicket({ ...manualTicket, number: e.target.value.replace(/\D/g, '') })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center font-mono text-xl tracking-widest focus:ring-2 focus:ring-primary-400"
                                    placeholder="000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">ราคา</label>
                                <input
                                    type="number"
                                    value={manualTicket.price}
                                    onChange={(e) => setManualTicket({ ...manualTicket, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-right focus:ring-2 focus:ring-primary-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">จำนวน</label>
                                <input
                                    type="number"
                                    value={manualTicket.amount}
                                    onChange={(e) => setManualTicket({ ...manualTicket, amount: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-right focus:ring-2 focus:ring-primary-400"
                                />
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-success/20 border border-success/50 rounded-lg text-success">
                            ✓ ดำเนินการสำเร็จ
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-error/20 border border-error/50 rounded-lg text-error">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={loading || !roundId}
                    >
                        {loading ? 'กำลังทำงาน...' : (mode === 'csv' ? 'อัพโหลดไฟล์' : 'บันทึกข้อมูล')}
                    </Button>
                </form>
            </div>

            {/* Ticket List */}
            {roundId && (
                <div className="glass-card p-8 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-heading text-white">รายการสลากในงวดนี้</h3>
                        <input
                            type="text"
                            placeholder="ค้นหาเลข..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-sm">
                                <tr>
                                    <th className="p-3">เลขสลาก</th>
                                    <th className="p-3">ราคา</th>
                                    <th className="p-3">ชุด</th>
                                    <th className="p-3">สถานะ</th>
                                    <th className="p-3 text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loadingTickets ? (
                                    <tr><td colSpan={5} className="p-4 text-center text-gray-500">กำลังโหลด...</td></tr>
                                ) : tickets.length === 0 ? (
                                    <tr><td colSpan={5} className="p-4 text-center text-gray-500">ไม่พบข้อมูล</td></tr>
                                ) : (
                                    tickets.map((t) => (
                                        <tr key={t.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-mono text-lg text-primary-400">{t.number}</td>
                                            <td className="p-3">{t.price}</td>
                                            <td className="p-3">{t.setSize}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-xs ${t.status === 'Available' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    className="text-error hover:text-error/80 text-sm"
                                                >
                                                    ลบ
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
