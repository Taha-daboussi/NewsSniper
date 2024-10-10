const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
console.log(path.join(__dirname, 'preload.js'));
const express = require('express')
const bodyParser = require('body-parser');
let win
function createWindow() {
 win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'), // Ensure this path is correct
        contextIsolation: true, // Enable context isolation for security
        enableRemoteModule: true, // Disable remote module for security
        nodeIntegration: true,

      }
  });
  win.webContents.openDevTools();
  win.loadFile('./src/index.html');

}

const expressApp = express();
const port = 5658;

expressApp.use(bodyParser.json());

expressApp.post('/encrypt', (req, res) => {
	const { authToken, pointData } = req.body;
	console.log('Received POST request on /encrypt with data:', { authToken, pointData });

	// Send init-data event to the renderer
	if (win) {
    win.webContents.send('init-data', { message: 'Data received and processed', authToken, pointData });
	}
  ipcMain.once('request-data', (event, arg) => {
    console.log('Received request-data event from renderer:', JSON.stringify(arg));
    res.status(200).json(arg);
  });
  
});

expressApp.listen(port, () => {
	console.log(`Express server running at http://localhost:${port}`);
});

// Example: Listen for a message from the renderer

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