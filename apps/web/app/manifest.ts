
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'สลากดิจิทัล - Digital Lottery',
        short_name: 'Digital Lottery',
        description: 'แพลตฟอร์มซื้อสลากกินแบ่งรัฐบาลออนไลน์ ปลอดภัย รวดเร็ว - Online government lottery platform',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
