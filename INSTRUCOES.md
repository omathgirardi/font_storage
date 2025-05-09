# Instruções de Uso do Gerenciador de Fontes

Este documento contém instruções detalhadas sobre como utilizar o Gerenciador de Fontes em diferentes sistemas operacionais.

## Instalação

### Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- Git (opcional, para clonar o repositório)

### Passos para Instalação

1. Clone ou baixe este repositório
2. Abra um terminal na pasta do projeto
3. Execute `npm install` para instalar as dependências
4. Execute `npm start` para iniciar o aplicativo

## Uso no macOS

### Primeira Execução

1. Ao iniciar o aplicativo pela primeira vez, pode ser solicitado acesso ao diretório de fontes do sistema.
2. Conceda as permissões necessárias quando solicitado.
3. O aplicativo irá carregar todas as fontes disponíveis no sistema.

### Ativação de Fontes

1. Clique no botão "Importar Fontes" para adicionar fontes de um diretório específico.
2. Selecione as fontes que deseja ativar na lista.
3. Clique no botão "Ativar Fontes".
4. As fontes serão copiadas para o diretório `~/Library/Fonts` e ficarão disponíveis para todos os aplicativos.

### Desativação de Fontes

1. Selecione as fontes ativas que deseja desativar.
2. Clique no botão "Desativar Fontes".
3. As fontes serão movidas para um diretório temporário e não estarão mais disponíveis para os aplicativos.

### Dicas para macOS

- Se as fontes não aparecerem imediatamente nos aplicativos, tente reiniciar o aplicativo em questão.
- Em alguns casos, pode ser necessário executar o comando `atsutil databases -remove` no Terminal para limpar o cache de fontes do sistema.
- O macOS tem proteções de sistema que podem impedir a modificação de fontes do sistema. O gerenciador trabalha principalmente com as fontes do usuário.

## Uso no Windows

### Primeira Execução

1. Recomenda-se executar o aplicativo como administrador na primeira vez.
2. Clique com o botão direito no ícone do aplicativo e selecione "Executar como administrador".
3. O Windows pode solicitar permissão para executar o aplicativo.

### Ativação de Fontes

1. Clique no botão "Importar Fontes" para adicionar fontes de um diretório específico.
2. Selecione as fontes que deseja ativar na lista.
3. Clique no botão "Ativar Fontes".
4. As fontes serão copiadas para o diretório de fontes do usuário e registradas no sistema Windows.

### Desativação de Fontes

1. Selecione as fontes ativas que deseja desativar.
2. Clique no botão "Desativar Fontes".
3. As fontes serão desregistradas do sistema e movidas para um diretório temporário.

### Dicas para Windows

- O Windows pode exigir privilégios de administrador para registrar e desregistrar fontes.
- Se encontrar erros relacionados à execução de scripts PowerShell, pode ser necessário ajustar as políticas de execução do PowerShell:
  1. Abra o PowerShell como administrador
  2. Execute o comando: `Set-ExecutionPolicy RemoteSigned`
  3. Confirme a alteração
- Alguns aplicativos no Windows podem manter as fontes em cache, sendo necessário reiniciá-los após ativar ou desativar fontes.

## Integração com Aplicativos de Design

### Figma

1. O gerenciador detecta automaticamente a instalação do Figma.
2. Na seção "Integrações", você pode ativar a sincronização com o Figma.
3. Quando ativada, as fontes serão automaticamente disponibilizadas para o Figma.

### Adobe Photoshop

1. O gerenciador detecta instalações do Adobe Photoshop.
2. Ative a integração na seção "Integrações".
3. O Photoshop pode precisar ser reiniciado após a ativação ou desativação de fontes.

## Solução de Problemas Comuns

### Fontes não aparecem após ativação

- Verifique se o aplicativo de destino foi reiniciado após a ativação das fontes.
- Confirme se as fontes estão realmente ativas no gerenciador.
- Verifique se as fontes são compatíveis com o aplicativo que está tentando usá-las.

### Erros de permissão

- No macOS: Verifique as permissões do diretório `~/Library/Fonts`.
- No Windows: Execute o aplicativo como administrador.

### Aplicativo não inicia

- Verifique se todas as dependências foram instaladas corretamente.
- Confirme se a versão do Node.js é compatível (v14 ou superior).
- Verifique os logs de erro no console de desenvolvimento (execute com `npm run dev`).

## Contato e Suporte

Se encontrar problemas não cobertos neste documento, por favor abra uma issue no repositório do projeto ou entre em contato com o desenvolvedor.