'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const [searchNumber, setSearchNumber] = useState('');

  const featuredNumbers = ['123456', '789012', '345678', '901234', '567890', '234567'];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Main Heading */}
          <div className="mb-8 animate-slide-down">
            <h1 className="text-6xl md:text-8xl font-heading font-black mb-4">
              <span className="text-gradient">สลากดิจิทัล</span>
            </h1>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
              ซื้อง่าย ถูกรางวัล รับเงินไว
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              แพลตฟอร์มซื้อสลากกินแบ่งรัฐบาลออนไลน์ ปลอดภัย รวดเร็ว ตรวจรางวัลอัตโนมัติ
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-12 animate-slide-up">
            <div className="glass-card p-3 max-w-2xl mx-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="ค้นหาเลขสลาก เช่น 123456"
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                  maxLength={6}
                />
                <Link href={`/browse?number=${searchNumber}`}>
                  <Button variant="primary" size="lg" className="px-8">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    ค้นหา
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link href="/browse">
              <Button variant="primary" size="lg" className="px-8 py-4 text-lg">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                เลือกซื้อสลาก
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                สมัครสมาชิก
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Numbers Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-heading font-bold text-gradient mb-4">
              เลขเด็ดวันนี้
            </h3>
            <p className="text-gray-400 text-lg">
              เลขสลากยอดนิยมที่ถูกเลือกซื้อมากที่สุด
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNumbers.map((number, index) => (
              <div
                key={number}
                className="glass-card p-6 hover:shadow-glow transition-all duration-300 cursor-pointer group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">เลขสลาก</span>
                  <span className="px-3 py-1 bg-success/20 text-success text-xs rounded-full">
                    ว่าง
                  </span>
                </div>
                <div className="ticket-number mb-4 group-hover:scale-110 transition-transform">
                  {number}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">ราคา</span>
                  <span className="text-2xl font-bold text-primary-400">฿ 80</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/browse">
              <Button variant="outline" size="lg">
                ดูทั้งหมด
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-secondary-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center glass-card p-8">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-heading font-bold text-white mb-2">ปลอดภัย 100%</h4>
              <p className="text-gray-400">ระบบรักษาความปลอดภัยระดับสูง</p>
            </div>

            <div className="text-center glass-card p-8">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-heading font-bold text-white mb-2">รวดเร็ว</h4>
              <p className="text-gray-400">ซื้อสลากได้ในไม่กี่วินาที</p>
            </div>

            <div className="text-center glass-card p-8">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-heading font-bold text-white mb-2">ตรวจรางวัลอัตโนมัติ</h4>
              <p className="text-gray-400">แจ้งผลรางวัลทันทีที่ออก</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
