'use client';

import { Link } from '@/lib/navigation';
import { useState } from 'react';
import { CartIcon } from './CartIcon';
import { CartSidebar } from './CartSidebar';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';
import { useTranslations } from 'next-intl';

import { UserMenu } from '../layout/UserMenu';

export function Navbar() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const t = useTranslations();

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-30 glass-card border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <span className="text-xl font-heading font-bold text-gradient">
                                {t('home.title')}
                            </span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                href="/"
                                className="text-gray-300 hover:text-primary-400 transition-colors font-medium"
                            >
                                {t('nav.home')}
                            </Link>
                            <Link
                                href="/browse"
                                className="text-gray-300 hover:text-primary-400 transition-colors font-medium"
                            >
                                {t('nav.browse')}
                            </Link>
                            <Link
                                href="/results"
                                className="text-gray-300 hover:text-primary-400 transition-colors font-medium"
                            >
                                {t('nav.results')}
                            </Link>
                            <Link
                                href="/orders"
                                className="text-gray-300 hover:text-primary-400 transition-colors font-medium"
                            >
                                {t('nav.orders')}
                            </Link>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            <LanguageSwitcher />
                            <CartIcon onClick={() => setIsCartOpen(true)} />
                            <UserMenu />
                        </div>
                    </div>
                </div>
            </div>
        </nav >

            {/* Cart Sidebar */ }
            < CartSidebar isOpen = { isCartOpen } onClose = {() => setIsCartOpen(false)
} />

{/* Spacer for fixed navbar */ }
<div className="h-16"></div>
        </>
    );
}
