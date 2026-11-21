const { spawn } = require('child_process');
const path = require('path');

// Ensure Windows System32 paths are in PATH even if missing from user/machine environment
const winSystemPaths = [
  'C:\\Windows\\system32',
  'C:\\Windows',
  'C:\\Windows\\System32\\Wbem',
  'C:\\Windows\\System32\\WindowsPowerShell\\v1.0',
];
const currentPath = process.env.PATH || '';
const enrichedPath = `${winSystemPaths.join(';')};${currentPath}`;
process.env.PATH = enrichedPath;

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const shellCmd = process.env.ComSpec || (isWin ? 'C:\\Windows\\System32\\cmd.exe' : true);

console.log('====================================================');
console.log('🚀 Starting JobConnect AI Backend & Frontend...');
console.log('====================================================\n');

// Prefix log helper
const logWithPrefix = (prefix, color, data) => {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      console.log(`\x1b[${color}m[${prefix}]\x1b[0m ${line}`);
    }
  });
};

// Spawn backend
const backend = spawn(npmCmd, ['--prefix', 'backend', 'run', 'dev'], {
  env: { ...process.env, PATH: enrichedPath },
  shell: shellCmd,
});

backend.stdout.on('data', (data) => logWithPrefix('BACKEND', '34', data)); // Blue
backend.stderr.on('data', (data) => logWithPrefix('BACKEND', '31', data)); // Red

backend.on('error', (err) => {
  console.error('\x1b[31m[BACKEND ERROR]\x1b[0m', err.message);
});

// Spawn frontend
const frontend = spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], {
  env: { ...process.env, PATH: enrichedPath },
  shell: shellCmd,
});

frontend.stdout.on('data', (data) => logWithPrefix('FRONTEND', '32', data)); // Green
frontend.stderr.on('data', (data) => logWithPrefix('FRONTEND', '31', data)); // Red

frontend.on('error', (err) => {
  console.error('\x1b[31m[FRONTEND ERROR]\x1b[0m', err.message);
});

// Handle graceful exit on Ctrl+C
const handleExit = () => {
  console.log('\n\n[JobConnect AI] Gracefully stopping services...');
  try {
    backend.kill();
  } catch (e) {}
  try {
    frontend.kill();
  } catch (e) {}
  process.exit();
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
