/**
 * IBM Mainframe 连接相关的类型定义
 */

export interface MainframeConnection {
  sessionId: string;
  host: string;
  port: number;
  connected: boolean;
  createdAt: string;
  lastActivity: string;
}

export interface ConnectionRequest {
  host: string;
  port?: number;
}

export interface LoginRequest {
  sessionId: string;
  username: string;
  password: string;
}

export interface CommandRequest {
  sessionId: string;
  command: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ConnectionResponse extends ApiResponse {
  sessionId?: string;
}

export interface LoginResponse extends ApiResponse {
  screenContent?: string;
}

export interface ScreenResponse extends ApiResponse {
  screenContent?: string;
  connected?: boolean;
}

export interface CommandResponse extends ApiResponse {
  screenContent?: string;
}

export interface SessionsResponse extends ApiResponse {
  sessions?: MainframeConnection[];
}

export interface HealthResponse extends ApiResponse {
  status?: string;
  py3270Available?: boolean;
  activeSessions?: number;
}

export interface MainframeState {
  isConnected: boolean;
  isConnecting: boolean;
  isLoggingIn: boolean;
  sessionId: string | null;
  host: string;
  port: number;
  username: string;
  screenContent: string;
  error: string | null;
  lastActivity: string | null;
}

export enum MainframeActionType {
  SET_CONNECTING = 'SET_CONNECTING',
  SET_CONNECTED = 'SET_CONNECTED',
  SET_LOGGING_IN = 'SET_LOGGING_IN',
  SET_LOGIN_SUCCESS = 'SET_LOGIN_SUCCESS',
  SET_SCREEN_CONTENT = 'SET_SCREEN_CONTENT',
  SET_ERROR = 'SET_ERROR',
  SET_DISCONNECTED = 'SET_DISCONNECTED',
  CLEAR_ERROR = 'CLEAR_ERROR',
}

export interface MainframeAction {
  type: MainframeActionType;
  payload?: any;
}