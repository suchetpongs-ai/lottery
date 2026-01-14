'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
    expireAt: string; // ISO date string
    onExpire?: () => void;
}

export function CountdownTimer({ expireAt, onExpire }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Date.now();
            const expireTime = new Date(expireAt).getTime();
            const difference = expireTime - now;
            return Math.max(0, difference);
        };

        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining === 0) {
                clearInterval(interval);
                onExpire?.();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expireAt, onExpire]);

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    const isWarning = minutes < 5;
    const isCritical = minutes < 2;

    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-2xl font-bold ${isCritical
                ? 'bg-error/20 text-error animate-pulse'
                : isWarning
                    ? 'bg-warning/20 text-warning'
                    : 'bg-primary-500/20 text-primary-400'
            }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
}
