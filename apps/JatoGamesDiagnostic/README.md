# Jato Games Diagnostic

Aplicativo Windows local para inventário de hardware, benchmark controlado e comparação com perfis de jogos.

## Privacidade

- Só inicia após consentimento explícito.
- Não envia dados pela rede.
- Cria um arquivo temporário de até 192 MB durante o benchmark de disco.
- Remove o arquivo em bloco `finally`, inclusive quando o teste falha.
- Exporta JSON apenas quando o usuário escolhe um destino.
- Não requer privilégios administrativos.

## Medições

- Inventário via WMI: CPU, núcleos, GPU, driver e RAM.
- CPU: carga matemática single-thread e multi-thread.
- Memória: cópia repetida de bloco de 128 MB.
- Disco: escrita síncrona e leitura sequencial de arquivo temporário.
- GPU: inventário real e classificação editorial do adaptador. O MVP não afirma medir FPS.

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
