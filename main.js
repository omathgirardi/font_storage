const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fontManager = require('font-manager');
const Store = require('electron-store');

// Importar módulos personalizados
const fontManagerModule = require('./fontManager');
const integrations = require('./integrations');

// Configuração do armazenamento local
const store = new Store();

// Variável para armazenar a janela principal
let mainWindow;

// Função para criar a janela principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Carrega o arquivo HTML principal
  mainWindow.loadFile('index.html');

  // Abre o DevTools em modo de desenvolvimento
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Evento quando a janela é fechada
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Cria a janela quando o Electron estiver pronto
app.whenReady().then(() => {
  // Inicializar módulos
  try {
    fontManagerModule.initFontManager();
    integrations.initIntegrations();
    console.log('Módulos inicializados com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar módulos:', error);
  }
  
  createWindow();
});

// Fecha a aplicação quando todas as janelas estiverem fechadas (exceto no macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// No macOS, recria a janela quando o ícone do dock for clicado e não houver outras janelas abertas
app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// Manipuladores de eventos IPC

// Listar todas as fontes do sistema
ipcMain.handle('list-fonts', async () => {
  try {
    const fonts = fontManager.getAvailableFontsSync();
    return fonts;
  } catch (error) {
    console.error('Erro ao listar fontes:', error);
    return [];
  }
});

// Selecionar pasta de fontes
ipcMain.handle('select-font-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Selecione a pasta com suas fontes'
  });
  
  if (!result.canceled) {
    const fontFolder = result.filePaths[0];
    store.set('fontFolder', fontFolder);
    return fontFolder;
  }
  return null;
});

// Listar fontes de uma pasta específica
ipcMain.handle('list-folder-fonts', async (event, folderPath) => {
  try {
    const files = fs.readdirSync(folderPath);
    const fontFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.ttf', '.otf', '.woff', '.woff2'].includes(ext);
    });
    
    return fontFiles.map(file => ({
      name: path.basename(file, path.extname(file)),
      path: path.join(folderPath, file),
      extension: path.extname(file).toLowerCase(),
      active: false
    }));
  } catch (error) {
    console.error('Erro ao listar fontes da pasta:', error);
    return [];
  }
});

// Ativar fonte
ipcMain.handle('activate-font', async (event, fontPath) => {
  try {
    // Usar o módulo fontManager para ativar a fonte
    const result = await fontManagerModule.activateFont(fontPath);
    return result;
  } catch (error) {
    console.error('Erro ao ativar fonte:', error);
    return false;
  }
});

// Desativar fonte
ipcMain.handle('deactivate-font', async (event, fontPath) => {
  try {
    // Usar o módulo fontManager para desativar a fonte
    const result = await fontManagerModule.deactivateFont(fontPath);
    return result;
  } catch (error) {
    console.error('Erro ao desativar fonte:', error);
    return false;
  }
});