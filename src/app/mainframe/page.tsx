'use client';

import React, { useState } from 'react';
import MainframeLogin from '@/components/MainframeLogin';

/**
 * IBM Mainframe Connection Page with s3270
 * Provides s3270-based Mainframe terminal access interface
 */
export default function MainframePage() {
  const [connectionStatus, setConnectionStatus] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Page header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-white/60 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and title */}
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
                  <p className="text-sm text-gray-500">s3270 Terminal Emulator</p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-600">
                    {connectionStatus ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {/* Back to home button */}
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

        {/* Main content area */}
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page description */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                Connect to IBM Mainframe with s3270
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Access your IBM mainframe systems through s3270 terminal emulation.
                Connect, authenticate, and interact with 3270 terminal sessions using real s3270 integration.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/60 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">s3270 Integration</h3>
                <p className="text-gray-600">Native s3270 terminal emulator integration for authentic IBM mainframe connectivity.</p>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/60 shadow-lg">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">User Authentication</h3>
                <p className="text-gray-600">Secure login functionality with real mainframe credential validation.</p>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/60 shadow-lg">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Terminal Commands</h3>
                <p className="text-gray-600">Full command execution with real-time screen updates and response handling.</p>
              </div>
            </div>

            {/* Mainframe login component */}
            <MainframeLogin
              onConnectionStatusChange={setConnectionStatus}
              className="mb-8"
            />

            {/* Usage instructions */}
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
                    <li>Configure the connection port (default: 3270)</li>
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
                    <li>View real-time screen content from s3270</li>
                    <li>Send commands via the input field</li>
                    <li>Use standard mainframe commands (ISPF, LOGOFF, etc.)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">4. Session Management</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Refresh screen content as needed</li>
                    <li>Monitor connection status in real-time</li>
                    <li>Disconnect when finished</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Test Mode</h4>
                <p className="text-sm text-blue-700">
                  Use <code className="bg-blue-100 px-1 rounded">localhost:3270</code> for local testing without connecting to a real mainframe.
                  This mode allows you to test the s3270 integration and UI functionality.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/50 backdrop-blur-lg border-t border-white/60 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-500 text-sm">
              <p>IBM Mainframe Terminal Emulator - Built with Next.js, Python, and s3270</p>
              <p className="mt-1">Secure • Reliable • Native s3270 Integration</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}