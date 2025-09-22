# IBM Mainframe 连接后端服务

这是一个基于 Flask 的 Python 后端服务，用于连接 IBM Mainframe 系统。

## 功能特性

- 🔌 使用 py3270 库连接 IBM Mainframe
- 🔐 支持用户认证登录
- 🖥️ 实时获取 3270 终端屏幕内容
- 📡 RESTful API 接口
- 🔄 会话管理和自动清理
- 🛡️ CORS 支持，便于前端集成

## 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

## 运行服务

```bash
python app.py
```

服务将在 `http://127.0.0.1:5000` 启动。

## API 接口

### 1. 健康检查
```
GET /api/health
```

### 2. 连接 Mainframe
```
POST /api/connect
Content-Type: application/json

{
  "host": "mainframe.example.com",
  "port": 23
}
```

### 3. 登录
```
POST /api/login
Content-Type: application/json

{
  "session_id": "uuid",
  "username": "your_username",
  "password": "your_password"
}
```

### 4. 获取屏幕内容
```
GET /api/screen?session_id=uuid
```

### 5. 发送命令
```
POST /api/command
Content-Type: application/json

{
  "session_id": "uuid",
  "command": "ISPF"
}
```

### 6. 断开连接
```
POST /api/disconnect
Content-Type: application/json

{
  "session_id": "uuid"
}
```

### 7. 列出活跃会话
```
GET /api/sessions
```

## 开发模式

如果未安装 py3270，服务将以 Mock 模式运行，用于开发和测试。

## 注意事项

- 会话会在1小时无活动后自动清理
- 支持多个并发连接
- 所有API都支持CORS
- 错误处理和日志记录完善