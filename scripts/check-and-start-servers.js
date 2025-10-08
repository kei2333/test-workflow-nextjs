#!/usr/bin/env node
/**
 * 服务器管理脚本
 * 检查前后端服务器状态，如果未运行则启动
 * 
 * 使用: node ./scripts/check-and-start-servers.js
 */

const { spawn } = require('child_process');

const servers = [
  {
    name: '前端服务器',
    checkUrl: 'http://localhost:3000',
    startCmd: { 
      command: 'npm', 
      args: ['run', 'dev'] 
    },
    cwd: process.cwd(),
  },
  {
    name: '后端服务器',
    checkUrl: 'http://localhost:5001/api/health',
    startCmd: { 
      command: process.platform === 'win32' ? 'python' : 'python3', 
      args: ['backend/app.py'] 
    },
    cwd: process.cwd(),
  }
];

const CHECK_TIMEOUT = 5000; // 5 seconds to check health
const STARTUP_TIMEOUT = 120000; // 2 minutes to wait for startup

async function sleep(ms) { 
  return new Promise((r) => setTimeout(r, ms)); 
}

async function isHealthy(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT);
    
    const res = await fetch(url, { 
      signal: controller.signal,
      method: 'GET'
    });
    
    clearTimeout(timeoutId);
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function waitForHealthy(url, timeoutMs, name) {
  const start = Date.now();
  console.log(`[INFO] 等待 ${name} 启动...`);
  
  while (Date.now() - start < timeoutMs) {
    const ok = await isHealthy(url);
    if (ok) {
      console.log(`[SUCCESS] ${name} 已启动并可用 (${url})`);
      return true;
    }
    
    // 每10秒显示一次等待信息
    if ((Date.now() - start) % 10000 < 3000) {
      console.log(`[INFO] 仍在等待 ${name} 启动... (${Math.floor((Date.now() - start) / 1000)}s)`);
    }
    
    await sleep(3000);
  }
  return false;
}

function startProcess(startCmd, cwd, name) {
  console.log(`[INFO] 启动 ${name}: ${startCmd.command} ${startCmd.args.join(' ')}`);
  
  const spawnOptions = {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe']
  };
  
  // On Windows, we need to set shell: true for .cmd files
  if (process.platform === 'win32') {
    spawnOptions.shell = true;
  }
  
  const child = spawn(startCmd.command, startCmd.args, spawnOptions);
  
  // 显示启动信息但不显示所有输出
  let startupComplete = false;
  
  child.stdout.on('data', (data) => {
    const output = data.toString();
    if (!startupComplete && (output.includes('Ready') || output.includes('listening') || output.includes('started'))) {
      console.log(`[INFO] ${name} 启动信息: ${output.trim()}`);
      startupComplete = true;
    }
  });
  
  child.stderr.on('data', (data) => {
    const error = data.toString();
    if (error.includes('Error') || error.includes('error')) {
      console.log(`[WARN] ${name} 错误信息: ${error.trim()}`);
    }
  });
  
  child.on('exit', (code, sig) => {
    console.log(`[INFO] ${name} 进程退出 code=${code} signal=${sig}`);
  });
  
  child.on('error', (err) => {
    console.error(`[ERROR] ${name} 进程启动失败:`, err.message);
  });
  
  return child;
}

async function main() {
  console.log('\n========================================');
  console.log('检查服务器状态');
  console.log('========================================\n');
  
  const startedChildren = [];
  let allHealthy = true;

  for (const s of servers) {
    process.stdout.write(`[INFO] 检查 ${s.name} (${s.checkUrl})... `);
    const ok = await isHealthy(s.checkUrl);
    
    if (ok) {
      console.log('✅ 已运行');
      continue;
    }

    console.log('❌ 未运行');
    allHealthy = false;
    
    const child = startProcess(s.startCmd, s.cwd, s.name);
    startedChildren.push({ child, name: s.name, url: s.checkUrl });

    const healthy = await waitForHealthy(s.checkUrl, STARTUP_TIMEOUT, s.name);
    if (!healthy) {
      console.error(`[ERROR] 启动 ${s.name} 超时 (${s.checkUrl})`);
      console.error(`[ERROR] 请检查端口是否被占用或手动启动服务`);
      process.exit(1);
    }
  }

  if (allHealthy) {
    console.log('\n✅ 所有服务器都已运行！');
  } else {
    console.log(`\n✅ 已启动 ${startedChildren.length} 个服务器！`);
  }
  
  console.log('\n========================================');
  console.log('服务器状态');
  console.log('========================================');
  console.log('前端: http://localhost:3000');
  console.log('后端: http://localhost:5001');
  console.log('后端健康检查: http://localhost:5001/api/health');
  console.log('========================================\n');
  
  // 检查是否在测试模式下运行 (通过环境变量或参数)
  const isTestMode = process.env.npm_lifecycle_event === 'test' || process.argv.includes('--test-mode');
  
  if (startedChildren.length > 0 && !isTestMode) {
    console.log('💡 提示:');
    console.log('  - 服务器将保持运行');
    console.log('  - 使用 Ctrl+C 可以停止此脚本和所有启动的服务器');
    console.log('  - 或者关闭终端窗口来停止服务器\n');
    
    // 保持脚本运行，监听退出信号
    process.on('SIGINT', () => {
      console.log('\n[INFO] 收到停止信号，正在关闭服务器...');
      
      for (const item of startedChildren) {
        try {
          const signal = process.platform === 'win32' ? 'SIGTERM' : 'SIGINT';
          item.child.kill(signal);
          console.log(`[INFO] 已发送停止信号给 ${item.name}`);
        } catch (e) {
          console.log(`[WARN] 无法停止 ${item.name}: ${e.message}`);
        }
      }
      
      process.exit(0);
    });
    
    // 保持进程运行
    process.stdin.resume();
  } else if (isTestMode) {
    console.log('💡 服务器已准备就绪，继续执行测试...\n');
  }
}

main().catch((err) => {
  console.error('[ERROR] 脚本执行失败:', err);
  process.exit(1);
});