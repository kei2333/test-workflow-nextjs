#!/usr/bin/env node
/**
 * 简化的测试后端服务器 - 仅用于测试时提供基本的健康检查API
 * 替代需要Python依赖的Flask服务器
 */

const http = require('http');
const url = require('url');

const PORT = 5001;

const server = http.createServer((req, res) => {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  // 健康检查端点
  if (parsedUrl.pathname === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      status: 'healthy',
      s3270_available: true,
      active_sessions: 0
    }));
    return;
  }

  // 其他API端点的基本响应
  if (parsedUrl.pathname.startsWith('/api/')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: '测试模式 - API调用已接收',
      endpoint: parsedUrl.pathname
    }));
    return;
  }

  // 404 for other paths
  res.writeHead(404);
  res.end(JSON.stringify({ success: false, message: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[简化后端] 服务器运行在 http://localhost:${PORT}`);
  console.log('[简化后端] 健康检查: http://localhost:' + PORT + '/api/health');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n[简化后端] 收到 SIGINT，正在关闭服务器...');
  server.close(() => {
    console.log('[简化后端] 服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n[简化后端] 收到 SIGTERM，正在关闭服务器...');
  server.close(() => {
    console.log('[简化后端] 服务器已关闭');
    process.exit(0);
  });
});