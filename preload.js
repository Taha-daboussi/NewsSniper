const { contextBridge } = require('electron');
const cryptoUtils = require('./src/cryptoUtils');
contextBridge.exposeInMainWorld('cryptoUtils', cryptoUtils);