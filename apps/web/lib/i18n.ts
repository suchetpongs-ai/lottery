import { getRequestConfig } from 'next-intl/server';

export const locales = ['lo', 'th', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'lo';

export const localeNames: Record<Locale, string> = {
    th: 'ไทย',
    lo: 'ລາວ',
    en: 'English',
};

export const localeFlags: Record<Locale, string> = {
    th: '🇹🇭',
    lo: '🇱🇦',
    en: 'EN',
};

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !locales.includes(locale as any)) {
        locale = defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
