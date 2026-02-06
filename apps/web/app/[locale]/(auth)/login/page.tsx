'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/lib/api/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

const loginSchema = z.object({
    phoneNumber: z.string().min(4, 'กรุณากรอกเบอร์โทรศัพท์หรือชื่อผู้ใช้งาน'),
    password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
    twoFactorCode: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const loginMutation = useLogin();
    const [showTwoFactor, setShowTwoFactor] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            await loginMutation.mutateAsync(data);
            router.push('/');
        } catch (error: any) {
            console.error('Login failed full error:', error);
            const responseData = error.response?.data;

            if (responseData?.code === '2FA_REQUIRED') {
                setShowTwoFactor(true);
                // Clear previous errors
                setError('root', { message: '' });
            } else {
                console.error('Response data:', responseData);
                console.error('Response status:', error.response?.status);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="glass-card p-8 animate-scale-in">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-heading font-bold text-gradient mb-2">
                            เข้าสู่ระบบ
                        </h1>
                        <p className="text-gray-400">
                            ยินดีต้อนรับกลับมา
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {!showTwoFactor ? (
                            <>
                                <Input
                                    {...register('phoneNumber')}
                                    label="เบอร์โทรศัพท์ หรือ ชื่อผู้ใช้งาน"
                                    type="text"
                                    placeholder="0812345678"
                                    error={errors.phoneNumber?.message}
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    }
                                />

                                <Input
                                    {...register('password')}
                                    label="รหัสผ่าน"
                                    type="password"
                                    placeholder="••••••••"
                                    error={errors.password?.message}
                                    showPasswordToggle
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    }
                                />
                            </>
                        ) : (
                            <div className="animate-fadeIn">
                                <div className="text-center mb-4">
                                    <p className="text-primary-400 font-medium">Two-Factor Authentication Required</p>
                                    <p className="text-sm text-gray-400">Please enter the 6-digit code from your authenticator app.</p>
                                </div>
                                <Input
                                    {...register('twoFactorCode')}
                                    label="2FA Code"
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    className="text-center tracking-widest text-lg"
                                    autoFocus
                                />
                            </div>
                        )}

                        {loginMutation.isError && (
                            <div className="p-3 rounded-lg bg-error/10 border border-error/20">
                                <p className="text-sm text-error">
                                    {(loginMutation.error as any)?.response?.data?.message ||
                                        (loginMutation.error as any)?.message ||
                                        'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง'}
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={loginMutation.isPending}
                        >
                            {showTwoFactor ? 'ยืนยันรหัส 2FA' : 'เข้าสู่ระบบ'}
                        </Button>

                        {showTwoFactor && (
                            <button
                                type="button"
                                onClick={() => setShowTwoFactor(false)}
                                className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                ยกเลิก / กลับไปหน้าเข้าสู่ระบบ
                            </button>
                        )}
                    </form>

                    {/* Divider */}
                    {!showTwoFactor && (
                        <>
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-secondary-800 text-gray-400">หรือ</span>
                                </div>
                            </div>

                            {/* Register Link */}
                            <div className="text-center">
                                <p className="text-gray-400">
                                    ยังไม่มีบัญชี?{' '}
                                    <Link
                                        href="/register"
                                        className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                                    >
                                        สมัครสมาชิก
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-sm text-gray-500">
                    ระบบสลากกินแบ่งรัฐบาลออนไลน์
                </p>
                <p className="text-center mt-2 text-xs text-gray-600 font-mono">
                    Debug API: {process.env.NEXT_PUBLIC_API_URL || 'Not Set'}
                </p>
            </div>
        </div>
    );
}

