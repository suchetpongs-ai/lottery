import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

export function SystemSettings() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [settings, setSettings] = useState<Record<string, string>>({
        maintenance_mode: 'false',
        announcement_text: '',
        contact_phone: '',
        contact_line: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/admin/settings');
            if (data) {
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            await api.put('/admin/settings', settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to update settings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-8">
            <h2 className="text-2xl font-heading font-bold text-white mb-6">
                ตั้งค่าระบบ
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                        <h3 className="text-white font-medium">ปิดปรับปรุงระบบ</h3>
                        <p className="text-sm text-gray-400">เมื่อเปิดใช้งาน ผู้ใช้ทั่วไปจะไม่สามารถเข้าใช้งานเว็บไซต์ได้</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.maintenance_mode === 'true'}
                            onChange={(e) => handleChange('maintenance_mode', e.target.checked ? 'true' : 'false')}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                </div>

                {/* Announcement */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        ประกาศหน้าเว็บไซต์
                    </label>
                    <textarea
                        value={settings.announcement_text}
                        onChange={(e) => handleChange('announcement_text', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                        placeholder="ใส่ข้อความประกาศที่นี่..."
                    />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="เบอร์โทรศัพท์ติดต่อ"
                        value={settings.contact_phone}
                        onChange={(e) => handleChange('contact_phone', e.target.value)}
                        placeholder="08xxxxxxxx"
                    />
                    <Input
                        label="LINE OA"
                        value={settings.contact_line}
                        onChange={(e) => handleChange('contact_line', e.target.value)}
                        placeholder="@hauythai"
                    />
                </div>

                {/* Success Message */}
                {success && (
                    <div className="p-4 bg-success/20 border border-success/50 rounded-lg text-success animate-fadeIn">
                        ✓ บันทึกการตั้งค่าเรียบร้อยแล้ว
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={loading}
                >
                    บันทึกการตั้งค่า
                </Button>
            </form>
        </div>
    );
}
