# IBM Mainframe 连接功能 - 完整安装指南

本指南将帮助您为现有的 Next.js 工作流应用添加 IBM Mainframe 登录功能。

## 🚀 项目概述

### 新增功能
- **IBM Mainframe 连接**：使用 3270 终端模拟器连接到 IBM 大型机
- **用户认证**：安全的登录和会话管理
- **实时终端**：查看和交互 Mainframe 屏幕内容
- **现代化界面**：与现有 UI 保持一致的设计风格

### 技术架构
- **前端**：Next.js 14 + TypeScript + Tailwind CSS
- **后端**：Python Flask + py3270
- **连接方式**：s3270 (3270 终端模拟器)

## 📋 系统要求

### 软件依赖
- **Node.js** >= 18.0.0
- **Python** >= 3.8
- **s3270** 终端模拟器 (对于生产环境)

### 系统兼容性
- macOS (推荐)
- Linux
- Windows (需要额外配置)

## 🛠️ 安装步骤

### 1. 安装系统依赖

#### macOS
```bash
# 安装 s3270 (可选，开发模式下会使用 Mock)
brew install s3270
```

#### Linux (Ubuntu/Debian)
```bash
# 安装 s3270
sudo apt-get update
sudo apt-get install s3270
```

#### Windows
```bash
# 使用 Chocolatey 安装 s3270
choco install s3270
```

### 2. 安装 Python 后端依赖

```bash
# 进入后端目录
cd backend

# 创建虚拟环境 (推荐)
python -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 3. 配置环境变量

项目根目录下的 `.env.local` 文件已创建，包含以下配置：

```env
# IBM Mainframe API Backend Configuration
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000

# Development Settings
NODE_ENV=development
```

如需修改后端服务地址，请更新 `NEXT_PUBLIC_API_URL`。

### 4. 安装前端依赖

```bash
# 在项目根目录
npm install
```

## 🚀 运行应用

### 1. 启动 Python 后端服务

```bash
cd backend
python app.py
```

后端服务将在 `http://127.0.0.1:5000` 启动。

**重要提示**：如果未安装 py3270，服务会以 Mock 模式运行，这对开发和测试非常有用。

### 2. 启动 Next.js 前端

在新的终端窗口中：

```bash
npm run dev
```

前端应用将在 `http://localhost:3000` 启动。

### 3. 访问 Mainframe 功能

- **主工作流页面**：`http://localhost:3000`（包含新的 "IBM Mainframe" 按钮）
- **Mainframe 专用页面**：`http://localhost:3000/mainframe`

## 🔧 功能使用指南

### 连接到 Mainframe

1. **访问 Mainframe 页面**
   - 从主页点击 "IBM Mainframe" 按钮
   - 或直接访问 `/mainframe` 路由

2. **配置连接**
   - 输入 Mainframe 主机地址（例如：`mainframe.example.com`）
   - 设置端口号（默认：23）
   - 点击 "Connect to Mainframe"

3. **用户认证**
   - 输入您的 Mainframe 用户名
   - 输入密码（支持显示/隐藏切换）
   - 点击 "Login to Mainframe"

4. **终端交互**
   - 查看实时屏幕内容
   - 在命令输入框中输入 Mainframe 命令
   - 使用 "Refresh" 按钮手动刷新屏幕
   - 使用 "Disconnect" 按钮安全断开连接

### 开发模式测试

在没有安装 py3270 的情况下，系统会使用 Mock 模式：

- **测试登录凭据**：
  - 用户名：`test`
  - 密码：`test`
- **模拟屏幕内容**：显示模拟的 Mainframe 界面
- **命令执行**：返回模拟的执行结果

## 🏗️ 项目结构

### 新增文件

```
test-workflow-nextjs/
├── backend/                          # Python 后端服务
│   ├── app.py                       # Flask 应用主文件
│   ├── requirements.txt             # Python 依赖
│   └── README.md                    # 后端文档
├── src/
│   ├── app/
│   │   └── mainframe/
│   │       └── page.tsx             # Mainframe 专用页面
│   ├── components/
│   │   └── MainframeLogin.tsx       # 主要登录组件
│   ├── hooks/
│   │   └── useMainframe.ts          # Mainframe 状态管理
│   ├── services/
│   │   └── mainframeApi.ts          # API 通信服务
│   └── types/
│       └── mainframe.ts             # TypeScript 类型定义
├── .env.local                       # 环境配置
└── MAINFRAME_SETUP.md              # 本安装指南
```

### 修改的文件

- `src/app/page.tsx`：添加了 Mainframe 导航按钮

## 🔍 API 接口文档

### 基础 URL
```
http://127.0.0.1:5000/api
```

### 接口列表

#### 1. 健康检查
- **GET** `/health`
- **响应**：服务状态和 py3270 可用性

#### 2. 连接 Mainframe
- **POST** `/connect`
- **请求体**：`{ "host": "string", "port": number }`
- **响应**：`{ "success": boolean, "session_id": "string" }`

#### 3. 用户登录
- **POST** `/login`
- **请求体**：`{ "session_id": "string", "username": "string", "password": "string" }`
- **响应**：`{ "success": boolean, "screen_content": "string" }`

#### 4. 获取屏幕内容
- **GET** `/screen?session_id=string`
- **响应**：`{ "success": boolean, "screen_content": "string" }`

#### 5. 发送命令
- **POST** `/command`
- **请求体**：`{ "session_id": "string", "command": "string" }`
- **响应**：`{ "success": boolean, "screen_content": "string" }`

#### 6. 断开连接
- **POST** `/disconnect`
- **请求体**：`{ "session_id": "string" }`
- **响应**：`{ "success": boolean }`

## 🛡️ 安全性考虑

### 开发环境
- 密码在前端组件中会在登录成功后清除
- 会话 ID 用于标识连接，避免密码重复传输
- 后端会话会在 1 小时无活动后自动清理

### 生产环境建议
- 使用 HTTPS 加密所有通信
- 实施更严格的认证机制
- 添加日志记录和监控
- 配置防火墙规则

## 🐛 故障排除

### 常见问题

#### 1. 后端服务无法启动
```bash
# 检查 Python 版本
python --version

# 检查依赖安装
pip list

# 查看详细错误
python app.py
```

#### 2. 前端无法连接后端
- 确认后端服务正在运行
- 检查 `.env.local` 中的 API_URL 配置
- 查看浏览器控制台错误

#### 3. py3270 安装问题
- 开发阶段可以不安装 py3270，会自动使用 Mock 模式
- 生产环境请参考官方文档安装 s3270

#### 4. CORS 错误
- 后端已配置 CORS，如果仍有问题，请检查防火墙设置

### 日志查看

#### 后端日志
```bash
# 后端会输出详细日志到控制台
cd backend
python app.py
```

#### 前端日志
- 打开浏览器开发者工具
- 查看 Console 标签页
- 查看 Network 标签页检查 API 请求

## 🔄 更新和维护

### 更新依赖
```bash
# 更新 Python 依赖
cd backend
pip install --upgrade -r requirements.txt

# 更新 Node.js 依赖
npm update
```

### 备份配置
```bash
# 备份重要配置文件
cp .env.local .env.local.backup
cp backend/app.py backend/app.py.backup
```

## 📞 技术支持

### 开发者资源
- **Next.js 文档**：https://nextjs.org/docs
- **Flask 文档**：https://flask.palletsprojects.com/
- **py3270 文档**：https://py3270.readthedocs.io/
- **Tailwind CSS**：https://tailwindcss.com/docs

### 贡献指南
如需要扩展功能或修复问题：
1. Fork 项目仓库
2. 创建功能分支
3. 提交变更
4. 创建 Pull Request

---

**恭喜！** IBM Mainframe 连接功能已成功集成到您的 Next.js 工作流应用中。现在您可以通过现代化的 Web 界面安全地连接和操作 IBM 大型机系统。