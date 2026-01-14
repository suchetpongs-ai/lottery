'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { TicketCard } from '@/components/lottery/TicketCard';
import { Button } from '@/components/ui/Button';
import { useSearchTickets, useCurrentRound } from '@/lib/api/hooks/useLottery';

type SearchType = 'exact' | 'prefix' | 'suffix';

export default function BrowsePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialNumber = searchParams.get('number') || '';

    const [searchNumber, setSearchNumber] = useState(initialNumber);
    const [searchType, setSearchType] = useState<SearchType>('exact');
    const [page, setPage] = useState(1);
    const limit = 12;

    const { data: currentRound } = useCurrentRound();
    const { data: searchResult, isLoading } = useSearchTickets({
        number: searchNumber,
        searchType: searchNumber ? searchType : undefined,
        page,
        limit,
    });

    const tickets = searchResult?.data || [];
    const total = searchResult?.pagination?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page on new search
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-heading font-bold text-gradient mb-4">
                        เลือกซื้อสลาก
                    </h1>
                    <p className="text-gray-400 text-lg">
                        ค้นหาและเลือกเลขสลากที่คุณชื่นชอบ
                    </p>
                    {currentRound && (
                        <div className="mt-4 inline-flex items-center gap-2 glass-card px-4 py-2">
                            <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-300">
                                งวดวันที่ {new Date(currentRound.drawDate).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Search Bar */}
                <div className="glass-card p-6 mb-12">
                    <form onSubmit={handleSearch}>
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Type Selector */}
                            <div className="flex gap-2">
                                {[
                                    { value: 'exact' as SearchType, label: 'เลขตรง' },
                                    { value: 'prefix' as SearchType, label: 'ขึ้นต้นด้วย' },
                                    { value: 'suffix' as SearchType, label: 'ลงท้ายด้วย' },
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setSearchType(type.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${searchType === type.value
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search Input */}
                            <div className="flex-1 flex gap-3">
                                <input
                                    type="text"
                                    placeholder="ค้นหาเลขสลาก เช่น 123456"
                                    value={searchNumber}
                                    onChange={(e) => setSearchNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    maxLength={6}
                                />
                                <Button type="submit" variant="primary" size="lg" className="px-8">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    ค้นหา
                                </Button>
                            </div>
                        </div>
                    </form>

                    {/* Results Info */}
                    {searchNumber && (
                        <div className="mt-4 text-sm text-gray-400">
                            ค้นหา "{searchNumber}" แบบ{searchType === 'exact' ? 'เลขตรง' : searchType === 'prefix' ? 'ขึ้นต้นด้วย' : 'ลงท้ายด้วย'}
                            {' - '}พบ {total} รายการ
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
                    </div>
                )}

                {/* Tickets Grid */}
                {!isLoading && tickets.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                            {tickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.id}
                                    ticket={{
                                        id: ticket.id,
                                        number: ticket.number,
                                        price: ticket.price,
                                        status: ticket.status,
                                        set: ticket.set || 0,
                                        roundId: String(ticket.roundId)
                                    } as any}
                                    onViewDetails={() => router.push(`/ticket/${ticket.id}`)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Button>

                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (page <= 3) {
                                            pageNum = i + 1;
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = page - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-all ${page === pageNum
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {!isLoading && tickets.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 21a9 9 0 100-18 9 9 0 000 18z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-heading font-bold text-white mb-2">
                            ไม่พบสลากที่ค้นหา
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {searchNumber
                                ? 'ลองค้นหาด้วยเลขอื่น หรือเปลี่ยนประเภทการค้นหา'
                                : 'กรุณากรอกเลขสลากที่ต้องการค้นหา'}
                        </p>
                        {searchNumber && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchNumber('');
                                    setPage(1);
                                }}
                            >
                                ล้างการค้นหา
                            </Button>
                        )}
                    </div>
                )}

                {/* Back to Home */}
                <div className="mt-12 text-center">
                    <Link href="/">
                        <Button variant="ghost">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            กลับหน้าแรก
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
