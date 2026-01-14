'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTicketById } from '@/lib/api/hooks/useLottery';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: ticket, isLoading, error } = useTicketById(id);
    const addTicket = useCartStore((state) => state.addTicket);
    const cartTickets = useCartStore((state) => state.tickets);

    const isInCart = ticket ? cartTickets.some((t) => t.id === ticket.id) : false;
    const isAvailable = ticket?.status === 'Available';

    const handleAddToCart = () => {
        if (ticket && isAvailable && !isInCart) {
            addTicket(ticket);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold mb-4">ไม่พบข้อมูลสลาก</h2>
                <Button onClick={() => router.back()} variant="outline">
                    ย้อนกลับ
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20 px-4 flex items-center justify-center">
            <div className="max-w-4xl w-full">
                <Button
                    onClick={() => router.back()}
                    variant="ghost"
                    className="mb-8 text-gray-400 hover:text-white"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    ย้อนกลับ
                </Button>

                <div className="glass-card p-8 md:p-12 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        {/* Ticket Visual */}
                        <div className="flex flex-col items-center">
                            <div className="w-full aspect-[2/1] bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-glow">
                                <div className="text-sm text-primary-200 uppercase tracking-wider mb-2">สลากกินแบ่งรัฐบาล API</div>
                                <div className="text-6xl md:text-7xl font-bold text-white tracking-[0.2em] relative z-10 font-mono">
                                    {ticket.number}
                                </div>
                                <div className="absolute bottom-4 right-6 text-2xl text-white/50 font-bold rotate-[-15deg]">
                                    งวดที่ 1
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/topography.svg')] opacity-10"></div>
                            </div>
                        </div>

                        {/* Ticket Details */}
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${ticket.status === 'Available' ? 'bg-success/20 text-success' :
                                        ticket.status === 'Reserved' ? 'bg-warning/20 text-warning' :
                                            'bg-error/20 text-error'
                                    }`}>
                                    {ticket.status === 'Available' ? 'ว่าง' : ticket.status === 'Reserved' ? 'จองแล้ว' : 'ขายแล้ว'}
                                </span>
                                <span className="text-gray-400 text-sm">ชุดที่ {ticket.set || 1}</span>
                            </div>

                            <h1 className="text-4xl font-heading font-bold text-white mb-2">
                                เลขสลาก {ticket.number}
                            </h1>
                            <p className="text-gray-400 mb-8">
                                ประจำงวดวันที่ {ticket.round?.drawDate ? new Date(ticket.round.drawDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                            </p>

                            <div className="flex items-end gap-2 mb-8">
                                <span className="text-5xl font-bold text-primary-400">฿ {ticket.price}</span>
                                <span className="text-gray-400 mb-2">บาท</span>
                            </div>

                            <div className="flex gap-4">
                                {isInCart ? (
                                    <Button size="lg" disabled variant="outline" className="flex-1">
                                        อยู่ในตะกร้าแล้ว
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        variant="primary"
                                        className="flex-1"
                                        onClick={handleAddToCart}
                                        disabled={!isAvailable}
                                    >
                                        {isAvailable ? 'เพิ่มในตะกร้า' : 'ไม่สามารถซื้อได้'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
