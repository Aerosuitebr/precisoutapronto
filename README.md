# Resolva Jato

Hub de ferramentas gratuitas e freemium — orçamentos, contratos, currículo, Pix, documentos jurídicos e mais.

| Item | Valor |
|------|--------|
| Produto | Resolva Jato (hub) |
| Domínio | https://resolvajato.com.br |
| Staging | https://staging.resolvajato.com.br |
| Org | [Aerosuitebr](https://github.com/Aerosuitebr) |
| Stack | Next.js 15 · Prisma · PostgreSQL · Docker · Evolution WhatsApp |

## Ecossistema

| Repo | Papel |
|------|--------|
| **resolva-jato** (este) | Hub de ferramentas |
| [mira](https://github.com/Aerosuitebr/mira) | Busca B2B (empresas / profissionais) |
| [aerosuite](https://github.com/Aerosuitebr/aerosuite) | Marca + ops da plataforma |

O MIRA é integrado via `NEXT_PUBLIC_MIRA_URL` (produção: `https://search.aerosuite.com.br/escolher-busca?origem=resolva-jato`).

## Como rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

Produção Docker: veja [DOCKER.md](DOCKER.md).

## Documentação

- [Arquitetura de crescimento](docs/ARQUITETURA-CRESCIMENTO.md)
- [Ecossistema](docs/ECOSYSTEM.md)
