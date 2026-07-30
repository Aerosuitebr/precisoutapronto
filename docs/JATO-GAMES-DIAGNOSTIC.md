# Jato Games Diagnostic

## Objetivo

O `JatoGamesDiagnostic` é um aplicativo Windows complementar ao Jato Games. Ele coleta inventário real da máquina, executa benchmarks locais e gera um relatório comparativo para o jogo selecionado.

O MVP está em `apps/JatoGamesDiagnostic`.

## Fluxo

1. O usuário escolhe um jogo.
2. A interface descreve todas as informações e cargas executadas.
3. O diagnóstico só começa após consentimento explícito.
4. O inventário é coletado pelo Windows.
5. CPU, memória e disco são medidos localmente.
6. O arquivo temporário do teste de disco é removido.
7. Um relatório visual apresenta score, gargalos e recomendações.
8. O usuário pode exportar um JSON. Não há transmissão automática.

## O que é medido

### CPU

- Modelo, núcleos físicos e processadores lógicos via WMI.
- Índice single-thread por carga matemática com duração controlada.
- Índice multi-thread com até 16 tarefas paralelas.

### Memória

- RAM física instalada via WMI.
- Throughput de cópia com cinco rodadas sobre um bloco de 128 MB.

### Armazenamento

- Unidade do sistema e espaço livre.
- Escrita síncrona de 192 MB.
- Leitura sequencial do mesmo arquivo.
- Exclusão em `finally`, mesmo quando há cancelamento ou falha.

### GPU

- Nome do adaptador, memória reportada e driver via WMI.
- Classificação editorial do adaptador.

O MVP não afirma executar um benchmark Direct3D equivalente a um jogo nem prever FPS exato.

## Segurança e privacidade

- Não requer privilégios administrativos.
- Não cria serviço do Windows.
- Não inicia com o sistema.
- Não altera registro ou configurações de segurança.
- Faz somente uma consulta `GET` ao catálogo público de jogos; a requisição não contém inventário nem benchmark.
- Não envia diagnóstico ou telemetria.
- Exporta somente por escolha explícita.
- O relatório contém nome da máquina; a futura integração web deverá omitir esse campo por padrão.

## Build reproduzível

```powershell
powershell -ExecutionPolicy Bypass -File apps/JatoGamesDiagnostic/build-release.ps1
```

Saída:

- `dist/JatoGamesDiagnostic/JatoGamesDiagnostic.exe`
- `dist/JatoGamesDiagnostic/JatoGamesDiagnostic.sha256`

## Validação do MVP

- Compilação Release sem erros ou avisos.
- Publicação `win-x64` independente e em arquivo único.
- Consentimento acionado por automação de interface.
- Benchmark completo executado em máquina Windows real.
- Inventário conferido contra `dxdiag`.
- Arquivo temporário não permaneceu após o teste.
- Relatório visual inspecionado.

## Antes da distribuição pública

1. Migrar para uma versão LTS atual do .NET.
2. Versionar requisitos de jogos e registrar a fonte de cada perfil.
3. Adicionar testes automatizados dos cálculos de compatibilidade.
4. Produzir MSIX.
5. Configurar Azure Artifact Signing.
6. Publicar pela Microsoft Store.
7. Adicionar ícone e identidade visual definitivos.
8. Submeter cada release ao Microsoft Defender e acompanhar falsos positivos.
9. Revisar juridicamente consentimento e política de privacidade.
10. Projetar tokens temporários antes de qualquer integração com o site.

## Catálogo Top 10

O site expõe `GET /api/games/catalog` com versão de schema, versão editorial, plataformas, referências mínimas/recomendadas e alvos normalizados.

O agente:

1. carrega imediatamente os dez perfis embutidos;
2. tenta atualizar a lista com timeout de cinco segundos;
3. valida schema e conteúdo antes de aceitar a resposta;
4. mantém a seleção atual ao atualizar;
5. salva a última resposta válida em `%LOCALAPPDATA%`;
6. usa cache ou fallback quando está offline.
