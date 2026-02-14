'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface WinningTicket {
    id: number;
    number: string;
    prizeAmount: number;
    prizeTier: string;
    owner: {
        id: number;
        username: string;
        phoneNumber: string;
    } | null;
    claimStatus: string;
}

interface Round {
    id: number;
    drawDate: string;
    name: string;
}

export function WinningTickets() {
    const [rounds, setRounds] = useState<Round[]>([]);
    const [selectedRound, setSelectedRound] = useState<string>('');
    const [tickets, setTickets] = useState<WinningTicket[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRounds();
    }, []);

    useEffect(() => {
        if (selectedRound) {
            fetchWinningTickets(selectedRound);
        } else {
            setTickets([]);
        }
    }, [selectedRound]);

    const fetchRounds = async () => {
        try {
            const { data } = await api.get('/admin/rounds');
            setRounds(data);
            if (data.length > 0) {
                setSelectedRound(data[0].id.toString());
            }
        } catch (error) {
            console.error('Failed to fetch rounds:', error);
        }
    };

    const fetchWinningTickets = async (roundId: string) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/rounds/${roundId}/winners`);
            setTickets(data);
        } catch (error) {
            console.error('Failed to fetch winning tickets:', error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const formatPrizeTier = (tier: string) => {
        if (!tier) return '-';
        const tiers: Record<string, string> = {
            'firstPrize': 'รางวัลที่ 1',
            'nearby': 'รางวัลข้างเคียง',
            'threeDigitFront': 'เลขหน้า 3 ตัว',
            'threeDigitBack': 'เลขท้าย 3 ตัว',
            'twoDigit': 'เลขท้าย 2 ตัว',
        };
        return tier.split(',').map(t => tiers[t.trim()] || t).join(', ');
    };

    const totalPrizeAmount = tickets.reduce((sum, t) => sum + t.prizeAmount, 0);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
                🏆 ตรวจสอบผู้ถูกรางวัล
            </h2>

            {/* Controls */}
            <div className="glass-card p-6 flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-64">
                    <label className="block text-sm font-medium text-gray-300 mb-2">เลือกงวด</label>
                    <select
                        value={selectedRound}
                        onChange={(e) => setSelectedRound(e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                        {rounds.map((round) => (
                            <option key={round.id} value={round.id}>
                                {new Date(round.drawDate).toLocaleDateString('th-TH')} ({round.name})
                            </option>
                        ))}
                    </select>
                </div>

                {tickets.length > 0 && (
                    <div className="ml-auto text-right">
                        <div className="text-sm text-gray-400">เงินรางวัลรวมทั้งหมด</div>
                        <div className="text-2xl font-bold text-primary-400">฿{totalPrizeAmount.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">{tickets.length} ใบ</div>
                    </div>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
                </div>
            ) : tickets.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    ไม่พบสลากที่ถูกรางวัลในงวดนี้
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">เลขสลาก</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">รางวัล</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">จำนวนเงิน</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">เจ้าของสลาก</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">เบอร์โทร</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">สถานะการขึ้นเงิน</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 text-lg font-mono font-bold text-white">
                                            {ticket.number}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {formatPrizeTier(ticket.prizeTier)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-primary-300">
                                            ฿{ticket.prizeAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">
                                            {ticket.owner ? ticket.owner.username : <span className="text-gray-500">- ยังไม่ขาย -</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {ticket.owner ? ticket.owner.phoneNumber : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${ticket.claimStatus === 'Paid' ? 'bg-primary-500/20 text-primary-300 border-primary-500/50' :
                                                    ticket.claimStatus === 'APPROVED' ? 'bg-success/20 text-success border-success/50' :
                                                        ticket.claimStatus === 'PENDING' ? 'bg-warning/20 text-warning border-warning/50' :
                                                            'bg-gray-700/50 text-gray-400 border-gray-600'
                                                }`}>
                                                {ticket.claimStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
