/**
 * IBM Mainframe 连接管理 Hook
 * 提供连接、登录、命令发送等功能的状态管理
 */

import { useReducer, useCallback, useEffect } from 'react';
import { 
  MainframeState, 
  MainframeAction, 
  MainframeActionType,
  ConnectionRequest,
  LoginRequest,
  CommandRequest
} from '@/types/mainframe';
import { mainframeApi } from '@/services/mainframeApi';

// 初始状态
const initialState: MainframeState = {
  isConnected: false,
  isConnecting: false,
  isLoggingIn: false,
  sessionId: null,
  host: '',
  port: 23,
  username: '',
  screenContent: '',
  error: null,
  lastActivity: null,
};

// Reducer 函数
function mainframeReducer(state: MainframeState, action: MainframeAction): MainframeState {
  switch (action.type) {
    case MainframeActionType.SET_CONNECTING:
      return {
        ...state,
        isConnecting: true,
        error: null,
      };

    case MainframeActionType.SET_CONNECTED:
      return {
        ...state,
        isConnecting: false,
        isConnected: true,
        sessionId: action.payload.sessionId,
        host: action.payload.host,
        port: action.payload.port,
        error: null,
      };

    case MainframeActionType.SET_LOGGING_IN:
      return {
        ...state,
        isLoggingIn: true,
        error: null,
      };

    case MainframeActionType.SET_LOGIN_SUCCESS:
      return {
        ...state,
        isLoggingIn: false,
        username: action.payload.username,
        screenContent: action.payload.screenContent || state.screenContent,
        lastActivity: new Date().toISOString(),
        error: null,
      };

    case MainframeActionType.SET_SCREEN_CONTENT:
      return {
        ...state,
        screenContent: action.payload.screenContent,
        lastActivity: new Date().toISOString(),
        error: null,
      };

    case MainframeActionType.SET_ERROR:
      return {
        ...state,
        isConnecting: false,
        isLoggingIn: false,
        error: action.payload.error,
      };

    case MainframeActionType.SET_DISCONNECTED:
      return {
        ...initialState,
        error: action.payload?.error || null,
      };

    case MainframeActionType.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

export function useMainframe() {
  const [state, dispatch] = useReducer(mainframeReducer, initialState);

  // 连接到 Mainframe
  const connect = useCallback(async (connectionRequest: ConnectionRequest) => {
    try {
      dispatch({ type: MainframeActionType.SET_CONNECTING });

      const response = await mainframeApi.connect(connectionRequest);
      
      if (response.success && response.sessionId) {
        dispatch({
          type: MainframeActionType.SET_CONNECTED,
          payload: {
            sessionId: response.sessionId,
            host: connectionRequest.host,
            port: connectionRequest.port || 23,
          },
        });
        return { success: true, sessionId: response.sessionId };
      } else {
        throw new Error(response.message || 'Connection failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      dispatch({
        type: MainframeActionType.SET_ERROR,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // 登录
  const login = useCallback(async (loginRequest: LoginRequest) => {
    try {
      dispatch({ type: MainframeActionType.SET_LOGGING_IN });

      const response = await mainframeApi.login(loginRequest);
      
      if (response.success) {
        dispatch({
          type: MainframeActionType.SET_LOGIN_SUCCESS,
          payload: {
            username: loginRequest.username,
            screenContent: response.screenContent,
          },
        });
        return { success: true, screenContent: response.screenContent };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({
        type: MainframeActionType.SET_ERROR,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // 发送命令
  const sendCommand = useCallback(async (command: string) => {
    if (!state.sessionId) {
      const error = 'No active session';
      dispatch({
        type: MainframeActionType.SET_ERROR,
        payload: { error },
      });
      return { success: false, error };
    }

    try {
      const commandRequest: CommandRequest = {
        sessionId: state.sessionId,
        command,
      };

      const response = await mainframeApi.sendCommand(commandRequest);
      
      if (response.success) {
        dispatch({
          type: MainframeActionType.SET_SCREEN_CONTENT,
          payload: { screenContent: response.screenContent },
        });
        return { success: true, screenContent: response.screenContent };
      } else {
        throw new Error(response.message || 'Command failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Command failed';
      dispatch({
        type: MainframeActionType.SET_ERROR,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  }, [state.sessionId]);

  // 获取屏幕内容
  const refreshScreen = useCallback(async () => {
    if (!state.sessionId) {
      return { success: false, error: 'No active session' };
    }

    try {
      const response = await mainframeApi.getScreenContent(state.sessionId);
      
      if (response.success) {
        dispatch({
          type: MainframeActionType.SET_SCREEN_CONTENT,
          payload: { screenContent: response.screenContent },
        });
        return { success: true, screenContent: response.screenContent };
      } else {
        throw new Error(response.message || 'Failed to get screen content');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh screen';
      dispatch({
        type: MainframeActionType.SET_ERROR,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  }, [state.sessionId]);

  // 断开连接
  const disconnect = useCallback(async () => {
    if (!state.sessionId) {
      dispatch({ type: MainframeActionType.SET_DISCONNECTED });
      return { success: true };
    }

    try {
      await mainframeApi.disconnect(state.sessionId);
      dispatch({ type: MainframeActionType.SET_DISCONNECTED });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Disconnect failed';
      dispatch({
        type: MainframeActionType.SET_DISCONNECTED,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  }, [state.sessionId]);

  // 清除错误
  const clearError = useCallback(() => {
    dispatch({ type: MainframeActionType.CLEAR_ERROR });
  }, []);

  // 检查服务可用性
  const checkServiceAvailability = useCallback(async () => {
    try {
      return await mainframeApi.isServiceAvailable();
    } catch {
      return false;
    }
  }, []);

  // 自动刷新屏幕内容（可选）
  useEffect(() => {
    if (state.isConnected && state.sessionId && state.username) {
      const interval = setInterval(() => {
        refreshScreen();
      }, 30000); // 每30秒刷新一次

      return () => clearInterval(interval);
    }
    return undefined;
  }, [state.isConnected, state.sessionId, state.username, refreshScreen]);

  return {
    // 状态
    state,
    
    // 操作
    connect,
    login,
    sendCommand,
    refreshScreen,
    disconnect,
    clearError,
    checkServiceAvailability,
    
    // 便捷的状态访问
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    isLoggingIn: state.isLoggingIn,
    sessionId: state.sessionId,
    host: state.host,
    port: state.port,
    username: state.username,
    screenContent: state.screenContent,
    error: state.error,
    lastActivity: state.lastActivity,
  };
}