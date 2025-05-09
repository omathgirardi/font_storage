/**
 * Módulo de gerenciamento de fontes do sistema
 * Este módulo lida com a ativação/desativação de fontes no sistema operacional
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { app } = require('electron');
const Store = require('electron-store');

const store = new Store();

// Diretórios de fontes do sistema
const SYSTEM_FONT_DIRS = {
  mac: {
    system: '/Library/Fonts',
    user: path.join(process.env.HOME, 'Library/Fonts')
  },
  win: {
    system: path.join(process.env.WINDIR, 'Fonts'),
    user: path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Windows', 'Fonts')
  }
};

// Diretório temporário para fontes desativadas
const TEMP_FONT_DIR = path.join(app.getPath('userData'), 'temp-fonts');

/**
 * Inicializa o gerenciador de fontes
 */
function initFontManager() {
  // Garantir que o diretório temporário exista
  if (!fs.existsSync(TEMP_FONT_DIR)) {
    fs.mkdirSync(TEMP_FONT_DIR, { recursive: true });
  }
  
  // Carregar fontes ativas do armazenamento
  const activeFonts = store.get('activeFonts', []);
  console.log(`Carregadas ${activeFonts.length} fontes ativas do armazenamento`);
}

/**
 * Lista todas as fontes do sistema
 */
async function listSystemFonts() {
  const platform = process.platform === 'darwin' ? 'mac' : 'win';
  const fontDirs = SYSTEM_FONT_DIRS[platform];
  
  let fonts = [];
  
  // Listar fontes do diretório do sistema
  try {
    const systemFonts = await listFontsInDirectory(fontDirs.system);
    fonts = fonts.concat(systemFonts.map(font => ({ ...font, type: 'system' })));
  } catch (error) {
    console.error('Erro ao listar fontes do sistema:', error);
  }
  
  // Listar fontes do diretório do usuário
  try {
    const userFonts = await listFontsInDirectory(fontDirs.user);
    fonts = fonts.concat(userFonts.map(font => ({ ...font, type: 'user' })));
  } catch (error) {
    console.error('Erro ao listar fontes do usuário:', error);
  }
  
  return fonts;
}

/**
 * Lista fontes em um diretório específico
 */
async function listFontsInDirectory(directory) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      
      const fontFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.ttf', '.otf', '.woff', '.woff2'].includes(ext);
      });
      
      const fonts = fontFiles.map(file => ({
        name: path.basename(file, path.extname(file)),
        path: path.join(directory, file),
        extension: path.extname(file).toLowerCase(),
        active: true // Fontes do sistema são consideradas ativas por padrão
      }));
      
      resolve(fonts);
    });
  });
}

/**
 * Ativa uma fonte no sistema
 */
async function activateFont(fontPath) {
  try {
    const platform = process.platform === 'darwin' ? 'mac' : 'win';
    const fontName = path.basename(fontPath);
    
    if (platform === 'mac') {
      // No macOS, copiamos a fonte para o diretório de fontes do usuário
      const userFontDir = SYSTEM_FONT_DIRS.mac.user;
      const destPath = path.join(userFontDir, fontName);
      
      // Verificar se a fonte já está no diretório de destino
      if (fs.existsSync(destPath)) {
        console.log(`Fonte ${fontName} já está ativa`);
        return true;
      }
      
      // Copiar a fonte para o diretório de fontes do usuário
      fs.copyFileSync(fontPath, destPath);
      
      // Atualizar o cache de fontes do macOS
      exec('atsutil databases -remove', (error) => {
        if (error) console.error('Erro ao atualizar cache de fontes:', error);
      });
      
      // Salvar no armazenamento
      const activeFonts = store.get('activeFonts', []);
      store.set('activeFonts', [...activeFonts, { original: fontPath, active: destPath }]);
      
      return true;
    } else if (platform === 'win') {
      // No Windows, copiamos a fonte para o diretório de fontes do usuário
      const userFontDir = SYSTEM_FONT_DIRS.win.user;
      const destPath = path.join(userFontDir, fontName);
      const systemFontDir = SYSTEM_FONT_DIRS.win.system;
      const systemDestPath = path.join(systemFontDir, fontName);
      
      // Verificar se a fonte já está no diretório de destino (usuário ou sistema)
      if (fs.existsSync(destPath) || fs.existsSync(systemDestPath)) {
        console.log(`Fonte ${fontName} já está ativa`);
        return true;
      }
      
      // Copiar a fonte para o diretório de fontes do usuário
      fs.copyFileSync(fontPath, destPath);
      
      // Registrar a fonte no sistema Windows usando PowerShell
      // Método aprimorado para Windows 11 e versões anteriores
      const psCommand = `
        Add-Type -AssemblyName System.Drawing
        $fontCollection = New-Object System.Drawing.Text.PrivateFontCollection
        $fontCollection.AddFontFile("${destPath.replace(/\\/g, '\\\\')}") | Out-Null
        $shellApp = New-Object -ComObject Shell.Application
        $shellApp.NameSpace(0x14).CopyHere("${destPath.replace(/\\/g, '\\\\')}") | Out-Null

        # Método alternativo para Windows 11 usando registro direto
        $fontName = [System.IO.Path]::GetFileName("${destPath.replace(/\\/g, '\\\\')}") 
        $fontRegistryPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts"
        $fontRegistryName = [System.IO.Path]::GetFileNameWithoutExtension("${destPath.replace(/\\/g, '\\\\')}") + " (TrueType)"
        try {
            New-ItemProperty -Path $fontRegistryPath -Name $fontRegistryName -PropertyType String -Value $fontName -Force | Out-Null
        } catch {
            Write-Output "Não foi possível adicionar ao registro, mas a fonte ainda deve funcionar"
        }

        # Notificar o sistema sobre a mudança de fontes
        $signature = @'
        [DllImport("gdi32.dll")]
        public static extern int AddFontResource(string lpszFilename);
        [DllImport("user32.dll")]
        public static extern int SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
'@
        Add-Type -MemberDefinition $signature -Name WinAPI -Namespace Win32
        [Win32.WinAPI]::AddFontResource("${destPath.replace(/\\/g, '\\\\')}") | Out-Null
        [Win32.WinAPI]::SendMessage(0xffff, 0x1D, 0, 0) | Out-Null
      `;
      
      exec(`powershell -command "${psCommand}"`, (error) => {
        if (error) {
          console.error(`Erro ao registrar fonte no Windows: ${error}`);
        }
      });
      
      // Salvar no armazenamento
      const activeFonts = store.get('activeFonts', []);
      store.set('activeFonts', [...activeFonts, { original: fontPath, active: destPath }]);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao ativar fonte:', error);
    return false;
  }
}

/**
 * Desativa uma fonte no sistema
 */
async function deactivateFont(fontPath) {
  try {
    const platform = process.platform === 'darwin' ? 'mac' : 'win';
    const fontName = path.basename(fontPath);
    
    if (platform === 'mac') {
      // No macOS, removemos a fonte do diretório de fontes do usuário
      const userFontDir = SYSTEM_FONT_DIRS.mac.user;
      const activeFonts = store.get('activeFonts', []);
      
      // Encontrar a entrada da fonte ativa
      const fontEntry = activeFonts.find(f => f.original === fontPath || f.active === fontPath);
      
      if (!fontEntry) {
        console.log(`Fonte ${fontName} não está ativa ou não foi ativada por este aplicativo`);
        return false;
      }
      
      // Remover a fonte do diretório de fontes do usuário
      if (fs.existsSync(fontEntry.active)) {
        // Mover para o diretório temporário em vez de excluir
        const tempPath = path.join(TEMP_FONT_DIR, fontName);
        fs.renameSync(fontEntry.active, tempPath);
      }
      
      // Atualizar o cache de fontes do macOS
      exec('atsutil databases -remove', (error) => {
        if (error) console.error('Erro ao atualizar cache de fontes:', error);
      });
      
      // Atualizar o armazenamento
      store.set('activeFonts', activeFonts.filter(f => f.original !== fontPath && f.active !== fontPath));
      
      return true;
    } else if (platform === 'win') {
      // No Windows, removemos a fonte do diretório de fontes do usuário e a desregistramos
      const activeFonts = store.get('activeFonts', []);
      
      // Encontrar a entrada da fonte ativa
      const fontEntry = activeFonts.find(f => f.original === fontPath || f.active === fontPath);
      
      if (!fontEntry) {
        console.log(`Fonte ${fontName} não está ativa ou não foi ativada por este aplicativo`);
        return false;
      }
      
      // Verificar se a fonte existe no diretório de fontes do usuário
      if (fs.existsSync(fontEntry.active)) {
        // Mover para o diretório temporário em vez de excluir
        const tempPath = path.join(TEMP_FONT_DIR, fontName);
        fs.renameSync(fontEntry.active, tempPath);
        
        // Desregistrar a fonte usando PowerShell
        // Método aprimorado para Windows 11 e versões anteriores
        const psCommand = `
          $fontName = "${path.basename(fontEntry.active, path.extname(fontEntry.active))}"
          
          # Remover do registro do Windows (funciona no Windows 10 e 11)
          $fontRegistryPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts"
          $fontRegistryName = "$fontName (TrueType)"
          try {
              Remove-ItemProperty -Path $fontRegistryPath -Name $fontRegistryName -Force -ErrorAction SilentlyContinue
          } catch {
              Write-Output "Não foi possível remover do registro, continuando..."
          }
          
          # Remover usando Shell.Application (método tradicional)
          $objShell = New-Object -ComObject Shell.Application
          $objFolder = $objShell.Namespace(0x14)
          $objFolder.Items() | Where-Object {$_.Name -eq "$fontName"} | ForEach-Object {$objFolder.MoveHere("${tempPath.replace(/\\/g, '\\\\')}")}
          
          # Notificar o sistema sobre a mudança de fontes
          $signature = @'
          [DllImport("gdi32.dll")]
          public static extern int RemoveFontResource(string lpszFilename);
          [DllImport("user32.dll")]
          public static extern int SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
'@
          Add-Type -MemberDefinition $signature -Name WinAPI -Namespace Win32
          [Win32.WinAPI]::RemoveFontResource("${fontEntry.active.replace(/\\/g, '\\\\')}") | Out-Null
          [Win32.WinAPI]::SendMessage(0xffff, 0x1D, 0, 0) | Out-Null
        `;
        
        exec(`powershell -command "${psCommand}"`, (error) => {
          if (error) {
            console.error(`Erro ao desregistrar fonte no Windows: ${error}`);
          }
        });
      }
      
      // Atualizar o armazenamento
      store.set('activeFonts', activeFonts.filter(f => f.original !== fontPath && f.active !== fontPath));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao desativar fonte:', error);
    return false;
  }
}

/**
 * Verifica se uma fonte está ativa no sistema
 */
async function isFontActive(fontPath) {
  try {
    const platform = process.platform === 'darwin' ? 'mac' : 'win';
    const fontName = path.basename(fontPath);
    
    if (platform === 'mac') {
      // Verificar no diretório de fontes do usuário
      const userFontDir = SYSTEM_FONT_DIRS.mac.user;
      const destPath = path.join(userFontDir, fontName);
      
      return fs.existsSync(destPath);
    } else if (platform === 'win') {
      // No Windows, verificamos tanto no diretório de fontes quanto no armazenamento local
      const userFontDir = SYSTEM_FONT_DIRS.win.user;
      const systemFontDir = SYSTEM_FONT_DIRS.win.system;
      const userDestPath = path.join(userFontDir, fontName);
      const systemDestPath = path.join(systemFontDir, fontName);
      
      // Verificar se a fonte existe fisicamente
      if (fs.existsSync(userDestPath) || fs.existsSync(systemDestPath)) {
        return true;
      }
      
      // Verificar no armazenamento local
      const activeFonts = store.get('activeFonts', []);
      return activeFonts.some(f => f.original === fontPath || 
                              f.active === userDestPath || 
                              path.basename(f.active) === fontName);
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar se a fonte está ativa:', error);
    return false;
  }
}

module.exports = {
  initFontManager,
  listSystemFonts,
  listFontsInDirectory,
  activateFont,
  deactivateFont,
  isFontActive
};