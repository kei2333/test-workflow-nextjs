#!/usr/bin/env node
/*
 * Ensure frontend and backend are running before running Playwright tests.
 * - If a server is not healthy, start it and wait until healthy (or timeout).
 * - After tests finish, stop only the servers this script started.
 */

const { spawn } = require('child_process');

const servers = [
  {
    name: 'frontend',
    checkUrl: 'http://localhost:3000',
    startCmd: { 
      command: process.platform === 'win32' ? 'npm.cmd' : 'npm', 
      args: ['run', 'dev'] 
    },
    cwd: process.cwd(),
  },
  {
    name: 'backend',
    checkUrl: 'http://localhost:5001/api/health',
    startCmd: { 
      command: process.platform === 'win32' ? 'python' : 'python3', 
      args: ['backend/app.py'] 
    },
    cwd: process.cwd(),
  }
];

const DEFAULT_TIMEOUT = 300000; // 5 minutes for slow mainframe connections
const CHECK_INTERVAL = 3000; // Check every 3 seconds

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function isHealthy(url) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function waitForHealthy(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await isHealthy(url);
    if (ok) return true;
    await sleep(CHECK_INTERVAL);
  }
  return false;
}

function startProcess(startCmd, cwd, name) {
  console.log(`[INFO] 启动 ${name}: ${startCmd.command} ${startCmd.args.join(' ')}`);
  const child = spawn(startCmd.command, startCmd.args, {
    cwd,
    stdio: ['ignore', 'inherit', 'inherit']
  });
  child.on('exit', (code, sig) => {
    console.log(`[INFO] ${name} 进程退出 code=${code} signal=${sig}`);
  });
  return child;
}

async function main() {
  const startedChildren = [];

  for (const s of servers) {
    process.stdout.write(`[INFO] 检查 ${s.name} (${s.checkUrl})... `);
    const ok = await isHealthy(s.checkUrl);
    if (ok) {
      console.log('已运行');
      continue;
    }

    console.log('未运行，准备启动');
    
    // Run setup command if defined (e.g., install dependencies)
    if (s.setupCmd) {
      console.log(`[INFO] 运行 ${s.name} 安装依赖: ${s.setupCmd.command} ${s.setupCmd.args.join(' ')}`);
      const setupProc = spawn(s.setupCmd.command, s.setupCmd.args, {
        cwd: s.cwd,
        stdio: 'inherit'
      });
      
      const setupResult = await new Promise((resolve) => {
        setupProc.on('exit', (code) => resolve(code));
      });
      
      if (setupResult !== 0) {
        console.error(`[ERROR] ${s.name} 依赖安装失败，退出码: ${setupResult}`);
        process.exit(1);
      }
      console.log(`[INFO] ${s.name} 依赖安装完成`);
    }
    
    const child = startProcess(s.startCmd, s.cwd, s.name);
    startedChildren.push(child);

    const healthy = await waitForHealthy(s.checkUrl, DEFAULT_TIMEOUT);
    if (!healthy) {
      console.error(`[ERROR] 启动 ${s.name} 超时或检测失败 (${s.checkUrl})`);
      // Kill children we started before exiting
      for (const c of startedChildren) {
        try { 
          const signal = process.platform === 'win32' ? 'SIGTERM' : 'SIGINT';
          c.kill(signal);
        } catch (e) {}
      }
      process.exit(1);
    }
    console.log(`[INFO] ${s.name} 已可用 (${s.checkUrl})`);
  }

  // Run Playwright tests with passed arguments
  const args = process.argv.slice(2);
  const playwrightArgs = ['playwright', 'test', 'test-all.spec.js', ...args];
  console.log('[INFO] 启动 Playwright 测试:', playwrightArgs.join(' '));

  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const testProc = spawn(npxCmd, playwrightArgs, { stdio: 'inherit' });

  testProc.on('exit', async (code) => {
    console.log(`[INFO] Playwright 测试退出，code=${code}`);
    // Clean up only the servers we started
    if (startedChildren.length) {
      console.log('[INFO] 停止由脚本启动的服务器...');
      for (const c of startedChildren) {
        try {
          // Use appropriate signal for platform
          const signal = process.platform === 'win32' ? 'SIGTERM' : 'SIGINT';
          c.kill(signal);
        } catch (e) {}
      }
      // Give them some time to exit gracefully
      await sleep(2000);
      for (const c of startedChildren) {
        try { 
          if (!c.killed) {
            const signal = process.platform === 'win32' ? 'SIGKILL' : 'SIGKILL';
            c.kill(signal);
          }
        } catch (e) {}
      }
    }
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error('[ERROR] 运行脚本失败:', err);
  process.exit(1);
});
