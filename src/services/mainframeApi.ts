/**
 * IBM Mainframe API 服务类
 * 处理与后端 Python Flask API 的所有通信
 */

import {
  ConnectionRequest,
  LoginRequest,
  CommandRequest,
  ConnectionResponse,
  LoginResponse,
  ScreenResponse,
  CommandResponse,
  SessionsResponse,
  HealthResponse,
  ApiResponse
} from '@/types/mainframe';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

class MainframeApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * 通用 API 请求方法
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<HealthResponse> {
    return this.makeRequest<HealthResponse>('/api/health');
  }

  /**
   * 连接到 IBM Mainframe
   */
  async connect(request: ConnectionRequest): Promise<ConnectionResponse> {
    return this.makeRequest<ConnectionResponse>('/api/connect', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * 登录到 Mainframe
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * 获取屏幕内容
   */
  async getScreenContent(sessionId: string): Promise<ScreenResponse> {
    const params = new URLSearchParams({ session_id: sessionId });
    return this.makeRequest<ScreenResponse>(`/api/screen?${params}`);
  }

  /**
   * 发送命令到 Mainframe
   */
  async sendCommand(request: CommandRequest): Promise<CommandResponse> {
    return this.makeRequest<CommandResponse>('/api/command', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * 断开连接
   */
  async disconnect(sessionId: string): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/api/disconnect', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  /**
   * 获取活跃会话列表
   */
  async getSessions(): Promise<SessionsResponse> {
    return this.makeRequest<SessionsResponse>('/api/sessions');
  }

  /**
   * 检查后端服务是否可用
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.success === true;
    } catch {
      return false;
    }
  }
}

export const mainframeApi = new MainframeApiService();
export default mainframeApi;