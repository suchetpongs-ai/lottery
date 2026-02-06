'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth';

export function TwoFactorSetup() {
    const { user, setUser } = useAuthStore();
    const [step, setStep] = useState<'initial' | 'setup' | 'verify'>('initial');
    const [secret, setSecret] = useState<string>('');
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const startSetup = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await authApi.setupTwoFactor();
            setSecret(data.secret);
            setQrCodeUrl(data.qrCodeUrl);
            setStep('setup');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to start setup');
        } finally {
            setLoading(false);
        }
    };

    const enable2FA = async () => {
        setLoading(true);
        setError('');
        try {
            await authApi.enableTwoFactor(code);
            if (user) {
                setUser({ ...user, twoFactorEnabled: true });
            }
            setStep('initial');
            setCode('');
            alert('Two-Factor Authentication Enabled!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const disable2FA = async () => {
        if (!confirm('Are you sure you want to disable 2FA?')) return;
        setLoading(true);
        try {
            await authApi.disableTwoFactor();
            if (user) {
                setUser({ ...user, twoFactorEnabled: false });
            }
            alert('Two-Factor Authentication Disabled');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="glass-card p-6 mt-6">
            <h3 className="text-xl font-bold text-white mb-4">Two-Factor Authentication (2FA)</h3>

            {user.twoFactorEnabled ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-green-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Enabled</span>
                    </div>
                    <button
                        onClick={disable2FA}
                        disabled={loading}
                        className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                        Disable
                    </button>
                </div>
            ) : (
                <div>
                    {step === 'initial' && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Not enabled</span>
                            <button
                                onClick={startSetup}
                                disabled={loading}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                Enable 2FA
                            </button>
                        </div>
                    )}

                    {step === 'setup' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="p-4 bg-white rounded-lg inline-block">
                                <QRCodeSVG value={qrCodeUrl} size={128} />
                            </div>
                            <p className="text-sm text-gray-300">
                                Scan this QR Code with your Authenticator App (Google Authenticator, Authy, etc.)
                            </p>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Enter Code</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            <div className="flex gap-3">
                                <button
                                    onClick={enable2FA}
                                    disabled={loading || code.length !== 6}
                                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                                >
                                    Verify & Enable
                                </button>
                                <button
                                    onClick={() => setStep('initial')}
                                    className="px-4 py-2 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500/20"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
