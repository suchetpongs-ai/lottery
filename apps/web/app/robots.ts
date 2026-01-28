import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/checkout/', '/profile/', '/orders/', '/my-prizes/'],
            },
        ],
        sitemap: 'https://hauythai.com/sitemap.xml',
    };
}
