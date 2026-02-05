'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
    interface Window {
        Omise: any;
        OmiseCard: any;
    }
}

interface OmiseScriptProps {
    onLoad?: () => void;
}

export function OmiseScript({ onLoad }: OmiseScriptProps) {
    const publicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || 'pkey_test_xxxxxxxxxxxxx';

    useEffect(() => {
        if (window.Omise) {
            window.Omise.setPublicKey(publicKey);
            if (onLoad) onLoad();
        }
    }, [onLoad, publicKey]);

    return (
        <Script
            src="https://cdn.omise.co/omise.js"
            strategy="lazyOnload"
            onLoad={() => {
                if (window.Omise) {
                    window.Omise.setPublicKey(publicKey);
                    if (onLoad) onLoad();
                }
            }}
        />
    );
}
