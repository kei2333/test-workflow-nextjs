#!/usr/bin/env python3
"""
IBM Mainframe 连接 API 服务
使用 Flask + py3270 实现 3270 终端模拟器连接
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import time
import threading
import uuid
import os
from datetime import datetime, timedelta
import logging
from typing import Dict, Optional, Any, Tuple

try:
    import py3270
    HAS_PY3270 = True
except ImportError:
    HAS_PY3270 = False
    print("Warning: py3270 not installed. Falling back to mock mode.")

# 检查是否启用测试模式
TEST_MODE = os.getenv('MAINFRAME_TEST_MODE', 'false').lower() == 'true'

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})  # 明确允许来自 http://localhost:3000 的请求

# 全局会话存储
sessions: Dict[str, Dict[str, Any]] = {}
session_lock = threading.Lock()

class MainframeConnection:
    """IBM Mainframe 连接管理类"""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.emulator = None
        self.is_connected = False
        self.host = None
        self.port = None
        self.last_activity = datetime.now()
        
    def connect(self, host: str, port: int = 23) -> Tuple[bool, str]:
        """连接到 Mainframe
        返回 (success, message)
        """
        try:
            if not HAS_PY3270 or TEST_MODE:
                # Mock mode for development
                logger.info(f"[MOCK] connection to {host}:{port}")
                self.is_connected = True
                self.host = host
                self.port = port
                return True, f"(MOCK) Connected to {host}:{port}"

            try:
                self.emulator = py3270.Emulator(visible=False)
                self.emulator.connect(f"{host}:{port}")
            except FileNotFoundError:
                # s3270 二进制缺失
                logger.error("s3270 binary not found. Please ensure x3270 / s3270 is installed and in PATH.")
                return False, "s3270 binary not found. Install x3270 (brew install x3270) or adjust PATH."

            self.is_connected = True
            self.host = host
            self.port = port
            self.last_activity = datetime.now()
            logger.info(f"Connected to {host}:{port}")
            return True, f"Connected to {host}:{port}"
        except Exception as e:
            logger.error(f"Connection failed: {str(e)}")
            return False, str(e)
    
    def login(self, username: str, password: str) -> Dict[str, Any]:
        """执行登录操作"""
        try:
            if not self.is_connected:
                return {"success": False, "message": "Not connected to mainframe"}
            
            if not HAS_PY3270:
                # Mock login for development
                if username == "test" and password == "test":
                    return {
                        "success": True,
                        "message": "Login successful",
                        "screen_content": "MOCK MAINFRAME SYSTEM\n\nWelcome to Mock System\nUser: test\nTime: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                else:
                    return {"success": False, "message": "Invalid credentials"}
            
            # 真实的3270登录逻辑
            screen_content = self.emulator.string
            
            # 发送用户名
            self.emulator.send_string(username)
            self.emulator.send_enter()
            time.sleep(1)
            
            # 发送密码
            self.emulator.send_string(password)
            self.emulator.send_enter()
            time.sleep(2)
            
            # 获取登录后的屏幕内容
            screen_content = self.emulator.string
            self.last_activity = datetime.now()
            
            # 简单的登录成功检查（根据实际mainframe系统调整）
            if "READY" in screen_content or "ISPF" in screen_content:
                return {
                    "success": True,
                    "message": "Login successful",
                    "screen_content": screen_content
                }
            else:
                return {
                    "success": False,
                    "message": "Login failed - invalid credentials",
                    "screen_content": screen_content
                }
                
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return {"success": False, "message": f"Login error: {str(e)}"}
    
    def get_screen_content(self) -> str:
        """获取当前屏幕内容"""
        try:
            if not self.is_connected:
                return "Not connected"
            
            if not HAS_PY3270:
                return f"Mock Screen Content\nHost: {self.host}:{self.port}\nSession: {self.session_id}\nTime: {datetime.now().strftime('%H:%M:%S')}"
            
            content = self.emulator.string
            self.last_activity = datetime.now()
            return content
            
        except Exception as e:
            logger.error(f"Screen content error: {str(e)}")
            return f"Error getting screen content: {str(e)}"
    
    def send_command(self, command: str) -> Dict[str, Any]:
        """发送命令到mainframe"""
        try:
            if not self.is_connected:
                return {"success": False, "message": "Not connected"}
            
            if not HAS_PY3270:
                return {
                    "success": True,
                    "message": f"Mock command executed: {command}",
                    "screen_content": f"Command: {command}\nResult: Mock execution successful"
                }
            
            self.emulator.send_string(command)
            self.emulator.send_enter()
            time.sleep(1)
            
            screen_content = self.get_screen_content()
            self.last_activity = datetime.now()
            
            return {
                "success": True,
                "message": "Command sent successfully",
                "screen_content": screen_content
            }
            
        except Exception as e:
            logger.error(f"Command error: {str(e)}")
            return {"success": False, "message": f"Command error: {str(e)}"}
    
    def disconnect(self):
        """断开连接"""
        try:
            if self.emulator and HAS_PY3270:
                self.emulator.terminate()
            self.is_connected = False
            logger.info(f"Disconnected session {self.session_id}")
        except Exception as e:
            logger.error(f"Disconnect error: {str(e)}")

def cleanup_expired_sessions():
    """清理过期的会话"""
    with session_lock:
        current_time = datetime.now()
        expired_sessions = []
        
        for session_id, session_data in sessions.items():
            connection = session_data.get('connection')
            if connection and (current_time - connection.last_activity) > timedelta(hours=1):
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            if sessions[session_id]['connection']:
                sessions[session_id]['connection'].disconnect()
            del sessions[session_id]
            logger.info(f"Cleaned up expired session: {session_id}")

# API 路由
@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        "success": True,
        "status": "healthy",
        "py3270_available": HAS_PY3270,
        "active_sessions": len(sessions)
    })

@app.route('/api/connect', methods=['POST'])
def connect_mainframe():
    """连接到 IBM Mainframe"""
    data = request.get_json()
    
    if not data or 'host' not in data:
        return jsonify({"success": False, "message": "Host is required"}), 400
    
    host = data['host']
    port = data.get('port', 23)
    
    # 创建新会话
    session_id = str(uuid.uuid4())
    connection = MainframeConnection(session_id)
    
    success, msg = connection.connect(host, port)
    if success:
        with session_lock:
            sessions[session_id] = {
                'connection': connection,
                'created_at': datetime.now()
            }
        return jsonify({
            "success": True,
            "session_id": session_id,
            "message": msg
        })
    else:
        return jsonify({
            "success": False,
            "message": msg,
            "host": host,
            "port": port
        }), 400

@app.route('/api/login', methods=['POST'])
def login_mainframe():
    """登录到 Mainframe"""
    data = request.get_json()
    
    if not data or not all(key in data for key in ['session_id', 'username', 'password']):
        return jsonify({"success": False, "message": "session_id, username, and password are required"}), 400
    
    session_id = data['session_id']
    username = data['username']
    password = data['password']
    
    with session_lock:
        if session_id not in sessions:
            return jsonify({"success": False, "message": "Invalid session"}), 404
        
        connection = sessions[session_id]['connection']
    
    result = connection.login(username, password)
    return jsonify(result)

@app.route('/api/screen', methods=['GET'])
def get_screen():
    """获取屏幕内容"""
    session_id = request.args.get('session_id')
    
    if not session_id:
        return jsonify({"success": False, "message": "session_id is required"}), 400
    
    with session_lock:
        if session_id not in sessions:
            return jsonify({"success": False, "message": "Invalid session"}), 404
        
        connection = sessions[session_id]['connection']
    
    screen_content = connection.get_screen_content()
    return jsonify({
        "success": True,
        "screen_content": screen_content,
        "connected": connection.is_connected
    })

@app.route('/api/command', methods=['POST'])
def send_command():
    """发送命令"""
    data = request.get_json()
    
    if not data or not all(key in data for key in ['session_id', 'command']):
        return jsonify({"success": False, "message": "session_id and command are required"}), 400
    
    session_id = data['session_id']
    command = data['command']
    
    with session_lock:
        if session_id not in sessions:
            return jsonify({"success": False, "message": "Invalid session"}), 404
        
        connection = sessions[session_id]['connection']
    
    result = connection.send_command(command)
    return jsonify(result)

@app.route('/api/disconnect', methods=['POST'])
def disconnect_mainframe():
    """断开连接"""
    data = request.get_json()
    
    if not data or 'session_id' not in data:
        return jsonify({"success": False, "message": "session_id is required"}), 400
    
    session_id = data['session_id']
    
    with session_lock:
        if session_id not in sessions:
            return jsonify({"success": False, "message": "Invalid session"}), 404
        
        connection = sessions[session_id]['connection']
        connection.disconnect()
        del sessions[session_id]
    
    return jsonify({
        "success": True,
        "message": "Disconnected successfully"
    })

@app.route('/api/sessions', methods=['GET'])
def list_sessions():
    """列出活跃会话"""
    with session_lock:
        session_list = []
        for session_id, session_data in sessions.items():
            connection = session_data['connection']
            session_list.append({
                'session_id': session_id,
                'host': connection.host,
                'port': connection.port,
                'connected': connection.is_connected,
                'created_at': session_data['created_at'].isoformat(),
                'last_activity': connection.last_activity.isoformat()
            })
    
    return jsonify({
        "success": True,
        "sessions": session_list
    })

# 定期清理过期会话
def start_cleanup_timer():
    """启动清理定时器"""
    cleanup_expired_sessions()
    threading.Timer(300, start_cleanup_timer).start()  # 每5分钟清理一次

if __name__ == '__main__':
    print("Starting IBM Mainframe API Server...")
    print(f"py3270 available: {HAS_PY3270}")
    
    # 启动清理定时器
    start_cleanup_timer()
    
    # 启动Flask应用
    app.run(host='localhost', port=5001, debug=True)