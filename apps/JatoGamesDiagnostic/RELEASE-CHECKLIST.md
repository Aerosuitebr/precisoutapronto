# Release readiness — Jato Games Diagnostic

## Automatizado em cada versão

- Compilar em .NET 10 LTS para `win-x64`, independente e em arquivo único.
- Executar `JatoGamesDiagnostic.Tests`.
- Gerar MSIX e SHA-256 com `build-msix.ps1`.
- Verificar assinatura Authenticode quando houver certificado.
- Executar verificação local do Microsoft Defender.
- Confirmar HTTPS e schema 2 do catálogo.
- Conferir que o JSON exportado não contém usuário ou nome da máquina.

## Matriz de hardware externa

Estes testes exigem máquinas físicas ou virtuais independentes e devem ser registrados no Partner Center antes da versão 1.0:

| Cenário | Cobertura mínima | Resultado |
|---|---|---|
| Sistema | Windows 10 22H2 e Windows 11 atual | Pendente de laboratório |
| CPU | Intel e AMD | Pendente de laboratório |
| Arquitetura | x64 | Suportada |
| ARM64 | Não suportada na 0.9.0 | Declarar na loja |
| GPU | NVIDIA, AMD e Intel integrada | Pendente de laboratório |
| Notebook híbrido | Integrada + dedicada | Regra automatizada; validar em hardware |
| RAM | 8, 16 e 32 GB | Pendente de laboratório |
| Disco | HDD, SATA SSD e NVMe | Pendente de laboratório |
| Idioma do Windows | Português e inglês | Pendente de laboratório |
| Escala visual | 100%, 125%, 150% e 200% | Pendente de laboratório |
| Instalação | limpa, atualização e desinstalação | Pendente após identidade do Partner Center |

## Dependências externas

- Substituir `Identity Name` e `Publisher` pelos valores exatos fornecidos pelo Partner Center.
- Reservar o nome do produto.
- Executar Windows App Certification Kit no pacote final.
- Obter assinatura pela Microsoft Store ou certificado OV para download direto.
- Submeter eventual falso positivo pelos canais oficiais do Microsoft Defender.
- Fazer revisão jurídica final dos textos públicos.

Nenhum item externo deve ser marcado como aprovado apenas por simulação local.
