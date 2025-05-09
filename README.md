# Gerenciador de Fontes

Um aplicativo para gerenciar fontes no macOS e Windows, permitindo ativar/desativar fontes conforme necessário, similar ao Font Base, com integração ao Figma, Photoshop e outros aplicativos de design.

## Funcionalidades

- Carregar e visualizar fontes do sistema
- Ativar/desativar fontes sob demanda
- Sincronizar com aplicativos de design (Figma, Photoshop, etc.)
- Otimizar o uso de memória e armazenamento
- Interface amigável para gerenciar suas fontes
- Suporte para macOS e Windows

## Requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- macOS ou Windows 10/11

## Como Instalar

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Entre na pasta do projeto
cd gerenciador_font

# Instale as dependências
npm install

# Inicie o aplicativo
npm start
```

## Funcionamento em Diferentes Plataformas

### macOS

No macOS, o gerenciador funciona copiando as fontes para o diretório `~/Library/Fonts` do usuário quando ativadas. Ao desativar, as fontes são movidas para um diretório temporário dentro da pasta de dados do aplicativo.

O aplicativo utiliza o comando `atsutil databases -remove` para atualizar o cache de fontes do sistema após cada operação.

**Permissões necessárias:**
- Acesso ao diretório de fontes do usuário
- Permissão para executar comandos de sistema

### Windows

No Windows, o gerenciador funciona copiando as fontes para o diretório de fontes do usuário (`C:\Users\[Usuário]\AppData\Local\Microsoft\Windows\Fonts`) e registrando-as no sistema através do registro do Windows.

O aplicativo utiliza PowerShell para registrar e desregistrar fontes, garantindo compatibilidade com Windows 10 e 11.

**Permissões necessárias:**
- Acesso ao diretório de fontes do usuário
- Permissão para modificar o registro do Windows (pode requerer privilégios de administrador)
- Permissão para executar scripts PowerShell

## Solução de Problemas

### macOS

1. **Fontes não aparecem após ativação:**
   - Reinicie os aplicativos de design
   - Execute manualmente `atsutil databases -remove` no Terminal
   - Verifique permissões do diretório `~/Library/Fonts`

2. **Erro ao desativar fontes:**
   - Verifique se a fonte não está em uso por algum aplicativo
   - Reinicie o gerenciador de fontes

### Windows

1. **Fontes não aparecem após ativação:**
   - Execute o aplicativo como administrador
   - Reinicie os aplicativos de design
   - Verifique se o Windows Defender ou outro antivírus não está bloqueando as operações

2. **Erro ao registrar fontes:**
   - Verifique se tem permissões de administrador
   - Tente desativar temporariamente o controle de conta de usuário (UAC)
   - Verifique se o PowerShell está configurado para permitir a execução de scripts

## Integração com Aplicativos de Design

O gerenciador de fontes se integra com aplicativos como Figma e Photoshop, detectando automaticamente instalações e permitindo sincronização direta de fontes.

Para aplicativos que não reiniciam automaticamente o cache de fontes, pode ser necessário reiniciar o aplicativo após ativar ou desativar fontes.

## Tecnologias Utilizadas

- Electron.js - Para criar aplicativo desktop multiplataforma
- React.js - Para a interface do usuário
- Node.js - Para manipulação de arquivos e fontes do sistema

## Licença

MIT