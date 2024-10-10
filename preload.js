const { contextBridge, ipcRenderer } = require('electron');
const cryptoUtils = require('./src/cryptoUtils');

contextBridge.exposeInMainWorld('cryptoUtils', cryptoUtils);
contextBridge.exposeInMainWorld('electronAPI', {
    requestData: (arg) => ipcRenderer.send('request-data', arg),
    onResponseData: (callback) => ipcRenderer.on('response-data', (event, data) => callback(data)),
    onInitData: (callback) => ipcRenderer.on('init-data', (event, data) => callback(data))
});