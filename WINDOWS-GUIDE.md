# Windows 兼容性指南

## 概述
测试框架现在完全支持 Windows 用户，包括自动检测和使用正确的命令。

## Windows 特定配置

### 1. 命令兼容性
- **npm**: 自动使用 `npm.cmd` 而不是 `npm`
- **npx**: 自动使用 `npx.cmd` 而不是 `npx`  
- **python**: 使用 `python` 而不是 `python3`
- **进程信号**: 使用 `SIGTERM` 而不是 `SIGINT`

### 2. s3270 路径支持
系统会自动查找 Windows 版本的 s3270：
- `C:\Program Files\wc3270\s3270.exe`
- `C:\Program Files (x86)\wc3270\s3270.exe`
- PATH 环境变量中的 `s3270`

### 3. 前提条件

#### 安装 Node.js
从 [nodejs.org](https://nodejs.org/) 下载并安装 Node.js LTS 版本

#### 安装 Python
从 [python.org](https://python.org/) 下载并安装 Python 3.8+ 

#### 安装 wc3270 (可选)
如需要真实大型机连接：
1. 下载 [wc3270](http://x3270.bgp.nu/download.html)
2. 安装到默认路径或添加到 PATH

### 4. 使用方法

在 PowerShell 或 Command Prompt 中：

```powershell
# 克隆项目
git clone <repository-url>
cd test-workflow-nextjs

# 安装依赖
npm install

# 运行完整测试（自动启动服务）
npm run test:all

# 运行无界面测试
npm run test:all:headless

# 检查超时配置
node scripts/check-timeouts.js
```

### 5. 故障排除

#### Python 命令问题
如果 `python` 命令不可用，请：
1. 确保 Python 已安装
2. 将 Python 添加到 PATH 环境变量
3. 或者在 PowerShell 中运行：`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

#### npm 权限问题
在 PowerShell 中以管理员身份运行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

#### 端口占用问题
如果端口被占用：
```powershell
# 查看端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :5001

# 终止进程（替换 <PID> 为实际进程ID）
taskkill /PID <PID> /F
```

### 6. 环境变量设置

建议添加到系统 PATH：
- Python 安装目录
- Node.js 安装目录
- wc3270 安装目录（如果安装了）

### 7. 已知限制

1. **WSL 兼容性**: 在 WSL (Windows Subsystem for Linux) 中运行时，系统会使用 Linux 命令
2. **防火墙**: Windows 防火墙可能会阻止端口访问，请允许 Node.js 和 Python 的网络访问
3. **杀毒软件**: 某些杀毒软件可能会干扰进程启动，请添加项目目录到白名单

## 验证安装

运行以下命令验证环境：

```powershell
# 检查 Node.js
node --version
npm --version

# 检查 Python
python --version

# 检查项目配置
node scripts/check-timeouts.js
```

所有命令都应该返回版本信息而不是错误。

## 支持

如果遇到 Windows 特定的问题：
1. 确认所有前提条件都已满足
2. 检查环境变量设置
3. 尝试以管理员权限运行
4. 查看错误日志中的具体错误信息