#!/usr/bin/env node
/**
 * 服务器管理脚本
 * 检查前后端服务器状态，如果未运行则启动
 * 
 * 使用: node ./scripts/check-and-start-servers.js
 */

const { spawn, exec } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

const PORTS_TO_CLEAN = [3000, 5001]; // Ports used by frontend/backend dev servers
const FRONTEND_URL = 'http://localhost:3000';
function getChromeWindowArgs() {
  if (process.platform === 'win32' || process.platform === 'linux') {
    return ['--start-maximized'];
  }

  // macOS does not support --start-maximized; fallback to default behavior
  return [];
}

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

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, { shell: true }, (error, stdout, stderr) => {
      if (error && error.code !== 1) {
        return reject(error);
      }
      resolve({ stdout, stderr, code: error ? error.code : 0 });
    });
  });
}

async function getPidsForPort(port) {
  if (process.platform === 'win32') {
    const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
    const pids = new Set();

    stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const parts = line.split(/\s+/);
        if (parts.length < 4) {
          return;
        }

        const localAddress = parts[1] || '';
        if (!localAddress.endsWith(`:${port}`)) {
          return;
        }

        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          pids.add(pid);
        }
      });

    return Array.from(pids);
  }

  const { stdout } = await execPromise(`lsof -ti tcp:${port}`);
  return stdout
    .split(/\s+/)
    .map((pid) => pid.trim())
    .filter(Boolean);
}

async function killPid(pid) {
  const command = process.platform === 'win32'
    ? `taskkill /PID ${pid} /F /T`
    : `kill -9 ${pid}`;

  try {
    await execPromise(command);
    console.log(`[INFO] 已强制结束进程 PID=${pid}`);
  } catch (err) {
    console.log(`[WARN] 无法结束进程 PID=${pid}: ${err.message}`);
  }
}

async function cleanupPorts(ports) {
  if (!ports.length) {
    return;
  }

  console.log(`[INFO] 检查端口占用: ${ports.join(', ')}`);

  for (const port of ports) {
    try {
      const pids = await getPidsForPort(port);

      if (pids.length === 0) {
        console.log(`[INFO] 端口 ${port} 当前未被占用`);
        continue;
      }

      console.log(`[INFO] 端口 ${port} 被以下进程占用: ${pids.join(', ')}`);
      for (const pid of pids) {
        await killPid(pid);
      }
    } catch (err) {
      console.log(`[WARN] 检查端口 ${port} 时出错: ${err.message}`);
    }
  }
}

function getChromeCandidatesWindows() {
  const candidates = [];

  const pushIfEnv = (envKey) => {
    const base = process.env[envKey];
    if (base) {
      candidates.push(path.join(base, 'Google', 'Chrome', 'Application', 'chrome.exe'));
    }
  };

  pushIfEnv('PROGRAMFILES');
  pushIfEnv('PROGRAMFILES(X86)');
  pushIfEnv('LOCALAPPDATA');

  return candidates;
}

async function openChrome(url) {
  const windowArgs = getChromeWindowArgs();

  if (process.platform === 'win32') {
    const candidates = getChromeCandidatesWindows().filter((candidate) => {
      try {
        return existsSync(candidate);
      } catch (err) {
        return false;
      }
    });

    for (const executable of candidates) {
      try {
        const child = spawn(executable, [...windowArgs, url], { detached: true, stdio: 'ignore' });
        child.unref();
        console.log(`[INFO] 已在 Chrome 打开: ${url}`);
        return true;
      } catch (err) {
        // continue trying other candidates
      }
    }

    try {
      const argSegment = windowArgs.length ? `${windowArgs.join(' ')} ` : '';
      await execPromise(`start "" chrome ${argSegment}"${url}"`);
      console.log(`[INFO] 已尝试使用 Chrome 打开: ${url}`);
      return true;
    } catch (err) {
      // fallback handled below
    }
  } else if (process.platform === 'darwin') {
    try {
      const command = windowArgs.length
        ? `open -a "Google Chrome" --args ${windowArgs.join(' ')} "${url}"`
        : `open -a "Google Chrome" "${url}"`;
      await execPromise(command);
      console.log(`[INFO] 已在 Chrome 打开: ${url}`);
      return true;
    } catch (err) {
      // fallback handled below
    }
  } else {
    const linuxCandidates = ['google-chrome', 'chromium', 'chromium-browser'];
    for (const executable of linuxCandidates) {
      try {
        const child = spawn(executable, [...windowArgs, url], { detached: true, stdio: 'ignore' });
        child.unref();
        console.log(`[INFO] 已在 Chrome 打开: ${url}`);
        return true;
      } catch (err) {
        // continue trying other candidates
      }
    }
  }

  const fallbackCommand = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;

  try {
    await execPromise(fallbackCommand);
    console.log(`[INFO] 未找到 Chrome，已使用默认浏览器打开: ${url}（窗口大小可能无法自动调整）`);
    return true;
  } catch (err) {
    console.log(`[WARN] 无法自动打开浏览器访问 ${url}: ${err.message}`);
    return false;
  }
}

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

  await cleanupPorts(PORTS_TO_CLEAN);
  console.log('');

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

  if (!isTestMode) {
    await openChrome(FRONTEND_URL);
  }

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