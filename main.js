require('dotenv').config()
const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')
const { autoUpdater } = require('electron-updater')

let win
let pythonApp = null

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Planos Perú',
    icon: path.join(__dirname, 'build', 'favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  win.loadFile(path.join(__dirname, 'build', 'index.html'))

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', () => {
  // Configura el feed de actualizaciones de GitHub
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'BrianVdeV',
    repo: 'planosperu-app',
    token: process.env.GITHUB_TOKEN,
  })

  // Configuración del autoUpdater
  autoUpdater.autoDownload = true
  autoUpdater.checkForUpdatesAndNotify() // Este ya hace la verificación y notificación

  autoUpdater.on('update-available', () => {
    console.log('Actualización disponible. Descargando...')
  })

  autoUpdater.on('update-downloaded', async () => {
    console.log('Actualización descargada.')

    const result = await dialog.showMessageBox(win, {
      type: 'question',
      buttons: ['Reiniciar ahora', 'Más tarde'],
      defaultId: 0,
      cancelId: 1,
      title: 'Actualización lista',
      message: 'Se ha descargado una nueva versión de Planos Perú.',
      detail: '¿Deseas reiniciar la aplicación ahora para aplicar la actualización?',
    })

    if (result.response === 0) {
      // Reinicia e instala
      autoUpdater.quitAndInstall(false, true)
    } else {
      console.log('El usuario decidió actualizar más tarde.')
    }
  })

  autoUpdater.on('error', (err) => {
    console.error('Error en el actualizador:', err)
  })

  // Cambiar la ruta a process.resourcesPath para cuando la aplicación está empaquetada
  const exePath = path.join(process.resourcesPath, 'dist', 'app.exe')
  const xlsmPath = path.join(process.resourcesPath, 'dist', 'Cotizaciones.xlsm')
  console.log('Ejecutando:', exePath)

  if (fs.existsSync(exePath)) {
    pythonApp = spawn(exePath)

    pythonApp.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`)
    })

    pythonApp.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`)
    })

    pythonApp.on('error', (err) => {
      console.error('Error al ejecutar el .exe:', err.message)
    })
  } else {
    console.warn('El archivo .exe no se encontró, se abrirá solo la ventana de Electron.')
  }

  // Manejo de errores de autoUpdater
  autoUpdater.on('error', (err) => {
    console.error('Error al buscar actualizaciones:', err.message)
  })

  // Abre la ventana de la aplicación
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (pythonApp) {
    pythonApp.kill() // Esto envía SIGTERM por defecto
    console.log('app.exe cerrado al salir de Electron.')
  }
})

app.on('activate', () => {
  if (win === null) createWindow()
})
