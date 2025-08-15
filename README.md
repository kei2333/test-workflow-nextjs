# 🔧 Test Workflow Generator

> 🚀 A modern drag-and-drop test workflow builder with dynamic function management

## 🆕 Latest Updates - Function Management System

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
    
    // ⏱️ Simulate function execution time (1 second delay)
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
