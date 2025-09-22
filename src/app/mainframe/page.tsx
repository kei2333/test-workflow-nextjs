/**
 * IBM Mainframe 连接页面
 * 提供独立的 Mainframe 终端访问界面
 */

'use client';

import React, { useState } from 'react';
import { MainframeLogin } from '@/components/MainframeLogin';

export default function MainframePage() {
  const [connectionStatus, setConnectionStatus] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">
        {/* 页面头部 */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-white/60 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo 和标题 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    IBM Mainframe Terminal
                  </h1>
                  <p className="text-sm text-gray-500">3270 Terminal Emulator</p>
                </div>
              </div>

              {/* 状态指示器 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-600">
                    {connectionStatus ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                {/* 返回主页按钮 */}
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Workflow
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* 主要内容区域 */}
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 页面描述 */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                Connect to IBM Mainframe
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Access your IBM mainframe systems through a modern web interface. 
                Connect, authenticate, and interact with 3270 terminal sessions seamlessly.
              </p>
            </div>

            {/* 功能特性卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/60 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Connection</h3>
                <p className="text-gray-600">Establish secure connections to IBM mainframe systems using industry-standard protocols.</p>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/60 shadow-lg">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">User Authentication</h3>
                <p className="text-gray-600">Authenticate with your mainframe credentials and maintain secure session management.</p>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/60 shadow-lg">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Terminal Emulation</h3>
                <p className="text-gray-600">Full 3270 terminal emulation with real-time screen updates and command execution.</p>
              </div>
            </div>

            {/* Mainframe 登录组件 */}
            <MainframeLogin 
              onConnectionStatusChange={setConnectionStatus}
              className="mb-8"
            />

            {/* 使用说明 */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/60 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Quick Start Guide
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">1. Connection Setup</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Enter your mainframe host address</li>
                    <li>Configure the connection port (default: 23)</li>
                    <li>Click "Connect to Mainframe"</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">2. User Authentication</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Enter your mainframe username</li>
                    <li>Provide your password securely</li>
                    <li>Click "Login to Mainframe"</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">3. Terminal Interaction</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>View real-time screen content</li>
                    <li>Send commands via the input field</li>
                    <li>Use standard mainframe commands (ISPF, LOGOFF, etc.)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">4. Session Management</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Refresh screen content as needed</li>
                    <li>Sessions auto-refresh every 30 seconds</li>
                    <li>Disconnect when finished</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 页脚 */}
        <footer className="bg-white/50 backdrop-blur-lg border-t border-white/60 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-500 text-sm">
              <p>IBM Mainframe Terminal Emulator - Built with Next.js and Python</p>
              <p className="mt-1">Secure • Reliable • Modern</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}