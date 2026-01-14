'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function KYCPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [uploading, setUploading] = useState(false);
    const [idCardImage, setIdCardImage] = useState<File | null>(null);
    const [selfieImage, setSelfieImage] = useState<File | null>(null);
    const [address, setAddress] = useState('');
    const [idCardPreview, setIdCardPreview] = useState<string>('');
    const [selfiePreview, setSelfiePreview] = useState<string>('');

    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIdCardImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdCardPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelfieImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelfiePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!idCardImage) {
            alert('กรุณาอัปโหลดรูปบัตรประชาชน');
            return;
        }

        setUploading(true);

        try {
            const formData = {
                idCardImage: idCardPreview, // In production, upload to S3 first
                selfieImage: selfiePreview,
                address: address,
            };

            await api.post('/kyc/upload', formData);

            alert('ส่งเอกสาร KYC สำเร็จ! รอการตรวจสอบจากเจ้าหน้าที่');
            router.push('/profile');
        } catch (error: any) {
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งเอกสาร');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gradient mb-2">
                        📋 ยืนยันตัวตน (KYC)
                    </h1>
                    <p className="text-gray-400">
                        อัปโหลดเอกสารเพื่อยืนยันตัวตนและรับสิทธิ์ขอรับเงินรางวัล
                    </p>
                </div>

                {/* Status Info */}
                {user?.kycStatus && (
                    <div className={`glass-card p-6 mb-6 border-l-4 ${user.kycStatus === 'Verified' ? 'border-success' :
                            user.kycStatus === 'Pending' ? 'border-warning' :
                                'border-error'
                        }`}>
                        <p className="text-white font-semibold mb-1">
                            สถานะการยืนยันตัวตน
                        </p>
                        <p className={`text-sm ${user.kycStatus === 'Verified' ? 'text-success' :
                                user.kycStatus === 'Pending' ? 'text-warning' :
                                    'text-error'
                            }`}>
                            {user.kycStatus === 'Verified' && '✅ ยืนยันตัวตนแล้ว'}
                            {user.kycStatus === 'Pending' && '⏳ รอการตรวจสอบ'}
                            {user.kycStatus === 'Rejected' && '❌ ถูกปฏิเสธ - กรุณาส่งเอกสารใหม่อีกครั้ง'}
                            {user.kycStatus === 'Unverified' && '⚠️ ยังไม่ได้ยืนยันตัวตน'}
                        </p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
                    {/* ID Card Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            รูปบัตรประชาชน *
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleIdCardChange}
                            className="hidden"
                            id="id-card-upload"
                            required
                        />
                        <label
                            htmlFor="id-card-upload"
                            className="block w-full px-4 py-8 bg-white/10 border-2 border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:bg-white/15 transition-colors"
                        >
                            {idCardPreview ? (
                                <img
                                    src={idCardPreview}
                                    alt="ID Card Preview"
                                    className="max-h-48 mx-auto rounded"
                                />
                            ) : (
                                <div>
                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-gray-400">คลิกเพื่ออัปโหลดรูปบัตรประชาชน</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (สูงสุด 5MB)</p>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Selfie Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            รูปถ่ายพร้อมถือบัตรประชาชน (ถ้ามี)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleSelfieChange}
                            className="hidden"
                            id="selfie-upload"
                        />
                        <label
                            htmlFor="selfie-upload"
                            className="block w-full px-4 py-8 bg-white/10 border-2 border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:bg-white/15 transition-colors"
                        >
                            {selfiePreview ? (
                                <img
                                    src={selfiePreview}
                                    alt="Selfie Preview"
                                    className="max-h-48 mx-auto rounded"
                                />
                            ) : (
                                <div>
                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-gray-400">คลิกเพื่ออัปโหลดรูปถ่ายพร้อมถือบัตร</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (สูงสุด 5MB)</p>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            ที่อยู่ตามบัตรประชาชน
                        </label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            rows={3}
                            placeholder="เลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="glass-card p-4 bg-primary-500/10 border-l-4 border-primary-500">
                        <div className="flex gap-3">
                            <svg className="w-6 h-6 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-gray-300">
                                <p className="font-semibold mb-1">เหตุผลที่ต้องยืนยันตัวตน:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>เพื่อขอรับเงินรางวัลที่ถูกรางวัล</li>
                                    <li>เพื่อความปลอดภัยและป้องกันการฉ้อโกง</li>
                                    <li>เป็นไปตามกฎหมายและข้อบังคับ</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="flex-1"
                            onClick={() => router.back()}
                            disabled={uploading}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="flex-1"
                            isLoading={uploading}
                            disabled={user?.kycStatus === 'Verified' || user?.kycStatus === 'Pending'}
                        >
                            {uploading ? 'กำลังส่ง...' : 'ส่งเอกสาร'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
