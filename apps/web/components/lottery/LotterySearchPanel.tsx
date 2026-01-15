'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface LotterySearchPanelProps {
    initialPattern?: string;
    onSearch: (pattern: string) => void;
}

export function LotterySearchPanel({ initialPattern, onSearch }: LotterySearchPanelProps) {
    const t = useTranslations('browse');
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (initialPattern) {
            const newDigits = initialPattern.split('').map(char => char === '_' ? '' : char);
            // Ensure exactly 6 digits
            while (newDigits.length < 6) newDigits.push('');
            setDigits(newDigits.slice(0, 6));
        }
    }, [initialPattern]);

    const handleChange = (index: number, value: string) => {
        // Allow strictly only numbers
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...digits];
        const lastChar = value.slice(-1); // Take only the last character entered
        newDigits[index] = lastChar;
        setDigits(newDigits);

        // Auto-tab to next input if value is entered
        if (lastChar && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                // Determine if we should delete previous value or just move focus
                // Standard behavior: if current empty, move back and delete previous?
                // Or just move back. Let's move back and focus.
                e.preventDefault();
                inputRefs.current[index - 1]?.focus();
            } else if (digits[index]) {
                // Let default backspace handle clearing current input
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleQuickAction = (action: 'prefix3' | 'suffix2' | 'clear') => {
        if (action === 'clear') {
            setDigits(Array(6).fill(''));
            inputRefs.current[0]?.focus();
        } else if (action === 'prefix3') {
            // Focus first input, maybe clear explicitly or keep existing?
            // "Focus First 3" usually means user wants to type there.
            inputRefs.current[0]?.focus();
        } else if (action === 'suffix2') {
            // Focus 5th input (index 4)
            inputRefs.current[4]?.focus();
        }
    };

    const handleSearchClick = () => {
        // Construct pattern: empty strings become '_'
        const pattern = digits.map(d => d === '' ? '_' : d).join('');
        onSearch(pattern);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Input Panel */}
            <div className="glass-card p-6 md:p-8 mb-6">
                <div className="flex flex-col items-center gap-6">
                    <label className="text-gray-300 text-lg font-medium">
                        {t('searchHint') || 'ระบุเลขที่ต้องการ (เว้นว่างเพื่อสุ่ม)'}
                    </label>

                    <div className="flex gap-2 md:gap-3">
                        {digits.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el }}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`w-10 h-14 md:w-14 md:h-16 text-2xl md:text-3xl font-bold text-center rounded-lg border-2 transition-all 
                                    ${digit
                                        ? 'bg-primary-500 text-white border-primary-400 shadow-lg shadow-primary-500/20'
                                        : 'bg-white/5 text-transparent border-white/20 focus:border-primary-400 focus:bg-white/10'
                                    } focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
                                placeholder="_"
                            />
                        ))}
                    </div>

                    <div className="flex gap-3 justify-center w-full">
                        <button
                            onClick={handleSearchClick}
                            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary-500/30 transform transition hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {t('searchButton')}
                        </button>
                    </div>
                </div>

                {/* Quick Actions - REMOVED as per user request */}
                {/* <div className="mt-8 flex flex-wrap justify-center gap-3"> ... </div> */}
            </div>
        </div>
    );
}
