# Precisou, Tá Pronto Games Diagnostic

Aplicativo Windows local para inventário de hardware, benchmark controlado e comparação com perfis de jogos. A versão candidata atual é `0.9.0`, baseada em .NET 10 LTS.

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
- Ao abrir, o aplicativo consulta `https://precisoutapronto.com.br/api/games/catalog`.
- O último catálogo válido é salvo em `%LOCALAPPDATA%\PrecisouTaProntoGamesDiagnostic\catalog.json`.
- Falha, timeout ou resposta inválida acionam automaticamente o cache ou a lista embutida.
- `PRECISOUTAPRONTO_GAMES_CATALOG_URL` permite apontar o aplicativo para uma API local durante testes.

## Medições

- Inventário tolerante a falhas via WMI: CPU, núcleos, todas as GPUs, driver e RAM.
- Em notebooks híbridos, seleciona o adaptador gráfico mais capaz e mantém a lista identificada no relatório.
- CPU: carga matemática single-thread e multi-thread.
- Memória: cópia repetida de bloco de 128 MB.
- Disco: escrita síncrona e leitura sequencial de arquivo temporário.
- GPU: inventário real e classificação editorial do adaptador. O MVP não afirma medir FPS.

## Identidade visual

- O símbolo oficial combina microchip, telemetria e medidor de desempenho.
- O ícone do Windows está em `Assets/PrecisouTaProntoGamesDiagnostic.ico`.
- As versões transparentes do símbolo estão em `Assets/diagnostic-mark-master.png` e `Assets/diagnostic-mark-512.png`.
- A arte cinematográfica oficial está em `Assets/diagnostic-key-art.png`.
- Cores, conceito, tipografia e regras de uso estão documentados em `BRAND.md`.
- As cópias destinadas às páginas públicas ficam em `public/images/precisoutapronto-games/diagnostic`.

## Compilar

```powershell
dotnet test ..\PrecisouTaProntoGamesDiagnostic.Tests -c Release
dotnet build -c Release
powershell -ExecutionPolicy Bypass -File build-release.ps1
powershell -ExecutionPolicy Bypass -File build-msix.ps1
```

O executável publicado fica em:

`bin/Release/net5.0-windows/win-x64/publish/PrecisouTaProntoGamesDiagnostic.exe`

## Publicação

- O MSIX x64 reproduzível é gerado por `build-msix.ps1`.
- `IdentityName` e `Publisher` devem receber exatamente os valores do Partner Center.
- `CertificateThumbprint` assina e verifica o MSIX quando houver certificado para distribuição direta.
- `verify-release.ps1` executa os testes, calcula o hash, verifica assinatura e pode solicitar análise do Microsoft Defender.
- A matriz de validação externa está em `RELEASE-CHECKLIST.md`.
