const { app, BrowserWindow, Menu, dialog, shell, session } = require('electron');
const path = require('path');

let win;
let btCallback = null;
let btTimer = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 700,
    minHeight: 500,
    backgroundColor: '#0a0a12',
    title: 'Kuduko OS',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'index.html'));

  // F11 tam ekran, F12 geliştirici araçları
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') win.setFullScreen(!win.isFullScreen());
    if (input.key === 'F12') win.webContents.toggleDevTools();
  });

  // Dış bağlantılar (Tarayıcı uygulamasındaki ↗) varsayılan tarayıcıda açılsın
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Kamera, mikrofon, Bluetooth vb. izinleri otomatik ver
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(true));
  session.defaultSession.setPermissionCheckHandler(() => true);
  session.defaultSession.setDevicePermissionHandler(() => true);

  // Web Bluetooth: cihaz seçme penceresi
  win.webContents.on('select-bluetooth-device', (event, devices, callback) => {
    event.preventDefault();
    btCallback = callback;
    clearTimeout(btTimer);
    btTimer = setTimeout(async () => {
      const list = devices.slice(0, 8);
      if (!list.length) { callback(''); btCallback = null; return; }
      const r = await dialog.showMessageBox(win, {
        type: 'question',
        title: 'Bluetooth cihazı seç',
        message: 'Bağlanılacak cihazı seçin',
        buttons: [...list.map(d => d.deviceName || d.deviceId), 'İptal'],
        cancelId: list.length
      });
      callback(r.response < list.length ? list[r.response].deviceId : '');
      btCallback = null;
    }, 3000);
  });
  session.defaultSession.setBluetoothPairingHandler?.((details, cb) => cb({ confirmed: true }));
}

const lock = app.requestSingleInstanceLock();
if (!lock) app.quit();
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(createWindow);
}
app.on('window-all-closed', () => app.quit());
