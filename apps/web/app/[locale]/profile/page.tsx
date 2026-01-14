'use client';

import { useUser } from '@/lib/api/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { data: user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-gradient mb-2">
                        ข้อมูลส่วนตัว
                    </h1>
                    <p className="text-gray-400">
                        จัดการข้อมูลบัญชีผู้ใช้ของคุณ
                    </p>
                </div>

                {/* Profile Card */}
                <div className="glass-card p-8 animate-scale-in">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar Section */}
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-primary-500/20">
                                {user.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex-grow w-full space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        ชื่อผู้ใช้งาน
                                    </label>
                                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-medium">
                                        {user.username}
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        เบอร์โทรศัพท์
                                    </label>
                                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-medium">
                                        {user.phoneNumber}
                                    </div>
                                </div>

                                {/* KYC Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        สถานะยืนยันตัวตน (KYC)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-medium flex-grow flex items-center gap-2 ${user.kycStatus === 'Verified' ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                                                user.kycStatus === 'Pending' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                                                    'text-gray-400'
                                            }`}>
                                            {user.kycStatus === 'Verified' ? (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    ยืนยันแล้ว
                                                </>
                                            ) : user.kycStatus === 'Pending' ? (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    รอตรวจสอบ
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    ยังไม่ยืนยัน
                                                </>
                                            )}
                                        </div>
                                        {user.kycStatus !== 'Verified' && user.kycStatus !== 'Pending' && (
                                            <button
                                                onClick={() => router.push('/kyc')}
                                                className="px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors whitespace-nowrap"
                                            >
                                                ยืนยันตัวตน
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4">
                                <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    แก้ไขข้อมูล
                                </button>
                                <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    เปลี่ยนรหัสผ่าน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Sections (e.g. Activity Log) */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => router.push('/orders')}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">ประวัติการซื้อ</h3>
                                <p className="text-sm text-gray-400">ดูรายการสั่งซื้อย้อนหลังของคุณ</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => router.push('/my-prizes')}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">รางวัลของฉัน</h3>
                                <p className="text-sm text-gray-400">ตรวจสอบประวัติการถูกรางวัล</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
