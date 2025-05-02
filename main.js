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
    title: "Planos Perú",
    icon: path.join(__dirname, 'build', 'favicon.ico'), 
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
  // Configura el feed de actualizaciones de GitHub
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'kimberly31-HC',    // Reemplaza con tu nombre de usuario en GitHub
    repo: 'planosperu-app',        // Reemplaza con el nombre de tu repositorio en GitHub
    token: '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',
  });

  // Configuración del autoUpdater
  autoUpdater.autoDownload = true;
  autoUpdater.checkForUpdatesAndNotify(); // Este ya hace la verificación y notificación

  // Evento cuando se descargan las actualizaciones
  autoUpdater.on('update-downloaded', () => {
    console.log('Actualización descargada');
    autoUpdater.quitAndInstall(false, true);  // Instala la actualización inmediatamente
  });

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
    });
  } else {
    console.warn('El archivo .exe no se encontró, se abrirá solo la ventana de Electron.');
  }

  // Manejo de errores de autoUpdater
  autoUpdater.on('error', (err) => {
    console.error('Error al buscar actualizaciones:', err.message);
  });

  // Abre la ventana de la aplicación
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (win === null) createWindow();
});
