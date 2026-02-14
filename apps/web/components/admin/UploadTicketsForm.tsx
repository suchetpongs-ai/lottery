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
    const [mode, setMode] = useState<'csv' | 'manual' | 'manage'>('csv');

    const [roundId, setRoundId] = useState('');
    const [file, setFile] = useState<File | null>(null);

    // Manual Entry State
    const [manualTicket, setManualTicket] = useState({ number: '', price: '80', amount: '1' });

    // Ticket List State
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [search, setSearch] = useState('');

    // Editing State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editPrice, setEditPrice] = useState<string>('');

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

    const handleStartEdit = async (ticket: Ticket) => {
        if (ticket.status === 'Sold') return;

        try {
            // Lock the ticket by setting status to Reserved
            await api.put(`/admin/tickets/${ticket.id}`, { status: 'Reserved' });
            setEditingId(ticket.id);
            setEditPrice(ticket.price.toString());
            // Optimistically update status in UI to reflect lock
            setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'Reserved' } : t));
        } catch (err) {
            alert('ไม่สามารถเริ่มแก้ไขได้ (อาจมีคนจองตัดหน้า)');
            fetchTickets();
        }
    };

    const handleCancelEdit = async (id: number) => {
        try {
            // Unlock by setting status back to Available
            await api.put(`/admin/tickets/${id}`, { status: 'Available' });
            setEditingId(null);
            setEditPrice('');
            // Optimistically update
            setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Available' } : t));
        } catch (err) {
            alert('ยกเลิกไม่สำเร็จ กรุณารีเฟรช');
            fetchTickets();
        }
    };

    const handleSaveEdit = async (id: number) => {
        try {
            // Update price AND unlock status
            await api.put(`/admin/tickets/${id}`, {
                price: parseFloat(editPrice),
                status: 'Available'
            });
            setEditingId(null);
            setEditPrice('');
            fetchTickets(); // Refresh specifically to ensure data consistency
        } catch (err) {
            alert('บันทึกไม่สำเร็จ');
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
                            onClick={() => setMode('manage')}
                            className={`px-4 py-1.5 rounded-md text-sm transition-all ${mode === 'manage' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            จัดการสลากทั้งหมด
                        </button>
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

                {mode === 'manage' ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                เลือกงวดเพื่อจัดการ (Round ID)
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="number"
                                    required
                                    value={roundId}
                                    onChange={(e) => setRoundId(e.target.value)}
                                    placeholder="ใส่เลขงวด..."
                                    className="w-full md:w-64 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                />
                                <Button
                                    size="sm"
                                    onClick={fetchTickets}
                                    disabled={!roundId}
                                >
                                    ดึงข้อมูลทันที
                                </Button>
                            </div>
                        </div>

                        {/* Search within Manage Mode */}
                        {roundId && (
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg">
                                <span className="text-gray-400 text-sm">ค้นหาในงวดนี้:</span>
                                <input
                                    type="text"
                                    placeholder="พิมพ์เลขสลาก..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
                                    className="px-3 py-1 bg-black/20 border border-white/10 rounded text-white text-sm w-48 focus:w-64 transition-all"
                                />
                            </div>
                        )}

                    </div>
                ) : (
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
                )}
            </div>

            {/* Ticket List (Always visible if roundId is set, or in Manage Mode) */}
            {roundId && (
                <div className="glass-card p-8 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-heading text-white">รายการสลากในงวดนี้</h3>
                        {/* Search input is handled above in manage mode, or here for upload mode? Let's keep duplicate search for usability if not in manage mode */}
                        {mode !== 'manage' && (
                            <input
                                type="text"
                                placeholder="ค้นหาเลข..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                            />
                        )}
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
                                        <tr key={t.id} className={`transition-colors ${t.status === 'Sold' ? 'bg-white/5 opacity-50' : 'hover:bg-white/5'}`}>
                                            <td className="p-3 font-mono text-lg text-primary-400">{t.number}</td>
                                            <td className="p-3">
                                                {editingId === t.id ? (
                                                    <input
                                                        type="number"
                                                        value={editPrice}
                                                        onChange={(e) => setEditPrice(e.target.value)}
                                                        className="w-20 px-2 py-1 bg-black text-white rounded border border-primary-500"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    t.price
                                                )}
                                            </td>
                                            <td className="p-3">{t.setSize}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-xs 
                                                    ${t.status === 'Available' ? 'bg-success/20 text-success' :
                                                        t.status === 'Sold' ? 'bg-gray-500/20 text-gray-400' :
                                                            'bg-warning/20 text-warning'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                {t.status === 'Sold' ? (
                                                    <span className="text-gray-500 text-sm">🔒 ขายแล้ว</span>
                                                ) : editingId === t.id ? (
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => handleSaveEdit(t.id)}
                                                            className="text-success hover:text-success/80 text-sm font-medium"
                                                        >
                                                            บันทึก
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelEdit(t.id)}
                                                            className="text-white hover:text-gray-300 text-sm"
                                                        >
                                                            ยกเลิก
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-3 justify-end">
                                                        <button
                                                            onClick={() => handleStartEdit(t)}
                                                            className="text-primary-300 hover:text-primary-200 text-sm"
                                                        >
                                                            แก้ไขราคา
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(t.id)}
                                                            className="text-error hover:text-error/80 text-sm"
                                                            disabled={t.status === 'Reserved'} // Prevent deleting locked ticket just in case
                                                        >
                                                            ลบ
                                                        </button>
                                                    </div>
                                                )}
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
