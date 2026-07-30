# Jato Games Diagnostic

Aplicativo Windows local para inventário de hardware, benchmark controlado e comparação com perfis de jogos.

## Privacidade

- Só inicia após consentimento explícito.
- Consulta somente o catálogo público de jogos por `GET`, sem incluir dados do computador.
- Não envia inventário, benchmark ou relatório pela rede.
- Cria um arquivo temporário de até 192 MB durante o benchmark de disco.
- Remove o arquivo em bloco `finally`, inclusive quando o teste falha.
- Exporta JSON apenas quando o usuário escolhe um destino.
- Não requer privilégios administrativos.

## Catálogo sincronizado

- A combo possui dez perfis embutidos e nunca depende da internet para funcionar.
- Ao abrir, o aplicativo consulta `https://resolvajato.com.br/api/games/catalog`.
- O último catálogo válido é salvo em `%LOCALAPPDATA%\JatoGamesDiagnostic\catalog.json`.
- Falha, timeout ou resposta inválida acionam automaticamente o cache ou a lista embutida.
- `JATO_GAMES_CATALOG_URL` permite apontar o aplicativo para uma API local durante testes.

## Medições

- Inventário via WMI: CPU, núcleos, GPU, driver e RAM.
- CPU: carga matemática single-thread e multi-thread.
- Memória: cópia repetida de bloco de 128 MB.
- Disco: escrita síncrona e leitura sequencial de arquivo temporário.
- GPU: inventário real e classificação editorial do adaptador. O MVP não afirma medir FPS.

## Identidade visual

- O símbolo oficial combina microchip, telemetria e medidor de desempenho.
- O ícone do Windows está em `Assets/JatoGamesDiagnostic.ico`.
- As versões transparentes do símbolo estão em `Assets/diagnostic-mark-master.png` e `Assets/diagnostic-mark-512.png`.
- A arte cinematográfica oficial está em `Assets/diagnostic-key-art.png`.
- Cores, conceito, tipografia e regras de uso estão documentados em `BRAND.md`.
- As cópias destinadas às páginas públicas ficam em `public/images/jato-games/diagnostic`.

## Compilar

```powershell
dotnet restore
dotnet build -c Release
dotnet publish -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true
```

O executável publicado fica em:

`bin/Release/net5.0-windows/win-x64/publish/JatoGamesDiagnostic.exe`

## Próxima fase

1. Assinar o binário com Azure Artifact Signing.
2. Criar pacote MSIX e publicação na Microsoft Store.
3. Validar os perfis de jogos contra fontes oficiais versionadas.
4. Integrar relatórios por token temporário, sem persistência por padrão.
