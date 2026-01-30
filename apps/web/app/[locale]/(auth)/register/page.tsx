'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '@/lib/api/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
    const router = useRouter();
    const registerMutation = useRegister();
    const t = useTranslations('auth.register');

    const registerSchema = z.object({
        username: z.string().min(3, t('errors.usernameLength')),
        phoneNumber: z.string().min(10, t('errors.phoneLength')),
        password: z.string().min(6, t('errors.passwordLength')),
        confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('errors.passwordMismatch'),
        path: ['confirmPassword'],
    });

    type RegisterForm = z.infer<typeof registerSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            await registerMutation.mutateAsync({
                username: data.username,
                phoneNumber: data.phoneNumber,
                password: data.password,
            });
            router.push('/');
        } catch (error: any) {
            console.error('Registration failed:', error);
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
                            {t('title')}
                        </h1>
                        <p className="text-gray-400">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input
                            {...register('username')}
                            label={t('username')}
                            type="text"
                            placeholder={t('usernamePlaceholder')}
                            error={errors.username?.message}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            }
                        />

                        <Input
                            {...register('phoneNumber')}
                            label={t('phone')}
                            type="tel"
                            placeholder={t('phonePlaceholder')}
                            error={errors.phoneNumber?.message}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            }
                        />

                        <Input
                            {...register('password')}
                            label={t('password')}
                            type="password"
                            placeholder={t('passwordPlaceholder')}
                            error={errors.password?.message}
                            showPasswordToggle
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                        />

                        <Input
                            {...register('confirmPassword')}
                            label={t('confirmPassword')}
                            type="password"
                            placeholder={t('confirmPasswordPlaceholder')}
                            error={errors.confirmPassword?.message}
                            showPasswordToggle
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />

                        {registerMutation.isError && (
                            <div className="p-3 rounded-lg bg-error/10 border border-error/20">
                                <p className="text-sm text-error">
                                    {(registerMutation.error as any)?.response?.status === 409
                                        ? 'เบอร์โทรศัพท์หรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว'
                                        : (registerMutation.error as any)?.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'}
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={registerMutation.isPending}
                        >
                            {t('submit')}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-secondary-800 text-gray-400">{t('or')}</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-gray-400">
                            {t('haveAccount')}{' '}
                            <Link
                                href="/login"
                                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                            >
                                {t('login')}
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-sm text-gray-500">
                    {t('footer')}
                </p>
            </div>
        </div>
    );
}
