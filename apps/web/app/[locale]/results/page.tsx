'use client';

import { useState, useEffect } from 'react';
import { usePastResults, Round, WinningNumbers } from '@/lib/api/hooks/useLottery';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';

export default function ResultsPage() {
    const t = useTranslations('results');
    const locale = useLocale();
    const { data: rounds, isLoading } = usePastResults();
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // Check Prize State
    const [ticketNumber, setTicketNumber] = useState('');
    const [selectedRoundId, setSelectedRoundId] = useState<string>('');
    const [checkResult, setCheckResult] = useState<any>(null);
    const [checkLoading, setCheckLoading] = useState(false);

    // Auto expand the first one if available and nothing selected
    useEffect(() => {
        if (rounds && rounds.length > 0 && rounds[0]) {
            if (expandedId === null) setExpandedId(rounds[0].id);
            if (!selectedRoundId) setSelectedRoundId(rounds[0].id.toString());
        }
    }, [rounds, expandedId, selectedRoundId]);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleCheckPrize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketNumber || ticketNumber.length !== 6) {
            alert(t('errorInput'));
            return;
        }
        if (!selectedRoundId) return;

        setCheckLoading(true);
        setCheckResult(null);

        try {
            const { data } = await api.post('/lottery/check-prize', {
                ticketNumber,
                roundId: parseInt(selectedRoundId)
            });
            setCheckResult(data);
        } catch (error) {
            console.error(error);
            alert(t('errorCheck'));
        } finally {
            setCheckLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-heading font-bold text-gradient mb-4">
                        {t('pageTitle')}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {t('pageSubtitle')}
                    </p>
                </div>

                {/* Result Checker Section */}
                <div className="glass-card p-8 mb-12 border border-primary-500/20 bg-gradient-to-b from-white/5 to-transparent">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>🔍</span> {t('checkTitle')}
                    </h2>

                    <form onSubmit={handleCheckPrize} className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Round Selector */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('selectRound')}</label>
                                <select
                                    value={selectedRoundId}
                                    onChange={(e) => setSelectedRoundId(e.target.value)}
                                    className="w-full h-[50px] px-4 bg-white/5 border border-white/10 rounded-lg text-white appearance-none focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    {rounds?.map(round => (
                                        <option key={round.id} value={round.id} className="bg-slate-800">
                                            {new Date(round.drawDate).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Number Input */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('inputLabel')}</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={ticketNumber}
                                    onChange={(e) => setTicketNumber(e.target.value.replace(/\D/g, ''))}
                                    placeholder={t('inputPlaceholder')}
                                    className="w-full h-[50px] px-4 bg-white/5 border border-white/10 rounded-lg text-xl font-mono text-center text-white placeholder-gray-600 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>

                            {/* Button */}
                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    disabled={checkLoading || ticketNumber.length !== 6 || !selectedRoundId}
                                    className="w-full h-[50px] text-lg"
                                >
                                    {checkLoading ? t('checking') : t('checkButton')}
                                </Button>
                            </div>
                        </div>
                    </form>

                    {/* Result Display */}
                    {checkResult && (
                        <div className={`mt-8 p-6 rounded-xl text-center animate-fadeIn ${checkResult.isWinner
                            ? 'bg-gradient-to-r from-success/20 to-success/10 border border-success/30'
                            : 'bg-white/5 border border-white/10'
                            }`}>
                            <div className="mb-2">
                                <span className={`text-3xl font-bold ${checkResult.isWinner ? 'text-success' : 'text-gray-400'}`}>
                                    {checkResult.isWinner ? t('resultWinner') : t('resultLoser')}
                                </span>
                            </div>
                            {checkResult.isWinner && (
                                <div className="text-xl text-white mt-2">
                                    {t('prizeAmount')} <span className="text-secondary-400 font-bold text-2xl mx-1">{checkResult.prizeAmount?.toLocaleString()}</span> {t('baht')}
                                </div>
                            )}
                            <div className="text-sm text-gray-500 mt-4">
                                {t('drawDate')} {checkResult.roundName} • {t('checkedNumber')} {checkResult.ticketNumber}
                            </div>
                        </div>
                    )}
                </div>

                {!rounds || rounds.length === 0 ? (
                    <div className="glass-card p-12 text-center text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t('noResults')}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {rounds.map((round) => (
                            <ResultCard
                                key={round.id}
                                round={round}
                                isExpanded={expandedId === round.id}
                                onToggle={() => toggleExpand(round.id)}
                                t={t}
                                locale={locale}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ResultCard({ round, isExpanded, onToggle, t, locale }: { round: Round; isExpanded: boolean; onToggle: () => void; t: any; locale: string }) {
    const winningNumbers = round.winningNumbers as WinningNumbers;
    // Handle case where winningNumbers might be missing/null locally even if status is DRAWN
    if (!winningNumbers) return null;

    return (
        <div className="glass-card overflow-hidden transition-all duration-300">
            {/* Header */}
            <div
                className={`p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 ${isExpanded ? 'bg-white/5' : ''}`}
                onClick={onToggle}
            >
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                        {t('drawDateLabel')} {new Date(round.drawDate).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {round.name || t('pageTitle')}
                    </p>
                </div>
                <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-6 border-t border-white/10 animate-fadeIn">
                    {/* First Prize */}
                    <div className="text-center mb-8">
                        <h4 className="text-lg text-primary-300 mb-2">{t('prize1')}</h4>
                        <div className="text-5xl md:text-6xl font-bold font-mono text-white tracking-widest text-shadow-glow">
                            {winningNumbers.firstPrize}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{t('prizePerTicket')} 6,000,000 {t('baht')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {/* 3 Digits */}
                        <div className="space-y-6">
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <h4 className="text-gray-300 mb-2">{t('prize3Front')}</h4>
                                <div className="flex justify-center gap-8">
                                    {(winningNumbers.threeDigitFront || []).map((num, i) => (
                                        <span key={i} className="text-3xl font-mono font-bold text-secondary-300 tracking-wider">
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <h4 className="text-gray-300 mb-2">{t('prize3Back')}</h4>
                                <div className="flex justify-center gap-8">
                                    {(winningNumbers.threeDigitBack || []).map((num, i) => (
                                        <span key={i} className="text-3xl font-mono font-bold text-secondary-300 tracking-wider">
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2 Digits & Nearby */}
                        <div className="space-y-6">
                            <div className="bg-white/5 rounded-xl p-4 text-center h-full flex flex-col justify-center">
                                <h4 className="text-gray-300 mb-2">{t('prize2')}</h4>
                                <div className="text-5xl font-mono font-bold text-primary-400 tracking-wider">
                                    {(winningNumbers.twoDigit || [])[0]}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nearby Prizes */}
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <h4 className="text-gray-300 mb-2">{t('prizeNearby')}</h4>
                        <div className="flex justify-center flex-wrap gap-4 md:gap-12">
                            {(winningNumbers.nearby || []).map((num, i) => (
                                <span key={i} className="text-2xl font-mono font-bold text-gray-300 items-center flex">
                                    {num}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
