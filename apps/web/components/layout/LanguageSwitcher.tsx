'use client';

import { usePathname, useRouter } from '@/lib/navigation';
import { useLocale } from 'next-intl';
import { useState, useTransition } from 'react';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
    const locale = useLocale() as Locale;
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    const switchLocale = (newLocale: Locale) => {
        startTransition(() => {
            // Use next-intl router which automatically handles locale switching
            router.replace(pathname, { locale: newLocale });
            setIsOpen(false);
        });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                disabled={isPending}
            >
                <span className="text-xl">{localeFlags[locale]}</span>
                <span className="text-sm font-medium">{localeNames[locale]}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-900 shadow-xl border border-white/10 overflow-hidden z-20">
                        {locales.map((loc) => (
                            <button
                                key={loc}
                                onClick={() => switchLocale(loc)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${locale === loc
                                    ? 'bg-primary/20 text-primary'
                                    : 'hover:bg-white/5 text-white'
                                    }`}
                                disabled={isPending}
                            >
                                <span className="text-xl">{localeFlags[loc]}</span>
                                <span className="text-sm font-medium">{localeNames[loc]}</span>
                                {locale === loc && (
                                    <svg
                                        className="w-4 h-4 ml-auto text-primary"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
