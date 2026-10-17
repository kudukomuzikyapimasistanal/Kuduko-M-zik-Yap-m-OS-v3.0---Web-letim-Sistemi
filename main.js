const { app, BrowserWindow, Menu, dialog, shell, session, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function loadCfg() {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8')); }
  catch { return {}; }
}

ipcMain.handle('google-key', () => loadCfg().google_api_key || '');

ipcMain.handle('gemini', async (_e, messages) => {
  const cfg = loadCfg();
  if (!cfg.gemini_api_key) return 'Hata: config.json içinde gemini_api_key yok.';
  const model = cfg.gemini_model || 'gemini-flash-latest';
  const body = {
    systemInstruction: { parts: [{ text: 'Kuduko OS içindeki Türkçe asistansın. Kısa ve net yanıt ver.' }] },
    contents: (messages || []).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content) }]
    }))
  };
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': cfg.gemini_api_key },
      body: JSON.stringify(body)
    });
    const j = await r.json();
    if (!r.ok) return 'Hata: ' + (j.error?.message || r.status);
    return j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || 'Yanıt alınamadı.';
  } catch (e) { return 'Bağlantı hatası: ' + e.message; }
});

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
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
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
