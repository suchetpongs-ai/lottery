'use client';

import { Link } from '@/lib/navigation';
import { useState } from 'react';
import { CartIcon } from './CartIcon';
import { CartSidebar } from './CartSidebar';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { UserMenu } from '../layout/UserMenu';
import { Menu, X } from 'lucide-react';

export function Navbar() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const t = useTranslations();

    const navLinks = [
        { href: '/', label: t('nav.home') },
        { href: '/browse', label: t('nav.browse') },
        { href: '/results', label: t('nav.results') },
        { href: '/orders', label: t('nav.orders') },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-30 glass-card border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-300 hover:text-primary-400 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <span className="hidden sm:block text-xl font-heading font-bold text-gradient">
                                {t('home.title')}
                            </span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-gray-300 hover:text-primary-400 transition-colors font-medium"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <LanguageSwitcher />
                            <CartIcon onClick={() => setIsCartOpen(true)} />
                            <UserMenu />
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-lg">
                        <div className="px-4 py-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block py-3 px-4 text-gray-300 hover:text-primary-400 hover:bg-white/5 rounded-lg transition-colors font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Cart Sidebar */}
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Spacer for fixed navbar */}
            <div className="h-16"></div>
        </>
    );
}
