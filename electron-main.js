const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
let backendServer;

// Démarrer le backend Express (directement dans le processus Electron)
async function startBackend() {
  console.log('🚀 Démarrage du backend...');

  try {
    // Configurer l'environnement pour le backend
    const backendDir = path.join(__dirname, 'app', 'backend');
    const envFile = path.join(backendDir, '.env');
    const dbPath = path.join(__dirname, 'app', 'db', 'dev.db');

    process.env.NODE_ENV = 'production';
    process.env.APP_ENV_FILE = envFile;
    process.env.DATABASE_URL = `file:${dbPath}`;
    process.env.PORT = '4000';

    console.log('[Electron] Backend directory:', backendDir);
    console.log('[Electron] Database path:', dbPath);
    console.log('[Electron] Database URL:', process.env.DATABASE_URL);

    // Changer le répertoire de travail
    process.chdir(backendDir);

    // Charger et démarrer le backend directement
    // Le build TypeScript crée dist/backend/src/index.js au lieu de dist/index.js
    const backendModule = require(path.join(backendDir, 'dist', 'backend', 'src', 'index.js'));

    console.log('[Electron] Backend démarré avec succès ✓');
    return true;
  } catch (error) {
    console.error('[Electron] Erreur au démarrage du backend:', error);
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'app', 'frontend', 'public', 'logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#0f0f1e',
    autoHideMenuBar: true,
  });

  // Charger le frontend (depuis le build)
  const frontendPath = path.join(__dirname, 'app', 'frontend', 'dist', 'index.html');
  mainWindow.loadFile(frontendPath);

  // Ouvrir DevTools pour voir les erreurs
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Démarrer le backend d'abord
  const backendStarted = await startBackend();

  if (!backendStarted) {
    console.error('[Electron] Impossible de démarrer le backend. Fermeture...');
    app.quit();
    return;
  }

  // Attendre 2 secondes que le backend soit complètement prêt
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
