import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "../globals.css";
import { Providers } from "../providers";
import { Navbar } from "@/components/cart/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n';

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: '--font-outfit',
});

// SEO Metadata per locale - using const to ensure type safety
const seoLo = {
    title: "ສະຫຼາກດິຈິທອລ - ຊື້ສະຫຼາກອອນລາຍ ປອດໄພ ໄວ",
    description: "ແພລັດຟອມຊື້ສະຫຼາກກິນແບ່ງລັດຖະບານອອນລາຍ ປອດໄພ ໄວ ກວດລາງວັນອັດຕະໂນມັດ ຮັບເງິນໄວ",
};
const seoTh = {
    title: "สลากดิจิทัล - ซื้อสลากออนไลน์ ปลอดภัย รวดเร็ว",
    description: "แพลตฟอร์มซื้อสลากกินแบ่งรัฐบาลออนไลน์ ปลอดภัย รวดเร็ว ตรวจรางวัลอัตโนมัติ รับเงินไว",
};
const seoEn = {
    title: "Digital Lottery - Buy Lottery Online, Safe & Fast",
    description: "Online government lottery platform. Safe, fast, automatic prize checking, instant payouts.",
};

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params;
    const baseUrl = 'https://hauythai.com';

    // Get SEO data based on locale with guaranteed non-undefined value
    const seo = locale === 'th' ? seoTh : locale === 'en' ? seoEn : seoLo;

    return {
        title: seo.title,
        description: seo.description,
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: locale === 'lo' ? baseUrl : `${baseUrl}/${locale}`,
            languages: {
                'lo': baseUrl,
                'th': `${baseUrl}/th`,
                'en': `${baseUrl}/en`,
            },
        },
        openGraph: {
            title: seo.title,
            description: seo.description,
            url: locale === 'lo' ? baseUrl : `${baseUrl}/${locale}`,
            siteName: 'ສະຫຼາກດິຈິທອລ',
            locale: locale === 'lo' ? 'lo_LA' : locale === 'th' ? 'th_TH' : 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: seo.title,
            description: seo.description,
        },
        robots: {
            index: true,
            follow: true,
        },
        keywords: ['lottery', 'digital lottery', 'buy lottery online', 'lao lottery', 'thai lottery', 'หวย', 'สลากกินแบ่ง', 'ซื้อหวยออนไลน์', 'ສະຫຼາກ', 'ຫວຍ'],
    };
}

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Enable static rendering
    setRequestLocale(locale);

    // Fetch messages for the current locale
    const messages = await getMessages({ locale });

    return (
        <html lang={locale} className="dark">
            <head>
                {/* JSON-LD Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@graph": [
                                {
                                    "@type": "WebSite",
                                    "name": "ສະຫຼາກດິຈິທອລ",
                                    "alternateName": ["สลากดิจิทัล", "Digital Lottery"],
                                    "url": "https://hauythai.com",
                                    "potentialAction": {
                                        "@type": "SearchAction",
                                        "target": "https://hauythai.com/browse?q={search_term_string}",
                                        "query-input": "required name=search_term_string"
                                    }
                                },
                                {
                                    "@type": "Organization",
                                    "name": "Digital Lottery",
                                    "url": "https://hauythai.com",
                                    "logo": "https://hauythai.com/favicon.ico",
                                    "sameAs": [
                                        "https://facebook.com/digitallottery",
                                        "https://twitter.com/digitallottery"
                                    ]
                                }
                            ]
                        })
                    }}
                />
            </head>
            <body className={`${inter.variable} ${outfit.variable}`}>
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        <Navbar />
                        {children}
                        <Footer />
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
