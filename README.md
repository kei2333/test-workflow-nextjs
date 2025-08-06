# Test Workflow Generator - 5-Minute Code Overview

## Project Introduction (30 seconds)
This is a modern **drag-and-drop test workflow builder** built with Next.js 15, React 19, and TypeScript. The application allows users to create custom test sequences by dragging functions from a sidebar into a workflow canvas, then execute them with visual feedback.

## Architecture Overview (1 minute)

### Tech Stack
- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with custom gradients and animations
- **Language**: TypeScript for type safety
- **UI Framework**: React 19 with modern hooks

### Project Structure
```
src/app/
├── page.tsx          # Main workflow interface component
├── layout.tsx        # Root layout with fonts
└── globals.css       # Global styles and Tailwind
```

## Core Components Breakdown (2 minutes)

### 1. State Management (`page.tsx:20-23`)
```typescript
const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
const [isRunning, setIsRunning] = useState(false);
const [draggedFunction, setDraggedFunction] = useState<string>('');
const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
```

### 2. Drag-and-Drop System
- **Functions Panel**: 5 predefined functions (Function1-5) with draggable cards
- **Drop Handlers**: Support for both canvas drops and precise insertion between items
- **Visual Feedback**: Real-time drag indicators and hover effects

### 3. Workflow Execution (`page.tsx:97-111`)
```typescript
const runWorkflow = async () => {
  setIsRunning(true);
  for (let i = 0; i < workflowItems.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`Test ${i + 1} has been executed`);
  }
  setIsRunning(false);
};
```

## UI/UX Features (1 minute)

### Advanced Styling
- **Glass-morphism Design**: Backdrop blur with semi-transparent panels
- **Gradient Animations**: Dynamic color transitions and hover effects
- **Micro-interactions**: Scale transforms, rotation effects, and loading spinners

### Responsive Layout
- **Left Panel**: Fixed-width function library (320px)
- **Right Panel**: Flexible workflow canvas with overflow handling
- **Mobile-first**: Tailwind responsive classes throughout

### User Experience
- **Drag Indicators**: Visual feedback showing where items will be inserted
- **Loading States**: Animated spinner during workflow execution
- **Error Handling**: Validation for empty workflows

## Code Quality & Best Practices (30 seconds)

### TypeScript Integration
- **Interface Definitions**: Strong typing for `WorkflowItem` structure
- **Type Safety**: Proper event typing for drag handlers
- **Modern React**: Using latest hooks and functional components

### Development Setup
- **ESLint**: Next.js recommended configuration
- **Hot Reload**: Instant development feedback
- **Build Optimization**: Next.js automatic code splitting

---

## Quick Start
```bash
npm run dev
# Open http://localhost:3000
```

**Demo Flow**: Drag functions → Build workflow → Click "Run Workflow" → See execution alerts

## Live Demo

🚀 **Live Site**: [test-workflow-nextjs.vercel.app](https://test-workflow-nextjs.vercel.app)

### Deployment Process

This project was deployed to Vercel using the command line interface:

**Deployment Steps Used:**

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from Project Directory**:
   ```bash
   cd test-workflow-nextjs
   vercel --prod
   ```

4. **Vercel Configuration**:
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Development Command: `npm run dev`
   - Install Command: `npm install`
   - Output Directory: `.next`

5. **Custom Domain Setup**:
   ```bash
   vercel domains add test-workflow-nextjs.vercel.app
   vercel alias test-workflow-nextjs.vercel.app
   ```

**Features Enabled:**
- ⚡ Automatic deployments on git push
- 🔄 Preview deployments for pull requests
- 📊 Build optimization and edge caching
- 🌐 Global CDN distribution

---

This codebase demonstrates modern React patterns, TypeScript best practices, and advanced CSS techniques in a practical, user-friendly application.
