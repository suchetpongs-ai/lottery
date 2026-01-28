import { MetadataRoute } from 'next';

const baseUrl = 'https://hauythai.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const locales = ['lo', 'th', 'en'];

    // Main pages
    const pages = [
        '',
        '/browse',
        '/results',
        '/check-prize',
        '/register',
        '/login',
        '/legal/terms',
        '/legal/privacy',
    ];

    const sitemapEntries: MetadataRoute.Sitemap = [];

    // Add entries for each page in each locale
    for (const page of pages) {
        for (const locale of locales) {
            const url = locale === 'lo'
                ? `${baseUrl}${page}`
                : `${baseUrl}/${locale}${page}`;

            sitemapEntries.push({
                url,
                lastModified: new Date(),
                changeFrequency: page === '' ? 'daily' : 'weekly',
                priority: page === '' ? 1.0 : 0.8,
                alternates: {
                    languages: {
                        lo: `${baseUrl}${page}`,
                        th: `${baseUrl}/th${page}`,
                        en: `${baseUrl}/en${page}`,
                    }
                }
            });
        }
    }

    return sitemapEntries;
}
