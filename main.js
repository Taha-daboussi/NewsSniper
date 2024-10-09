const { app, BrowserWindow } = require('electron');
const path = require('path');
console.log(path.join(__dirname, 'preload.js'));


console.log("Stuffs")
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'), // Correct path to preload.js
        nodeIntegration: true,

      }
  });
  win.openDevTools()
  win.loadFile('./src/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});