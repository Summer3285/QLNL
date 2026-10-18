const fs = require('fs');
const net = require('net');
const { spawn } = require('child_process');
const path = require('path');

const appData = process.env.APPDATA || path.join(process.env.USERPROFILE || 'C:\\Users\\ADMIN', 'AppData', 'Roaming');
const logDir = path.join(appData, 'NexNovaHRM', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const mainLogPath = path.join(logDir, 'autostart.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(mainLogPath, line);
  } catch (e) {}
  console.log(msg);
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

function findNpmPath() {
  const candidates = [
    'C:\\Program Files\\nodejs\\npm.cmd',
    'C:\\Program Files (x86)\\nodejs\\npm.cmd',
    path.join(process.env.APPDATA || '', 'npm', 'npm.cmd'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return 'npm.cmd';
}

async function main() {
  log('Starting NexNova HRM background service launcher...');
  // Unicode escape sequence guarantees zero mojibake/encoding issues across all Windows environments
  const projectRoot = 'd:\\T\u00E0i li\u1EC7u h\u1ECDc t\u1EADp\\HTTT QLNL';
  const npmCmd = findNpmPath();
  log(`Using npm binary: ${npmCmd}`);
  log(`Target project root: ${projectRoot}`);

  // 1. Backend on port 5000
  const backendRunning = await isPortOpen(5000);
  if (backendRunning) {
    log('Backend already running on port 5000.');
  } else {
    log('Backend not detected on port 5000. Launching backend service...');
    const backendLog = fs.openSync(path.join(logDir, 'backend.log'), 'a');
    const backend = spawn('cmd.exe', ['/c', npmCmd, 'run', 'dev'], {
      cwd: path.join(projectRoot, 'backend'),
      detached: true,
      stdio: ['ignore', backendLog, backendLog],
      windowsHide: true,
    });
    backend.unref();
    log(`Backend process spawned with PID: ${backend.pid}`);
  }

  // 2. Frontend on port 3000
  const frontendRunning = await isPortOpen(3000);
  if (frontendRunning) {
    log('Frontend already running on port 3000.');
  } else {
    log('Frontend not detected on port 3000. Launching frontend service...');
    const frontendLog = fs.openSync(path.join(logDir, 'frontend.log'), 'a');
    const frontend = spawn('cmd.exe', ['/c', npmCmd, 'run', 'dev'], {
      cwd: path.join(projectRoot, 'frontend'),
      detached: true,
      stdio: ['ignore', frontendLog, frontendLog],
      windowsHide: true,
    });
    frontend.unref();
    log(`Frontend process spawned with PID: ${frontend.pid}`);
  }

  log('Service check completed successfully.');
}

main().catch((err) => {
  log(`Fatal error during launcher execution: ${err.stack || err.message}`);
});
