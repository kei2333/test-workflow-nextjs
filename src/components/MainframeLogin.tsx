'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useMainframe } from '@/hooks/useMainframe';

export interface MainframeLoginProps {
  onConnectionStatusChange?: (connected: boolean) => void;
  className?: string;
}

export const MainframeLogin: React.FC<MainframeLoginProps> = ({
  onConnectionStatusChange,
  className = '',
}) => {
  // Mainframe state management
  const {
    state,
    connect,
    login,
    sendCommand,
    refreshScreen,
    disconnect,
    clearError,
    checkServiceAvailability,
  } = useMainframe();

  // Local state
  const [systemType, setSystemType] = useState<'pub400' | 'tk5' | 'custom'>('custom');
  const [connectionForm, setConnectionForm] = useState({
    host: '',
    port: 23,
  });

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  const [loginType, setLoginType] = useState<'standard' | 'tso'>('standard');

  // Update connection details when system type changes
  useEffect(() => {
    if (systemType === 'tk5') {
      setConnectionForm({ host: 'localhost', port: 3270 });
      setLoginForm({ username: 'HERC01', password: 'CUL8TR' });
    } else if (systemType === 'custom') {
      setConnectionForm({ host: '', port: 23 });
      setLoginForm({ username: '', password: '' });
    } else {
      setConnectionForm({ host: 'pub400.com', port: 23 });
      setLoginForm({ username: 'pub400', password: 'pub400' });
    }
    // Save to localStorage for function executor
    localStorage.setItem('mainframe-system-type', systemType);
  }, [systemType]);

  const [commandInput, setCommandInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null);

  // Check backend service status
  useEffect(() => {
    checkServiceAvailability().then(setServiceAvailable);
  }, [checkServiceAvailability]);

  // Notify parent component of connection status changes
  useEffect(() => {
    onConnectionStatusChange?.(state.isConnected);
  }, [state.isConnected, onConnectionStatusChange]);

  // Handle connection
  const handleConnect = useCallback(async () => {
    if (!connectionForm.host.trim()) {
      return;
    }

    await connect({
      host: connectionForm.host.trim(),
      port: connectionForm.port,
    });
  }, [connect, connectionForm]);

  // Handle login
  const handleLogin = useCallback(async () => {
    if (!state.sessionId || !loginForm.username.trim() || !loginForm.password.trim()) {
      return;
    }

    const result = await login({
      session_id: state.sessionId,
      username: loginForm.username.trim(),
      password: loginForm.password.trim(),
      login_type: loginType,
    });

    if (result.success) {
      setLoginForm(prev => ({ ...prev, password: '' })); // Clear password
    }
  }, [login, state.sessionId, loginForm, loginType]);

  // Handle command sending
  const handleSendCommand = useCallback(async () => {
    if (!commandInput.trim()) {
      return;
    }

    await sendCommand(commandInput.trim());
    setCommandInput('');
  }, [sendCommand, commandInput]);

  // Handle disconnect
  const handleDisconnect = useCallback(async () => {
    await disconnect();
    // Reset to current system type defaults
    if (systemType === 'tk5') {
      setLoginForm({ username: 'HERC01', password: 'CUL8TR' });
    } else if (systemType === 'custom') {
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginForm({ username: 'pub400', password: 'pub400' });
    }
    setCommandInput('');
  }, [disconnect, systemType]);

  // Keyboard event handling
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  // If backend service is not available
  if (serviceAvailable === false) {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        <div className="bg-red-50/95 backdrop-blur-xl rounded-2xl shadow-xl border border-red-200/60 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800">Backend Service Unavailable</h3>
          </div>
          <p className="text-red-700 mb-4">
            The IBM Mainframe API service with s3270 is not running. Please ensure the Python backend server is started.
          </p>
          <div className="bg-red-100/80 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800 mb-2">To start the backend service:</p>
            <code className="text-sm text-red-900 block bg-white/70 rounded px-3 py-2">
              cd backend && python3 app.py
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Error display */}
      {state.error && (
        <div className="bg-red-50/95 backdrop-blur-xl rounded-2xl shadow-xl border border-red-200/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">{state.error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 p-1"
              aria-label="Clear error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main panel */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 overflow-hidden">
        {/* Header status bar */}
        <div className="bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">IBM Mainframe Terminal (s3270)</h2>
                <p className="text-white/80 text-sm">
                  {state.isConnected
                    ? `Connected to ${state.host}:${state.port}${state.username ? ` as ${state.username}` : ''}`
                    : 'Not connected'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                state.isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`} />
              <span className="text-sm font-medium">
                {state.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Connection configuration */}
          {!state.isConnected && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Connection Settings</h3>

              {/* System Type Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mainframe System
                </label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="custom"
                      checked={systemType === 'custom'}
                      onChange={(e) => setSystemType(e.target.value as 'pub400' | 'tk5' | 'custom')}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      <strong>Custom Mainframe</strong> - Enter connection details manually
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="pub400"
                      checked={systemType === 'pub400'}
                      onChange={(e) => setSystemType(e.target.value as 'pub400' | 'tk5' | 'custom')}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      <strong>pub400.com</strong> - Public IBM i AS/400 System
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="tk5"
                      checked={systemType === 'tk5'}
                      onChange={(e) => setSystemType(e.target.value as 'pub400' | 'tk5' | 'custom')}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      <strong>Local TK5</strong> - MVS 3.8j System (localhost:3270)
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mainframe Host
                  </label>
                  <input
                    type="text"
                    value={connectionForm.host}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, host: e.target.value }))}
                    onKeyDown={(e) => handleKeyDown(e, handleConnect)}
                    placeholder="localhost"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                    disabled={state.isConnecting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    value={connectionForm.port}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, port: parseInt(e.target.value) || 3270 }))}
                    onKeyDown={(e) => handleKeyDown(e, handleConnect)}
                    placeholder="3270"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                    disabled={state.isConnecting}
                  />
                </div>
              </div>

              <button
                onClick={handleConnect}
                disabled={state.isConnecting || !connectionForm.host.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-600 hover:from-blue-600 hover:via-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {state.isConnecting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </div>
                ) : (
                  'Connect to Mainframe'
                )}
              </button>
            </div>
          )}

          {/* Login form */}
          {state.isConnected && !state.isLoggedIn && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">User Authentication</h3>

              {/* Login Type Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login Flow Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="standard"
                      checked={loginType === 'standard'}
                      onChange={(e) => setLoginType(e.target.value as 'standard' | 'tso')}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      <strong>Standard</strong> - Direct username/password login
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="tso"
                      checked={loginType === 'tso'}
                      onChange={(e) => setLoginType(e.target.value as 'standard' | 'tso')}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      <strong>TSO</strong> - IBM TSO login sequence
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                    disabled={state.isLoggingIn}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                      disabled={state.isLoggingIn}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={state.isLoggingIn || !loginForm.username.trim() || !loginForm.password.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-600 hover:from-blue-600 hover:via-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {state.isLoggingIn ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </div>
                ) : (
                  'Login to Mainframe'
                )}
              </button>
            </div>
          )}

          {/* Logged in state - screen content and command interface */}
          {state.isConnected && state.isLoggedIn && (
            <div className="space-y-4">
              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Terminal Session</h3>
                <div className="flex gap-2">
                  <button
                    onClick={refreshScreen}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Screen content display */}
              <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-xl min-h-96 overflow-auto whitespace-pre-wrap">
                {state.screenContent || 'No screen content available. Try sending a command.'}
              </div>

              {/* Command input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleSendCommand)}
                  placeholder="Enter mainframe command (e.g., ISPF, LOGOFF)"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors font-mono"
                />
                <button
                  onClick={handleSendCommand}
                  disabled={!commandInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-600 hover:from-blue-600 hover:via-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>

              {/* Last activity time */}
              {state.lastActivity && (
                <p className="text-sm text-gray-500 text-center">
                  Last activity: {new Date(state.lastActivity).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainframeLogin;