const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, 'build', 'index.html'));

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', () => {
  const exePath = path.join(__dirname, 'dist', 'app.exe');
  console.log('Ejecutando:', exePath);

  if (fs.existsSync(exePath)) {
    const pythonApp = spawn(exePath);

    pythonApp.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    pythonApp.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    pythonApp.on('error', (err) => {
      console.error('Error al ejecutar el .exe:', err.message);
      // No mostramos ningún cartel
    });
  } else {
    console.warn('El archivo .exe no se encontró, se abrirá solo la ventana de Electron.');
  }

  // Abrimos la ventana de todas formas
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (win === null) createWindow();
});
