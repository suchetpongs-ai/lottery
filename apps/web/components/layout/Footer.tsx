import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';

export function Footer() {
    const t = useTranslations('footer');
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-secondary-900 border-t border-white/10 mt-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* About */}
                    <div>
                        <h3 className="text-white font-heading font-bold mb-4">
                            {t('about.title')}
                        </h3>
                        <p className="text-gray-400 text-sm">
                            {t('about.description')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-heading font-bold mb-4">
                            {t('menu.title')}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                                    {t('menu.home')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                                    {t('menu.browse')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/orders" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                                    {t('menu.orders')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-heading font-bold mb-4">
                            {t('legal.title')}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/legal/terms" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                                    {t('legal.terms')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/privacy" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                                    {t('legal.privacy')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-heading font-bold mb-4">
                            {t('contact.title')}
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>{t('contact.email')}</li>
                            <li>{t('contact.phone')}</li>
                            <li className="flex items-center gap-2 mt-4">
                                <span>18+</span>
                                <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded">
                                    {t('contact.adultsOnly')}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-gray-500 text-sm text-center md:text-left">
                        {t('copyright', { year: currentYear })}
                    </div>
                    <div className="text-gray-500 text-sm text-center md:text-right">
                        {t('builtWith')}
                    </div>
                </div>
            </div>
        </footer>
    );
}
