'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export function UploadTicketsForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [roundId, setRoundId] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError('กรุณาเลือกไฟล์');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Read CSV file
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());

            // Parse CSV (assuming format: ticketNumber,price)
            const tickets = lines.slice(1).map(line => { // Skip header
                const [ticketNumber, priceStr] = line.split(',');
                return {
                    ticketNumber: ticketNumber?.trim() || '',
                    price: parseFloat(priceStr?.trim() || '0'),
                };
            }).filter(ticket => ticket.ticketNumber && !isNaN(ticket.price));

            // Upload to API
            await api.post('/admin/tickets', {
                roundId: parseInt(roundId),
                tickets,
            });

            setSuccess(true);
            setFile(null);
            setRoundId('');

            // Reset file input
            const fileInput = document.getElementById('ticket-file') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload tickets');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-8">
            <h2 className="text-2xl font-heading font-bold text-white mb-6">
                อัพโหลดสลาก
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Round ID */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        เลขที่งวด (Round ID)
                    </label>
                    <input
                        type="number"
                        required
                        value={roundId}
                        onChange={(e) => setRoundId(e.target.value)}
                        placeholder="1"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        ไฟล์ CSV
                    </label>
                    <div className="relative">
                        <input
                            id="ticket-file"
                            type="file"
                            accept=".csv"
                            required
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:cursor-pointer hover:file:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        รูปแบบ CSV: ticketNumber,price (หนึ่งบรรทัดต่อหนึ่งสลาก)
                    </p>
                    {file && (
                        <p className="text-sm text-gray-400 mt-2">
                            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </p>
                    )}
                </div>

                {/* CSV Format Example */}
                <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-xs font-mono text-gray-400 mb-1">ตัวอย่างรูปแบบไฟล์:</p>
                    <pre className="text-xs font-mono text-gray-300">
                        {`ticketNumber,price
123456,80
234567,80
345678,80`}
                    </pre>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="p-4 bg-success/20 border border-success/50 rounded-lg text-success">
                        ✓ อัพโหลดสลากสำเร็จ!
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-error/20 border border-error/50 rounded-lg text-error">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? 'กำลังอัพโหลด...' : 'อัพโหลดสลาก'}
                </Button>
            </form>
        </div>
    );
}
