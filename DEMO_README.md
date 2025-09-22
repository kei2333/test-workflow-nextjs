# 🚀 IBM Mainframe 连接功能演示

恭喜！您已成功为 Next.js 工作流应用添加了 IBM Mainframe 连接功能。

## 📋 功能特性

✅ **安全连接** - 使用 3270 终端模拟器连接 IBM 大型机  
✅ **用户认证** - 完整的登录和会话管理系统  
✅ **实时终端** - 查看和操作 Mainframe 屏幕内容  
✅ **现代化 UI** - 与现有设计风格完美融合的界面  
✅ **错误处理** - 完善的错误提示和状态管理  
✅ **开发模式** - 支持 Mock 模式，便于开发和测试  

## 🚀 快速开始

### 1. 自动安装和配置
```bash
./start-mainframe.sh
```

### 2. 手动启动

#### 启动后端服务
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python3 app.py
```

#### 启动前端服务
```bash
npm install
npm run dev
```

### 3. 访问应用
- **主工作流页面**: http://localhost:3000
- **Mainframe 专用页面**: http://localhost:3000/mainframe

## 🎯 演示指南

### Mock 模式测试（推荐用于演示）
1. 启动服务后访问 Mainframe 页面
2. 输入任意主机地址（如 `demo.mainframe.com`）
3. 使用测试凭据登录：
   - **用户名**: `test`
   - **密码**: `test`
4. 体验终端交互功能

### 真实环境连接
1. 确保安装了 s3270: `brew install s3270` (macOS)
2. 输入真实的 Mainframe 主机地址
3. 使用您的实际凭据登录

## 🏗️ 项目结构

```
test-workflow-nextjs/
├── 🐍 backend/                    # Python Flask API
│   ├── app.py                     # 主服务文件
│   ├── requirements.txt           # Python 依赖
│   └── README.md                  # 后端文档
├── ⚛️ src/                         # Next.js 前端
│   ├── app/mainframe/             # Mainframe 页面
│   ├── components/MainframeLogin.tsx  # 登录组件
│   ├── hooks/useMainframe.ts      # 状态管理
│   ├── services/mainframeApi.ts   # API 通信
│   └── types/mainframe.ts         # 类型定义
├── 📄 MAINFRAME_SETUP.md          # 详细安装指南
├── 🚀 start-mainframe.sh          # 快速启动脚本
└── 📋 DEMO_README.md              # 本演示文档
```

## 🔧 核心技术

- **前端框架**: Next.js 14 + TypeScript
- **样式系统**: Tailwind CSS 4.0 (毛玻璃效果、渐变色)
- **后端服务**: Python Flask + py3270
- **状态管理**: React Hooks + useReducer
- **API 通信**: Fetch API + 错误处理
- **终端模拟**: s3270 (3270 Terminal Emulator)

## 🌟 设计亮点

- **一致性设计**: 完美融合现有 UI 风格
- **响应式布局**: 适配多种屏幕尺寸
- **状态指示**: 实时连接状态和活动指示器
- **用户体验**: 流畅的加载动画和交互反馈
- **安全性**: 密码输入保护和会话管理

## 🛠️ 自定义和扩展

### 修改样式
编辑 `src/components/MainframeLogin.tsx` 中的 Tailwind 类名

### 添加功能
- 扩展 API 端点：修改 `backend/app.py`
- 添加新组件：在 `src/components/` 目录创建
- 增强状态管理：扩展 `src/hooks/useMainframe.ts`

### 集成现有工作流
Mainframe 功能已无缝集成到现有工作流中，可以：
- 添加 Mainframe 相关的工作流函数
- 在工作流中使用 Mainframe 连接状态
- 将 Mainframe 操作作为工作流步骤

## 📞 支持

- 📖 **详细文档**: 查看 `MAINFRAME_SETUP.md`
- 🐛 **故障排除**: 文档中包含常见问题解决方案
- 🔧 **技术支持**: 检查控制台日志和网络请求

---

**🎉 享受您的现代化 IBM Mainframe 连接体验！**