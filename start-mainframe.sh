#!/bin/bash

# IBM Mainframe 连接功能 - 快速启动脚本

echo "🚀 启动 IBM Mainframe 连接功能..."
echo "=================================="

# 检查 Python 环境
echo "📋 检查 Python 环境..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装 Python 3.8+"
    exit 1
fi

echo "✅ Python 版本: $(python3 --version)"

# 检查 Node.js 环境
echo "📋 检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 创建 Python 虚拟环境（如果不存在）
if [ ! -d "backend/venv" ]; then
    echo "🔧 创建 Python 虚拟环境..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# 安装 Python 依赖
echo "📦 安装 Python 依赖..."
cd backend

# 激活虚拟环境
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # macOS/Linux
    source venv/bin/activate
fi

pip install -r requirements.txt

cd ..

# 安装 Node.js 依赖
echo "📦 安装 Node.js 依赖..."
npm install

echo ""
echo "🎉 安装完成！"
echo ""
echo "📖 启动指南："
echo "1. 启动后端服务："
echo "   cd backend && python3 app.py"
echo ""
echo "2. 启动前端服务（在新终端中）："
echo "   npm run dev"
echo ""
echo "3. 访问应用："
echo "   主页: http://localhost:3000"
echo "   Mainframe: http://localhost:3000/mainframe"
echo ""
echo "💡 开发提示："
echo "- 如果没有安装 py3270，后端会以 Mock 模式运行"
echo "- Mock 模式测试凭据: username=test, password=test"
echo "- 详细文档请查看 MAINFRAME_SETUP.md"
echo ""
echo "🔧 故障排除："
echo "- 如果后端启动失败，请检查 Python 依赖安装"
echo "- 如果前端无法连接后端，请确认后端服务正在运行"
echo ""