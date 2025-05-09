/**
 * Script de verificação de compatibilidade do Gerenciador de Fontes
 * Este script verifica se o sistema tem todos os requisitos necessários
 * para executar o gerenciador de fontes corretamente.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

// Verificar sistema operacional
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';

console.log('=== Verificação de Compatibilidade do Gerenciador de Fontes ===');
console.log(`Sistema Operacional: ${isMac ? 'macOS' : isWindows ? 'Windows' : 'Não suportado'}`);

// Verificar diretórios de fontes
function verificarDiretorios() {
  console.log('\nVerificando diretórios de fontes...');
  
  if (isMac) {
    const systemFontDir = '/Library/Fonts';
    const userFontDir = path.join(os.homedir(), 'Library/Fonts');
    
    console.log(`Diretório de fontes do sistema: ${fs.existsSync(systemFontDir) ? 'OK' : 'NÃO ENCONTRADO'}`);
    console.log(`Diretório de fontes do usuário: ${fs.existsSync(userFontDir) ? 'OK' : 'NÃO ENCONTRADO'}`);
    
    // Verificar permissões
    try {
      fs.accessSync(userFontDir, fs.constants.W_OK);
      console.log('Permissões de escrita no diretório de fontes do usuário: OK');
    } catch (err) {
      console.log('Permissões de escrita no diretório de fontes do usuário: ERRO');
      console.log('Você precisa ter permissões de escrita no diretório ~/Library/Fonts');
    }
  } else if (isWindows) {
    const systemFontDir = path.join(process.env.WINDIR, 'Fonts');
    const userFontDir = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Windows', 'Fonts');
    
    console.log(`Diretório de fontes do sistema: ${fs.existsSync(systemFontDir) ? 'OK' : 'NÃO ENCONTRADO'}`);
    console.log(`Diretório de fontes do usuário: ${fs.existsSync(userFontDir) ? 'OK' : 'NÃO ENCONTRADO'}`);
    
    // Verificar permissões
    try {
      fs.accessSync(userFontDir, fs.constants.W_OK);
      console.log('Permissões de escrita no diretório de fontes do usuário: OK');
    } catch (err) {
      console.log('Permissões de escrita no diretório de fontes do usuário: ERRO');
      console.log('Você pode precisar executar o aplicativo como administrador');
    }
  }
}

// Verificar comandos necessários
function verificarComandos() {
  console.log('\nVerificando comandos necessários...');
  
  if (isMac) {
    exec('which atsutil', (error) => {
      console.log(`Comando atsutil: ${error ? 'NÃO ENCONTRADO' : 'OK'}`);
      if (error) {
        console.log('O comando atsutil é necessário para atualizar o cache de fontes no macOS');
      }
    });
  } else if (isWindows) {
    exec('powershell -command "Get-ExecutionPolicy"', (error, stdout) => {
      if (error) {
        console.log('PowerShell: ERRO AO VERIFICAR');
      } else {
        const policy = stdout.trim();
        console.log(`PowerShell: OK (Política de execução: ${policy})`);
        
        if (policy === 'Restricted') {
          console.log('AVISO: A política de execução do PowerShell está restrita.');
          console.log('Você pode precisar ajustá-la para permitir a execução de scripts:');
          console.log('Execute como administrador: Set-ExecutionPolicy RemoteSigned');
        }
      }
    });
  }
}

// Verificar dependências
function verificarDependencias() {
  console.log('\nVerificando dependências...');
  
  try {
    require('electron-store');
    console.log('electron-store: OK');
  } catch (err) {
    console.log('electron-store: NÃO ENCONTRADO');
    console.log('Execute "npm install" para instalar as dependências');
  }
  
  try {
    require('font-manager');
    console.log('font-manager: OK');
  } catch (err) {
    console.log('font-manager: NÃO ENCONTRADO');
    console.log('Execute "npm install" para instalar as dependências');
  }
}

// Executar verificações
verificarDiretorios();
verificarComandos();
verificarDependencias();

console.log('\n=== Verificação concluída ===');
console.log('Para mais informações, consulte o arquivo INSTRUCOES.md');