const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

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
  // Cambiar la ruta a process.resourcesPath para cuando la aplicación está empaquetada
  const exePath = path.join(process.resourcesPath, 'dist', 'app.exe');
  const xlsmPath = path.join(process.resourcesPath, 'dist', 'Cotizaciones.xlsm');
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

  // Configuración del autoUpdater
  autoUpdater.autoDownload = true;

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  });
  
  autoUpdater.on('error', (err) => {
    console.error('Error al buscar actualizaciones:', err.message);
    // No mostramos ningún cartel
  });

  autoUpdater.checkForUpdates(); // <- Busca actualizaciones al iniciar
  
  // Abrimos la ventana de todas formas
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (win === null) createWindow();
});
