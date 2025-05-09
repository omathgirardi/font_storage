/**
 * Módulo de integração com aplicativos de design
 * Este módulo gerencia a integração com aplicativos como Figma, Photoshop e outros
 */

const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const Store = require('electron-store');

const store = new Store();

// Diretórios de integração para diferentes aplicativos
const INTEGRATION_PATHS = {
  figma: {
    mac: path.join(process.env.HOME, 'Library', 'Application Support', 'Figma'),
    win: path.join(process.env.APPDATA, 'Figma')
  },
  photoshop: {
    mac: path.join(process.env.HOME, 'Library', 'Application Support', 'Adobe', 'Adobe Photoshop'),
    win: path.join(process.env.APPDATA, 'Adobe', 'Adobe Photoshop')
  }
};

/**
 * Inicializa as integrações com aplicativos de design
 */
function initIntegrations() {
  // Registrar manipuladores de eventos IPC
  ipcMain.handle('get-integrations', getAvailableIntegrations);
  ipcMain.handle('sync-with-app', syncWithApp);
  ipcMain.handle('check-app-running', checkAppRunning);
}

/**
 * Obtém as integrações disponíveis no sistema
 */
async function getAvailableIntegrations() {
  const platform = process.platform === 'darwin' ? 'mac' : 'win';
  const integrations = [];
  
  // Verificar cada aplicativo suportado
  for (const [app, paths] of Object.entries(INTEGRATION_PATHS)) {
    const appPath = paths[platform];
    if (fs.existsSync(appPath)) {
      integrations.push({
        name: app,
        path: appPath,
        connected: store.get(`integrations.${app}`, false)
      });
    }
  }
  
  return integrations;
}

/**
 * Sincroniza as fontes ativadas com um aplicativo específico
 */
async function syncWithApp(event, { app, enable }) {
  try {
    const platform = process.platform === 'darwin' ? 'mac' : 'win';
    const appPath = INTEGRATION_PATHS[app]?.[platform];
    
    if (!appPath || !fs.existsSync(appPath)) {
      return { success: false, message: `Aplicativo ${app} não encontrado no sistema` };
    }
    
    // Salvar estado da integração
    store.set(`integrations.${app}`, enable);
    
    // Implementação específica para cada aplicativo
    if (app === 'figma') {
      // Lógica para sincronizar com o Figma
      // Isso pode envolver a criação de links simbólicos ou cópia de fontes
      console.log(`Sincronização com Figma ${enable ? 'ativada' : 'desativada'}`);
    } else if (app === 'photoshop') {
      // Lógica para sincronizar com o Photoshop
      console.log(`Sincronização com Photoshop ${enable ? 'ativada' : 'desativada'}`);
    }
    
    return { 
      success: true, 
      message: `Sincronização com ${app} ${enable ? 'ativada' : 'desativada'} com sucesso` 
    };
  } catch (error) {
    console.error(`Erro ao sincronizar com ${app}:`, error);
    return { 
      success: false, 
      message: `Erro ao sincronizar com ${app}: ${error.message}` 
    };
  }
}

/**
 * Verifica se um aplicativo específico está em execução
 */
async function checkAppRunning(event, app) {
  return new Promise((resolve) => {
    const command = process.platform === 'darwin'
      ? `pgrep -x "${app}" || pgrep -x "${app.charAt(0).toUpperCase() + app.slice(1)}"`
      : `tasklist /FI "IMAGENAME eq ${app}.exe" /NH`;
    
    exec(command, (error, stdout) => {
      // No macOS, pgrep retorna um PID se o processo estiver em execução
      // No Windows, tasklist retorna informações do processo se estiver em execução
      const isRunning = process.platform === 'darwin'
        ? stdout.trim() !== ''
        : !stdout.includes('INFO: No tasks');
      
      resolve(isRunning);
    });
  });
}

module.exports = {
  initIntegrations,
  getAvailableIntegrations,
  syncWithApp,
  checkAppRunning
};