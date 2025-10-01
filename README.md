# IBM Mainframe Test Workflow System / IBM大型机测试工作流系统

A modern web-based system for creating drag-and-drop test workflows and connecting to IBM mainframes via s3270 terminal emulation.

一个现代化的基于Web的系统，用于创建拖放式测试工作流并通过s3270终端仿真连接IBM大型机。

## 🎉 **Latest Release - TK5 Local Mainframe Integration**

### ✅ **What's New (Latest Update)**
- 🏠 **Local TK5 Mainframe**: Successfully integrated with TK5 MVS 3.8j system (localhost:3270)
- 📁 **CreateFile Enhancement**: Real file creation functionality with actual downloadable files
- 🔗 **Dual Mainframe Support**: Both pub400.com (remote) and TK5 (local) mainframe connections
- 💾 **File Generation**: Structured file creation with copybook layouts and multiple formats
- 🚀 **Workflow Integration**: LogonISPF + CreateFile workflows execute on real mainframe systems
- 🖥️ **Seamless Navigation**: Added "Mainframe Terminal" button in homepage header for quick access
- ⚡ **Real-time Terminal**: Full interactive s3270 terminal with live screen updates
- 📱 **Responsive Design**: Beautiful gradient UI with hover effects and animations

### 🎯 **Demo Flow**
1. Visit `http://localhost:3000` (or network IP for WiFi access) - Main workflow builder interface
2. **Local TK5**: Connect to `localhost:3270` with credentials `HERC01/CUL8TR`
3. **Remote pub400**: Connect to `pub400.com:23` with credentials `pub400/pub400`
4. **Test CreateFile**: Build LogonISPF + CreateFile workflow with real file generation
5. Experience real IBM mainframe interaction via s3270
6. **Network Access**: Available at `http://[your-ip]:3000` for other devices on same WiFi

### 💡 **Technical Achievement**
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Python Flask + s3270 native integration
- **Mainframes**: TK5 MVS 3.8j (localhost:3270) + pub400.com IBM i system
- **File Processing**: Real file generation with copybook layouts and structured content
- **UI/UX**: Glass-morphism design with smooth transitions

## 🌟 Features / 功能特性

### 🚀 **Latest Updates - Real Mainframe Connectivity**
- **🔗 Live Mainframe Connection**: Successfully connects to real IBM mainframe systems (pub400.com)
- **🖥️ Dual Interface**: Seamless navigation between workflow builder and mainframe terminal
- **⚡ Quick Access Button**: One-click navigation to mainframe terminal from homepage
- **🔄 Real-time Integration**: Workflow functions execute on actual mainframe systems
- **🔗 实时大型机连接**: 成功连接真实的IBM大型机系统 (pub400.com)
- **🖥️ 双界面系统**: 工作流构建器和大型机终端之间的无缝导航
- **⚡ 快速访问按钮**: 从主页一键导航到大型机终端
- **🔄 实时集成**: 工作流功能在真实大型机系统上执行

### Test Workflow Builder / 测试工作流构建器
- **Drag & Drop Interface**: Create test workflows by dragging functions from left panel to canvas
- **Visual Workflow Design**: Build complex test processes with an intuitive interface
- **Function Execution**: Execute workflows with real-time progress tracking
- **Real Mainframe Execution**: Workflows execute on actual IBM systems via s3270
- **拖放界面**: 从左侧面板拖拽功能到画布创建测试工作流
- **可视化工作流设计**: 用直观的界面构建复杂的测试流程
- **功能执行**: 实时进度跟踪执行工作流
- **真实大型机执行**: 工作流在真实IBM系统上通过s3270执行

### IBM Mainframe Integration / IBM大型机集成
- **s3270 Terminal Emulation**: Native IBM 3270 terminal emulator integration
- **Real Mainframe Connection**: Connect to actual IBM mainframe systems (pub400.com)
- **Interactive Terminal**: Full-screen terminal interface with real-time updates
- **Authentication Support**: Secure login with username/password validation
- **Session Management**: Multiple concurrent mainframe sessions
- **Command Execution**: Send commands and receive real mainframe responses
- **s3270终端仿真**: 原生IBM 3270终端仿真器集成
- **真实大型机连接**: 连接到实际的IBM大型机系统 (pub400.com)
- **交互式终端**: 带实时更新的全屏终端界面
- **身份验证支持**: 用户名/密码验证的安全登录
- **会话管理**: 多个并发大型机会话
- **命令执行**: 发送命令并接收真实大型机响应

## 🏗️ Architecture / 系统架构

```
Frontend (Next.js + React + TypeScript)
    ↓ HTTP API
Backend (Python Flask + s3270)
    ↓ 3270 Protocol
IBM Mainframe Systems
```

## 🚀 Quick Start / 快速开始

### Prerequisites / 前置要求

1. **Install s3270** / **安装s3270**
   ```bash
   # macOS
   brew install s3270

   # Ubuntu/Debian
   sudo apt-get install x3270-tcl

   # CentOS/RHEL
   sudo yum install x3270-tcl

   # Windows - Download wc3270 (includes s3270)
   # Download from: http://x3270.bgp.nu/download.html
   # Install to: C:\Program Files\wc3270\
   # The backend will auto-detect s3270.exe in this location
   ```

2. **Install TK5 (Optional - for local mainframe)** / **安装TK5（可选 - 用于本地大型机）**

   TK5 is a ready-to-run MVS 3.8j system that runs on Hercules emulator.
   TK5 是一个即用型 MVS 3.8j 系统，运行在 Hercules 模拟器上。

   **Option 1: Windows (Recommended)**
   ```bash
   # 1. Download TK5
   # Visit: http://wotho.ethz.ch/tk4-/
   # Download: tk4-_v1.00_current.zip

   # 2. Extract to any location (e.g., Y:\mvs-tk5 or C:\tk5)
   # TK5 includes Hercules - no separate installation needed!

   # 3. Start TK5
   cd Y:\mvs-tk5  # or your extraction path
   start_herc.bat  # or mvs.bat

   # 4. Wait for TK5 to start (listen on port 3270)
   # Default credentials: HERC01 / CUL8TR
   ```

   **Option 2: Linux/macOS**
   ```bash
   # 1. Install Hercules
   # macOS:
   brew install hercules

   # Ubuntu/Debian:
   sudo apt-get install hercules

   # 2. Download and extract TK5
   wget http://wotho.ethz.ch/tk4-/tk4-_v1.00_current.zip
   unzip tk4-_v1.00_current.zip
   cd tk4-

   # 3. Start TK5
   ./mvs

   # 4. TK5 will listen on port 3270
   # Default credentials: HERC01 / CUL8TR
   ```

   **Option 3: Docker (Easiest)**
   ```bash
   # Pull and run TK5 in Docker
   docker run -d -p 3270:3270 -p 8038:8038 rattydave/docker-ubuntu-hercules-mvs

   # TK5 will be available at localhost:3270
   # Default credentials: HERC01 / CUL8TR
   ```

   **Verify TK5 is running:**
   ```bash
   # Check if port 3270 is listening
   # Windows:
   netstat -an | findstr :3270

   # Linux/macOS:
   netstat -an | grep 3270

   # Should show: TCP 0.0.0.0:3270 ... LISTENING
   ```

3. **Install Node.js 18+** / **安装Node.js 18+**
   ```bash
   # Check version / 检查版本
   node --version
   ```

4. **Install Python 3.8+** / **安装Python 3.8+**
   ```bash
   # Check version / 检查版本
   python3 --version
   ```

### Installation / 安装

1. **Clone the repository** / **克隆仓库**
   ```bash
   git clone <repository-url>
   cd test-workflow-nextjs
   ```

2. **Install frontend dependencies** / **安装前端依赖**
   ```bash
   npm install
   ```

3. **Setup Python backend** / **设置Python后端**
   ```bash
   # Create virtual environment / 创建虚拟环境
   python3 -m venv .venv

   # Activate virtual environment / 激活虚拟环境
   # Linux/macOS:
   source .venv/bin/activate

   # Windows Command Prompt:
   .venv\Scripts\activate.bat

   # Windows PowerShell:
   .venv\Scripts\Activate.ps1

   # Install Python dependencies / 安装Python依赖
   cd backend
   pip install flask flask-cors
   ```

### Running the Application / 运行应用

You need to start both frontend and backend services:
你需要同时启动前端和后端服务：

1. **Start the backend server** / **启动后端服务器**
   ```bash
   # In terminal 1 / 在终端1中
   cd backend

   # Activate virtual environment / 激活虚拟环境
   # Linux/macOS:
   source ../.venv/bin/activate

   # Windows Command Prompt:
   ../.venv/Scripts/activate.bat

   # Windows PowerShell:
   ../.venv/Scripts/Activate.ps1

   # Start server / 启动服务器
   # Linux/macOS:
   python3 app.py

   # Windows:
   python app.py
   ```
   Backend will run on `http://localhost:5001`
   后端将运行在 `http://localhost:5001`

2. **Start the frontend server** / **启动前端服务器**
   ```bash
   # In terminal 2 / 在终端2中
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`
   前端将运行在 `http://localhost:3000`

3. **Access the application** / **访问应用**
   - **Main workflow**: `http://localhost:3000` - Drag & drop workflow builder
   - **Mainframe terminal**: `http://localhost:3000/mainframe` - Direct s3270 terminal access
   - **Quick navigation**: Use the "Mainframe Terminal" button in top-right corner of homepage

## 🔧 How s3270 Mainframe Connection Works / s3270大型机连接原理

### Real Mainframe Connection / 真实大型机连接

The system uses `s3270` (IBM 3270 terminal emulator) to establish authentic connections to IBM mainframe systems:

系统使用 `s3270`（IBM 3270终端仿真器）与IBM大型机系统建立真实连接：

#### 1. Connection Process / 连接过程
```python
# backend/app.py - S3270Session.connect()
s3270_cmd = [
    's3270',
    '-model', '3279-4',    # 3270 model 4 (43x80 screen)
    '-script',             # Enable scripting mode
    f'{host}:{port}'       # Connect to mainframe host:port
]

process = subprocess.Popen(
    s3270_cmd,
    stdin=subprocess.PIPE,   # Send commands
    stdout=subprocess.PIPE,  # Receive responses
    stderr=subprocess.PIPE,  # Error handling
    text=True
)
```

#### 2. Authentication / 身份验证
```python
# Send login credentials to mainframe
self._execute_command('Clear')              # Clear screen
self._execute_command(f'String("{username}")') # Type username
self._execute_command('Tab')                # Move to password field
self._execute_command(f'String("{password}")') # Type password
self._execute_command('Enter')              # Submit login
```

#### 3. Command Execution / 命令执行
```python
def _send_command(self, command: str):
    # Send command to s3270 process
    self.process.stdin.write(f"{command}\n")
    self.process.stdin.flush()

    # Read response from mainframe
    while True:
        line = self.process.stdout.readline().strip()
        if line.startswith("ok"):
            break
        elif line.startswith("error"):
            # Handle error
            break
```

#### 4. Screen Content Retrieval / 屏幕内容获取
```python
def get_screen_text(self):
    # Get current screen content from mainframe
    screen_content = self._execute_command('Ascii')
    return screen_content
```

### Real Mainframe Connection / 真实大型机连接

The system connects directly to real IBM mainframe systems:
系统直接连接到真实的IBM大型机系统：

- **Default Host**: `pub400.com:23` (IBM i AS/400 system)
- **Credentials**: `pub400/pub400` (public access)
- **Protocol**: TN3270 via s3270 terminal emulator
- **Live Connection**: Real-time interaction with actual mainframe
- **默认主机**: `pub400.com:23` (IBM i AS/400 系统)
- **凭据**: `pub400/pub400` (公共访问)
- **协议**: 通过s3270终端模拟器的TN3270
- **实时连接**: 与真实大型机的实时交互

## 📁 Project Structure / 项目结构

```
test-workflow-nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main workflow builder / 主工作流构建器
│   │   └── mainframe/
│   │       └── page.tsx          # Mainframe terminal page / 大型机终端页面
│   ├── components/
│   │   ├── WorkflowBuilder.tsx   # Drag-and-drop workflow interface
│   │   ├── MainframeLogin.tsx    # Mainframe connection component
│   │   └── ...
│   ├── services/
│   │   ├── functionExecutor.ts   # Workflow execution logic
│   │   └── mainframeApi.ts       # Mainframe API client
│   ├── hooks/
│   │   └── useMainframe.ts       # Mainframe connection hook
│   └── types/
│       ├── workflow.ts           # Workflow type definitions
│       └── mainframe.ts          # Mainframe type definitions
├── backend/
│   └── app.py                    # Python Flask API server
└── README.md                     # This file / 本文件
```

## 🔌 API Endpoints / API端点

### Backend API / 后端API
- `GET /api/health` - Health check / 健康检查
- `POST /api/connect` - Connect to mainframe / 连接大型机
- `POST /api/login` - Login to mainframe / 登录大型机
- `GET /api/screen?session_id=<id>` - Get screen content / 获取屏幕内容
- `POST /api/command` - Send command / 发送命令
- `POST /api/disconnect` - Disconnect / 断开连接
- `GET /api/sessions` - List active sessions / 列出活动会话

## 🎯 Available Workflow Functions / 可用工作流功能

1. **logonispf** - Login to ISPF / 登录ISPF
2. **editjcl** - Edit JCL files / 编辑JCL文件
3. **execjcl** - Execute JCL jobs / 执行JCL作业
4. **executioncheck** - Check job execution / 检查作业执行
5. **getjoblog** - Retrieve job logs / 获取作业日志
6. **filecomp1** - File comparison / 文件比较
7. **filecomp2** - Conditional file comparison / 条件文件比较
8. **createfile** - Create files / 创建文件
9. **sendfile** - Send files to mainframe / 发送文件到大型机
10. **getfile** - Get files from mainframe / 从大型机获取文件
11. **fileconv** - File format conversion / 文件格式转换
12. **gotoispfmainscreen** - Return to ISPF main / 返回ISPF主屏幕
13. **filereccount** - Get file record count / 获取文件记录数

## 🔧 Configuration / 配置

### Environment Variables / 环境变量
```bash
# Backend configuration / 后端配置
FLASK_PORT=5001
FLASK_DEBUG=True

# Frontend configuration / 前端配置
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Mainframe Connection Settings / 大型机连接设置
- **Default Host**: `pub400.com` (IBM i AS/400 system)
- **Default Port**: 23 (Telnet)
- **Default Credentials**: `pub400/pub400`
- **Models Supported**: IBM-3279-4-E (43x80 display)
- **Protocols**: TN3270, TN3270E
- **Terminal Type**: 5250 (AS/400) via s3270 emulation
- **默认主机**: `pub400.com` (IBM i AS/400系统)
- **默认端口**: 23 (Telnet)
- **默认凭据**: `pub400/pub400`
- **支持型号**: IBM-3279-4-E (43x80显示)
- **协议**: TN3270, TN3270E
- **终端类型**: 通过s3270仿真的5250 (AS/400)

## 🛠️ Development / 开发

### Adding New Workflow Functions / 添加新的工作流功能
1. Define function in `src/data/functions.ts`
2. Implement logic in `src/services/functionExecutor.ts`
3. Update type definitions in `src/types/workflow.ts`

### Extending Mainframe Integration / 扩展大型机集成
1. Add new commands in `backend/app.py`
2. Update API client in `src/services/mainframeApi.ts`
3. Enhance UI components in `src/components/MainframeLogin.tsx`

## 📝 Testing / 测试

### Real Mainframe Usage / 真实大型机使用
1. Start the application / 启动应用
2. Navigate to mainframe page / 导航到大型机页面
3. Use `pub400.com` as host and `23` as port (pre-configured)
4. Login with `pub400/pub400` credentials (pre-filled)
5. Experience real IBM mainframe commands and screens
6. All workflow functions execute on the actual mainframe system

## 🤝 Contributing / 贡献

1. Fork the repository / 分叉仓库
2. Create feature branch / 创建功能分支
3. Make changes / 进行更改
4. Test thoroughly / 彻底测试
5. Submit pull request / 提交拉取请求

## 📄 License / 许可证

This project is for educational and testing purposes.
本项目用于教育和测试目的。

## 🆘 Support / 支持

For issues and questions:
如有问题和疑问：
- Check the console logs / 检查控制台日志
- Verify s3270 installation / 验证s3270安装
- Ensure both services are running / 确保两个服务都在运行
- Test with localhost:3270 first / 首先用localhost:3270测试

---

## 🆕 Previous Updates - Function Management System

### 🎯 **New Features Added**

#### ✨ **Dynamic Function Management**
- **➕ Add Function** - Create custom functions with configurable input fields
- **✏️ Edit Function** - Modify existing function names, descriptions, and input parameters  
- **🗑️ Delete Function** - Remove functions with confirmation dialog
- **💾 Local JSON Storage** - All functions stored in `data/functions.json` file

#### 📁 **Local File-Based Architecture**
- **📄 Function Data** - All function definitions moved to `data/functions.json`
- **🔄 Real-time Updates** - Page operations automatically update the JSON file
- **🌐 Git-based Sharing** - Function updates shared through repository pushes/pulls

### 🖥️ **How to View and Test Changes**

#### 🏠 **Local Development Setup**
Since functions are now stored in local JSON files, you need to run the project locally:

1. **📥 Clone/Pull Repository**
   ```bash
   git clone https://github.com/kei2333/test-workflow-nextjs.git
   # OR if already cloned:
   git pull origin master
   ```

2. **📦 Install Dependencies**
   ```bash
   cd test-workflow-nextjs
   npm install
   ```

3. **🚀 Start Development Server**
   ```bash
   npm run dev
   ```

4. **🌐 Open in Browser**
   ```
   http://localhost:3000
   ```

#### 🔄 **Sharing Function Updates**
- **💾 Local Changes** - When you add/edit/delete functions, `data/functions.json` is updated locally
- **📤 Share Updates** - Push changes to repository:  
  ```bash
  git add . && git commit -m "Update functions" && git push
  ```
- **📥 Get Updates** - Others can see your function changes by running:  
  ```bash
  git pull
  ```

### 🎮 **How to Use the Function Management**

1. **➕ Add New Function**
   - Click "Add" button in Functions panel header
   - Fill in function name, ID, description, and input fields
   - Click "Add Function" to save

2. **✏️ Edit Existing Function**
   - Click the blue edit icon on any function card
   - Modify fields as needed
   - Click "Update Function" to save changes

3. **🗑️ Delete Function**
   - Click the red delete icon on any function card
   - Confirm deletion in the dialog
   - Function is immediately removed from JSON file

4. **🔄 Build Workflows**
   - Drag functions from left panel to workflow canvas
   - Configure input values for each function
   - Run complete workflow sequences

---

## 🔄 最新更新 - 函数管理系统

### 🎯 **新增功能**

#### ✨ **动态函数管理**
- **➕ 添加函数功能** - 创建带可配置输入字段的自定义函数
- **✏️ 编辑函数功能** - 修改现有函数的名称、描述和输入参数  
- **🗑️ 删除函数功能** - 通过确认对话框删除函数
- **💾 本地JSON存储** - 所有函数分割保存到 `data/functions.json` 文件中

#### 📁 **基于本地文件的架构**
- **📄 函数数据分离** - 所有函数定义迁移到独立的 `data/functions.json` 文件
- **🔄 实时更新** - 页面上的每次操作都会自动更新本地JSON文件
- **🌐 基于Git的协作** - 通过仓库推送/拉取来共享函数更新

### 🖥️ **如何查看和测试更改**

#### 🏠 **本地开发环境设置**
由于函数现在存储在本地JSON文件中，需要在本地运行项目才能查看：

1. **📥 克隆/拉取仓库**
   ```bash
   git clone https://github.com/kei2333/test-workflow-nextjs.git
   # 或者如果已经克隆过：
   git pull origin master
   ```

2. **📦 安装依赖**
   ```bash
   cd test-workflow-nextjs
   npm install
   ```

3. **🚀 启动开发服务器**
   ```bash
   npm run dev
   ```

4. **🌐 在浏览器中查看**
   ```
   http://localhost:3000
   ```

#### 🔄 **共享函数更新**
- **💾 本地更改** - 当你添加/编辑/删除函数时，`data/functions.json` 文件会在本地自动更新
- **📤 分享更新** - 将更改推送到仓库：  
  ```bash
  git add . && git commit -m "更新函数列表" && git push
  ```
- **📥 获取更新** - 其他人需要通过以下命令才能看到你的函数更改：  
  ```bash
  git pull
  ```

### 🎮 **如何使用函数管理功能**

1. **➕ 添加新函数**
   - 点击Functions面板右上角的"Add"按钮
   - 填写函数名称、ID、描述和输入字段
   - 点击"Add Function"保存

2. **✏️ 编辑现有函数**
   - 点击任意函数卡片上的蓝色编辑图标
   - 根据需要修改字段内容
   - 点击"Update Function"保存更改

3. **🗑️ 删除函数**
   - 点击任意函数卡片上的红色删除图标
   - 在确认对话框中确认删除
   - 函数会立即从JSON文件中移除

4. **🔄 构建工作流**
   - 将函数从左侧面板拖拽到工作流画布
   - 为每个函数配置输入值
   - 运行完整的工作流序列

---

# 🔧 Test Workflow Generator - 5-Minute Code Overview

> 🚀 A modern drag-and-drop test workflow builder with beautiful UI and seamless user experience

## 📖 Project Introduction (30 seconds)
This is a modern **drag-and-drop test workflow builder** built with Next.js 15, React 19, and TypeScript. The application allows users to create custom test sequences by dragging functions from a sidebar into a workflow canvas, then execute them with visual feedback.

## 🏗️ Architecture Overview (1 minute)

### 💻 Tech Stack
- **🌐 Frontend**: Next.js 15 with App Router
- **🎨 Styling**: Tailwind CSS v4 with custom gradients and animations
- **📝 Language**: TypeScript for type safety
- **⚛️ UI Framework**: React 19 with modern hooks

### 📁 Project Structure
```
src/app/
├── 📄 page.tsx          # Main workflow interface component
├── 🎯 layout.tsx        # Root layout with fonts
└── 🎨 globals.css       # Global styles and Tailwind
```

## ⚙️ Core Components Breakdown (2 minutes)

### 1. 🧠 State Management (`page.tsx:20-23`)
```typescript
// 📋 Main workflow state - stores array of dropped functions
const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);

// ⏳ Execution state - prevents multiple simultaneous runs
const [isRunning, setIsRunning] = useState(false);

// 🖱️ Drag tracking - identifies which function is being dragged
const [draggedFunction, setDraggedFunction] = useState<string>('');

// 📍 Drop position indicator - shows where item will be inserted
const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
```

### 2. 🖱️ Drag-and-Drop System
- **📋 Functions Panel**: 5 predefined functions (Function1-5) with draggable cards
- **🎯 Drop Handlers**: Support for both canvas drops and precise insertion between items
- **✨ Visual Feedback**: Real-time drag indicators and hover effects

### 3. 🔄 Workflow Execution (`page.tsx:97-111`)
```typescript
const runWorkflow = async () => {
  // 🚫 Prevent execution if workflow is empty
  if (workflowItems.length === 0) {
    alert('Please add functions to your workflow before running.');
    return;
  }

  // 🔒 Set running state to disable UI interactions
  setIsRunning(true);
  
  // 🔄 Execute each function in sequence
  for (let i = 0; i < workflowItems.length; i++) {
    const currentItem = workflowItems[i];
    
    // ⏱️ Add execution delay for better user experience
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 📢 Show execution feedback with specific function name
    alert(`Test ${i + 1}: ${currentItem.name} has been executed`);
  }
  
  // ✅ Reset running state to re-enable UI
  setIsRunning(false);
};
```

## 🎨 UI/UX Features (1 minute)

### ✨ Advanced Styling
- **🪟 Glass-morphism Design**: Backdrop blur with semi-transparent panels
- **🌈 Gradient Animations**: Dynamic color transitions and hover effects
- **🎭 Micro-interactions**: Scale transforms, rotation effects, and loading spinners

### 📱 Responsive Layout
- **📚 Left Panel**: Fixed-width function library (320px)
- **🖼️ Right Panel**: Flexible workflow canvas with overflow handling
- **📲 Mobile-first**: Tailwind responsive classes throughout

### 🎯 User Experience
- **👆 Drag Indicators**: Visual feedback showing where items will be inserted
- **⏳ Loading States**: Animated spinner during workflow execution
- **🚫 Error Handling**: Validation for empty workflows

## 💎 Code Quality & Best Practices (30 seconds)

### 📝 TypeScript Integration
- **🏷️ Interface Definitions**: Strong typing for `WorkflowItem` structure
- **🛡️ Type Safety**: Proper event typing for drag handlers
- **⚛️ Modern React**: Using latest hooks and functional components

### 🔧 Development Setup
- **📏 ESLint**: Next.js recommended configuration
- **🔥 Hot Reload**: Instant development feedback
- **⚡ Build Optimization**: Next.js automatic code splitting

---

## 🚀 Quick Start
```bash
npm run dev
# Open http://localhost:3000
```

**🎬 Demo Flow**: Drag functions → Build workflow → Click "Run Workflow" → See execution alerts

## 🌐 Live Demo

🚀 **Live Site**: [test-workflow-nextjs.vercel.app](https://test-workflow-nextjs.vercel.app)

### 🚀 Deployment Process

This project was deployed to Vercel using the command line interface:

**📋 Deployment Steps Used:**

1. **📦 Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **🔐 Login to Vercel**:
   ```bash
   vercel login
   ```

3. **🚀 Deploy from Project Directory**:
   ```bash
   cd test-workflow-nextjs
   vercel --prod
   ```

4. **⚙️ Vercel Configuration**:
   - 🔧 Framework: Next.js (auto-detected)
   - 🏗️ Build Command: `npm run build`
   - 💻 Development Command: `npm run dev`
   - 📦 Install Command: `npm install`
   - 📁 Output Directory: `.next`

5. **🌐 Custom Domain Setup**:
   ```bash
   vercel domains add test-workflow-nextjs.vercel.app
   vercel alias test-workflow-nextjs.vercel.app
   ```

**🎯 Features Enabled:**
- ⚡ Automatic deployments on git push
- 🔄 Preview deployments for pull requests
- 📊 Build optimization and edge caching
- 🌐 Global CDN distribution

---

## 🎯 Key Features Summary

| Feature | Technology | Description |
|---------|------------|-------------|
| 🖱️ **Drag & Drop** | HTML5 DnD API | Intuitive function placement |
| 🎨 **Modern UI** | Tailwind CSS v4 | Glass-morphism design |
| ⚡ **Performance** | Next.js 15 | Optimized builds & SSG |
| 📝 **Type Safety** | TypeScript | Full type coverage |
| 🔄 **Real-time** | React 19 | Instant visual feedback |

## 🤝 Contributing

Feel free to contribute to this project! Whether it's:
- 🐛 **Bug fixes**
- ✨ **New features** 
- 📚 **Documentation improvements**
- 🎨 **UI/UX enhancements**

## 📄 License

This project is open source and available under the MIT License.

---


**💡 This codebase demonstrates modern React patterns, TypeScript best practices, and advanced CSS techniques in a practical, user-friendly application.**

> 🌟 **Star this repo** if you found it helpful! | 🐦 **Share** with your network | 📝 **Fork** and make it your own
