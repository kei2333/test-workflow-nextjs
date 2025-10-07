/**
 * React hook for managing IBM mainframe connections via s3270
 */

import { useState, useCallback } from 'react';
import { mainframeApi } from '@/services/mainframeApi';
import type { MainframeState, ConnectionConfig, LoginCredentials } from '@/types/mainframe';

const initialState: MainframeState = {
  isConnected: false,
  isConnecting: false,
  sessionId: null,
  host: null,
  port: null,
  isLoggedIn: false,
  isLoggingIn: false,
  username: null,
  loginType: null,
  screenContent: '',
  lastActivity: null,
  error: null,
  serviceAvailable: null,
};

export function useMainframe() {
  const [state, setState] = useState<MainframeState>(initialState);

  // Check service availability
  const checkServiceAvailability = useCallback(async () => {
    try {
      const result = await mainframeApi.checkHealth();
      setState(prev => ({ ...prev, serviceAvailable: result.success && result.s3270_available }));
      return result.success && result.s3270_available;
    } catch (error) {
      setState(prev => ({ ...prev, serviceAvailable: false }));
      return false;
    }
  }, []);

  // Connect to mainframe
  const connect = useCallback(async (config: ConnectionConfig) => {
    setState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
      host: config.host,
      port: config.port
    }));

    try {
      const result = await mainframeApi.connect(config);

      if (result.success && result.session_id) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          sessionId: result.session_id!,
          host: result.host,
          port: result.port,
          lastActivity: new Date().toISOString(),
        }));
        return result;
      } else {
        setState(prev => ({
          ...prev,
          isConnecting: false,
          error: result.message,
        }));
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage, host: config.host, port: config.port };
    }
  }, []);

  // Login to mainframe
  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoggingIn: true, error: null }));

    try {
      const result = await mainframeApi.login(credentials);

      if (result.success) {
        setState(prev => ({
          ...prev,
          isLoggedIn: true,
          isLoggingIn: false,
          username: credentials.username,
          loginType: credentials.login_type || 'standard',
          screenContent: result.screen_content || '',
          lastActivity: new Date().toISOString(),
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoggingIn: false,
          error: result.message,
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        isLoggingIn: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage };
    }
  }, []);

  // Send command to mainframe
  const sendCommand = useCallback(async (command: string) => {
    if (!state.sessionId) {
      return { success: false, message: 'No active session' };
    }

    try {
      const result = await mainframeApi.sendCommand({
        session_id: state.sessionId,
        command,
      });

      if (result.success) {
        setState(prev => ({
          ...prev,
          screenContent: result.screen_content || prev.screenContent,
          lastActivity: new Date().toISOString(),
        }));
      } else {
        setState(prev => ({ ...prev, error: result.message }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Command failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, message: errorMessage };
    }
  }, [state.sessionId]);

  // Refresh screen content
  const refreshScreen = useCallback(async () => {
    if (!state.sessionId) {
      return;
    }

    try {
      const result = await mainframeApi.getScreen(state.sessionId);

      if (result.success) {
        setState(prev => ({
          ...prev,
          screenContent: result.screen_content,
          isConnected: result.connected,
          isLoggedIn: result.logged_in,
          lastActivity: new Date().toISOString(),
        }));
      }
    } catch (error) {
      // Silent fail for refresh - don't set error state
      console.warn('Screen refresh failed:', error);
    }
  }, [state.sessionId]);

  // Disconnect from mainframe
  const disconnect = useCallback(async () => {
    if (!state.sessionId) {
      return { success: true, message: 'Already disconnected' };
    }

    try {
      // For TSO login type, perform proper logout first
      if (state.loginType === 'tso' && state.isLoggedIn) {
        try {
          const logoutResult = await mainframeApi.logout(state.sessionId);
          console.log('Logout result:', logoutResult);

          // Update screen content with logout result
          if (logoutResult.success && logoutResult.screen_content) {
            setState(prev => ({
              ...prev,
              screenContent: logoutResult.screen_content || prev.screenContent,
              lastActivity: new Date().toISOString(),
            }));

            // Wait a bit to let user see the logout screen
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (logoutError) {
          console.warn('Logout failed, continuing with disconnect:', logoutError);
        }
      }

      // Then disconnect the session
      const result = await mainframeApi.disconnect(state.sessionId);

      // Reset state regardless of API result
      setState(initialState);

      return result;
    } catch (error) {
      // Reset state even if disconnect fails
      setState(initialState);
      const errorMessage = error instanceof Error ? error.message : 'Disconnect failed';
      return { success: false, message: errorMessage };
    }
  }, [state.sessionId, state.loginType, state.isLoggedIn]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    state,
    connect,
    login,
    sendCommand,
    refreshScreen,
    disconnect,
    clearError,
    checkServiceAvailability,
  };
}