import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "../globals.css";
import { Providers } from "../providers";
import { Navbar } from "@/components/cart/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: '--font-outfit',
});

export const metadata: Metadata = {
    title: "สลากดิจิทัล - ระบบสลากกินแบ่งรัฐบาลออนไลน์",
    description: "ซื้อสลากกินแบ่งรัฐบาลออนไลน์ ปลอดภัย รวดเร็ว ตรวจรางวัลอัตโนมัติ",
};

import { setRequestLocale } from 'next-intl/server';

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
