import { app, BrowserWindow, ipcMain, Notification, dialog, shell, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 1024,
    minHeight: 720,
    title: 'NexNova Technologies - Enterprise HRM Portal',
    backgroundColor: '#020617', // Dark Slate matching theme
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const targetUrl = process.env.APP_URL || 'http://localhost:3000';

  // Load URL
  mainWindow.loadURL(targetUrl).catch((err) => {
    console.warn(`[Desktop App] Connecting to ${targetUrl}... Server might still be starting.`);
    // Fallback loading HTML
    mainWindow?.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getConnectingHtml(targetUrl))}`);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('close', (event) => {
    // If not quitting, minimize to tray
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
    return false;
  });
}

function createTray(): void {
  // Create a simple programmatic tray icon (16x16 emerald dot)
  const canvas = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" rx="4" fill="%2310b981"/><text x="8" y="11" font-size="9" font-weight="bold" fill="%23020617" text-anchor="middle" font-family="sans-serif">N</text></svg>`;
  const img = nativeImage.createFromDataURL(canvas);

  tray = new Tray(img);
  tray.setToolTip('NexNova Technologies Enterprise HRM');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mở Cổng Doanh Nghiệp (NexNova HRM)',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Chấm Công Nhanh',
      click: () => {
        mainWindow?.show();
        mainWindow?.loadURL(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard/attendance`);
      },
    },
    {
      label: 'Xem Bảng Lương & Payslip',
      click: () => {
        mainWindow?.show();
        mainWindow?.loadURL(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard/payroll`);
      },
    },
    { type: 'separator' },
    {
      label: 'Thoát Hoàn Toàn Ứng Dụng',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

// IPC Event Handlers
function setupIpc(): void {
  // 1. Native Windows Notification
  ipcMain.on('app:notification', (_, { title, body }) => {
    if (Notification.isSupported()) {
      new Notification({
        title: title || 'NexNova HRM',
        body: body || '',
      }).show();
    }
  });

  // 2. Native File Save Dialog for PDF Payslip
  ipcMain.handle('app:save-pdf', async (_, { buffer, defaultName }) => {
    if (!mainWindow) return { success: false, error: 'No main window' };

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Lưu Phiếu Lương Điện Tử (Payslip PDF)',
      defaultPath: path.join(app.getPath('downloads'), defaultName || 'Payslip_NexNova.pdf'),
      filters: [{ name: 'Tài liệu PDF (*.pdf)', extensions: ['pdf'] }],
    });

    if (canceled || !filePath) {
      return { success: false, error: 'User canceled save' };
    }

    try {
      await fs.promises.writeFile(filePath, Buffer.from(buffer));
      // Trigger notification
      if (Notification.isSupported()) {
        new Notification({
          title: 'Tải Phiếu Lương Thành Công',
          body: `Đã lưu tệp tại: ${filePath}`,
        }).show();
      }
      return { success: true, filePath };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // 3. Version info
  ipcMain.handle('app:get-version', () => app.getVersion());

  // 4. Open External Browser
  ipcMain.on('app:open-external', (_, url) => {
    if (url) shell.openExternal(url);
  });
}

// Electron Lifecycle
app.whenReady().then(() => {
  setupIpc();
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function getConnectingHtml(url: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>NexNova HRM Desktop - Đang kết nối...</title>
        <style>
          body {
            background-color: #020617;
            color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #1e293b;
            border-top: 4px solid #10b981;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 24px;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h2 { font-size: 20px; font-weight: 700; margin: 0 0 8px 0; color: #10b981; }
          p { font-size: 13px; color: #94a3b8; max-width: 400px; margin: 0 0 20px 0; line-height: 1.5; }
          button {
            background: #10b981;
            color: #020617;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <h2>NexNova Technologies HRM</h2>
        <p>Đang kết nối tới máy chủ dịch vụ (${url}). Ứng dụng sẽ tự động tải giao diện khi dịch vụ khởi động xong.</p>
        <button onclick="location.href='${url}'">Thử Kết Nối Lại</button>
        <script>
          setInterval(() => {
            fetch('${url}', { mode: 'no-cors' })
              .then(() => location.href = '${url}')
              .catch(() => {});
          }, 3000);
        </script>
      </body>
    </html>
  `;
}
