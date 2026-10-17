const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('kuduko', {
  gemini: (messages) => ipcRenderer.invoke('gemini', messages),
  googleKey: () => ipcRenderer.invoke('google-key')
});
