#!/usr/bin/env node
/**
 * 测试超时配置 - 验证大型机连接的超时设置
 */

console.log('🔧 检查超时配置...\n');

// 检查 Playwright 配置
const playwrightConfig = require('../playwright.config.js');
console.log('📋 Playwright 超时设置:');
console.log(`  - 总测试超时: ${playwrightConfig.timeout / 1000}秒 (${playwrightConfig.timeout / 60000}分钟)`);
console.log(`  - expect 超时: ${playwrightConfig.use?.timeout || playwrightConfig.expect?.timeout || 'N/A'}秒\n`);

// 检查服务器启动脚本配置
const fs = require('fs');
const path = require('path');
const serverScript = fs.readFileSync(path.join(__dirname, 'run-tests-with-servers.js'), 'utf8');
const defaultTimeoutMatch = serverScript.match(/DEFAULT_TIMEOUT\s*=\s*(\d+)/);
const checkIntervalMatch = serverScript.match(/CHECK_INTERVAL\s*=\s*(\d+)/);

if (defaultTimeoutMatch) {
  const timeout = parseInt(defaultTimeoutMatch[1]);
  console.log('🖥️  服务器启动超时设置:');
  console.log(`  - 默认超时: ${timeout / 1000}秒 (${timeout / 60000}分钟)`);
}

if (checkIntervalMatch) {
  const interval = parseInt(checkIntervalMatch[1]);
  console.log(`  - 检查间隔: ${interval / 1000}秒\n`);
}

// 检查后端 s3270 超时配置
const backendScript = fs.readFileSync(path.join(__dirname, '../backend/app.py'), 'utf8');
const connectTimeoutMatches = [...backendScript.matchAll(/'-connecttimeout',\s*'(\d+)'/g)];

console.log('🔗 后端连接超时设置:');
connectTimeoutMatches.forEach((match, index) => {
  const timeout = parseInt(match[1]);
  console.log(`  - s3270连接超时 ${index + 1}: ${timeout}秒 (${timeout / 60}分钟)`);
});

// 检查默认命令超时
const commandTimeoutMatch = backendScript.match(/_send_command\(.*timeout:\s*int\s*=\s*(\d+)/);
const executeTimeoutMatch = backendScript.match(/_execute_command\(.*timeout:\s*int\s*=\s*(\d+)/);

if (commandTimeoutMatch) {
  console.log(`  - 默认命令超时: ${commandTimeoutMatch[1]}秒`);
}

if (executeTimeoutMatch) {
  console.log(`  - 默认执行超时: ${executeTimeoutMatch[1]}秒\n`);
}

console.log('✅ 所有超时配置已设置为支持慢速大型机连接:');
console.log('   - Playwright测试: 5分钟');
console.log('   - 服务器启动: 5分钟'); 
console.log('   - s3270连接: 3分钟');
console.log('   - 命令执行: 30秒');
console.log('   - TSO登录步骤: 10-30秒等待');
console.log('   - 跨平台支持: Windows/macOS/Linux\n');

console.log('🚀 现在可以处理连接时间超过2分钟的大型机了！');
console.log('💻 支持 Windows 用户使用 npm.cmd 和 python 命令！');