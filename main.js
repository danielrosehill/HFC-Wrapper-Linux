const { app, BrowserWindow, shell, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

// Application version
const APP_VERSION = '1.0.0';

// Keep a global reference of the window and tray objects
let mainWindow;
let tray;
let isQuitting = false;

// URL for the HFC alerts
const HFC_URL = 'https://www.oref.org.il/eng/alerts-history';

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: `HFC Alerts (Unofficial) v${APP_VERSION}`
  });

  // Load the HFC URL
  mainWindow.loadURL(HFC_URL);

  // Inject custom JS after page loads
  mainWindow.webContents.on('did-finish-load', () => {
    const injectScript = fs.readFileSync(path.join(__dirname, 'inject.js'), 'utf8');
    mainWindow.webContents.executeJavaScript(injectScript);
    
    // Set the window title with version
    mainWindow.setTitle(`HFC Alerts (Unofficial) v${APP_VERSION}`);
  });

  // Handle external links - open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle close event - minimize to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  // Create custom context menu with "Open in Browser" option
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open in Browser',
      click: () => {
        shell.openExternal(HFC_URL);
      }
    },
    {
      label: 'Refresh',
      click: () => {
        mainWindow.reload();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  // Set up right-click context menu
  mainWindow.webContents.on('context-menu', (e) => {
    contextMenu.popup();
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Refresh',
      click: () => {
        mainWindow.reload();
      }
    },
    {
      label: 'Open in Browser',
      click: () => {
        shell.openExternal(HFC_URL);
      }
    },
    { type: 'separator' },
    {
      label: `Version ${APP_VERSION}`,
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip(`HFC Alerts (Unofficial) v${APP_VERSION}`);
  tray.setContextMenu(contextMenu);
  
  // Show window when clicking on tray icon
  tray.on('click', () => {
    mainWindow.show();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();
  createTray();
  
  // Enable audio
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle the app quitting
app.on('before-quit', () => {
  isQuitting = true;
});

// IPC handlers
ipcMain.on('open-in-browser', () => {
  shell.openExternal(HFC_URL);
});
