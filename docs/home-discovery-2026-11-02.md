# Nova home — 2 de novembro de 2026

## Experiência implementada

- Cabeçalho fixo com acesso a Ferramentas, Como funciona e Para profissionais; navegação compacta também no celular.
- Hero mantém a promessa de orçamento e apresenta orçamento, recibo, cálculos e gerador de link em abas acessíveis por teclado. CTA e prévia ilustrativa acompanham a intenção. Cálculos oferecem escolha de férias, rescisão ou 13º antes de abrir a ferramenta.
- Seis ferramentas logo após o hero, catálogo expansível e busca abaixo do grid, antes do fluxo Monte/Envie/Feche.
- Busca com sugestões, seleção por setas/Enter, fechamento por Escape e ao sair do bloco. Texto livre da busca deixou de ser enviado nos eventos de analytics; os eventos registram somente o resultado selecionado e destino.
- Profissões apontam diretamente para #montar nos modelos existentes, que já carregam os itens profissionais.
- Nova ferramenta /gerador-de-link-whatsapp: valida formato brasileiro com código 55 e DDD, codifica mensagem opcional e permite copiar o link. Sem envio automático. Número e mensagem permanecem no navegador; nenhuma dessas informações é enviada para analytics. O link contém o número para contato e isso está explicado no formulário.
- Ferramenta integrada à busca, catálogo e sitemap. Descrição da home e data editorial do sitemap alinhadas ao conteúdo revisado. Título da home preservado.

## Validação

- TypeScript aprovado.
- Auditoria SEO: 167 rotas aprovadas.
- Build de produção: 310 páginas geradas. Dois avisos preexistentes sobre imagens permanecem.
- 18 testes aprovados contra a prévia local de produção: cinco novos testes de interação, quatro de marca/layout, seis de cobertura SEO e três de metadados/hidratação.
- Capturas desktop 1440px e celular 390px inspecionadas; teste adicional de overflow nas quatro abas a 360px aprovado.
- Capturas em output/home-discovery-desktop.png e output/home-discovery-mobile.png.

Mudanças locais, sem publicação em produção ou envios externos. Aumento de uso depende de medição após publicação; os testes verificam funcionamento, não resultado comercial.
