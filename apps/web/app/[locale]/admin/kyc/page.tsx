'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface KYCSubmission {
    id: number;
    username: string;
    phoneNumber: string;
    kycStatus: string;
    createdAt: string;
}

export default function AdminKYCPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<number | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchSubmissions();
    }, [isAuthenticated, router]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/kyc/pending');
            setSubmissions(response.data);
        } catch (err) {
            console.error('Failed to fetch KYC submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: number) => {
        if (!confirm('ยืนยันการอนุมัติ KYC?')) return;

        try {
            setProcessing(userId);
            await api.put(`/kyc/${userId}/approve`);
            alert('อนุมัติสำเร็จ!');
            fetchSubmissions();
        } catch (error: any) {
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาด');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (userId: number) => {
        const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
        if (!reason) return;

        try {
            setProcessing(userId);
            await api.put(`/kyc/${userId}/reject`, { reason });
            alert('ปฏิเสธสำเร็จ!');
            fetchSubmissions();
        } catch (error: any) {
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาด');
        } finally {
            setProcessing(null);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gradient mb-2">
                        📋 ตรวจสอบ KYC
                    </h1>
                    <p className="text-gray-400">
                        ตรวจสอบและอนุมัติการยืนยันตัวตนของผู้ใช้
                    </p>
                </div>

                {/* Submissions List */}
                {submissions.length === 0 ? (
                    <div className="glass-card p-12 text-center text-gray-400">
                        <p className="text-xl">ไม่มีคำขอที่รอการตรวจสอบ</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {submissions.map((submission) => (
                            <div key={submission.id} className="glass-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {submission.username}
                                        </h3>
                                        <p className="text-sm text-gray-400 mb-1">
                                            <strong>เบอร์โทร:</strong> {submission.phoneNumber}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            <strong>ส่งคำขอเมื่อ:</strong>{' '}
                                            {new Date(submission.createdAt).toLocaleString('th-TH')}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleApprove(submission.id)}
                                            disabled={processing === submission.id}
                                            className="bg-success hover:bg-success/80"
                                        >
                                            ✅ อนุมัติ
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleReject(submission.id)}
                                            disabled={processing === submission.id}
                                            className="bg-error hover:bg-error/80"
                                        >
                                            ❌ ปฏิเสธ
                                        </Button>
                                    </div>
                                </div>

                                {/* TODO: Display uploaded images */}
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-sm text-gray-500">
                                        💡 ในระบบจริง จะแสดงรูปบัตรประชาชนและรูปถ่ายที่ผู้ใช้อัปโหลดไว้ตรงนี้
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
