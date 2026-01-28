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

// SEO Metadata per locale
const seoData: Record<string, { title: string; description: string }> = {
    lo: {
        title: "ສະຫຼາກດິຈິທອລ - ຊື້ສະຫຼາກອອນລາຍ ປອດໄພ ໄວ",
        description: "ແພລັດຟອມຊື້ສະຫຼາກກິນແບ່ງລັດຖະບານອອນລາຍ ປອດໄພ ໄວ ກວດລາງວັນອັດຕະໂນມັດ ຮັບເງິນໄວ",
    },
    th: {
        title: "สลากดิจิทัล - ซื้อสลากออนไลน์ ปลอดภัย รวดเร็ว",
        description: "แพลตฟอร์มซื้อสลากกินแบ่งรัฐบาลออนไลน์ ปลอดภัย รวดเร็ว ตรวจรางวัลอัตโนมัติ รับเงินไว",
    },
    en: {
        title: "Digital Lottery - Buy Lottery Online, Safe & Fast",
        description: "Online government lottery platform. Safe, fast, automatic prize checking, instant payouts.",
    },
};

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params;
    const baseUrl = 'https://hauythai.com';

    // Explicitly handle all cases to ensure seo is never undefined
    let seo: { title: string; description: string };
    if (locale === 'th') {
        seo = seoData['th'];
    } else if (locale === 'en') {
        seo = seoData['en'];
    } else {
        seo = seoData['lo'];
    }

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
                            "@type": "WebSite",
                            "name": "ສະຫຼາກດິຈິທອລ",
                            "alternateName": ["สลากดิจิทัล", "Digital Lottery"],
                            "url": "https://hauythai.com",
                            "potentialAction": {
                                "@type": "SearchAction",
                                "target": "https://hauythai.com/browse?q={search_term_string}",
                                "query-input": "required name=search_term_string"
                            }
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
