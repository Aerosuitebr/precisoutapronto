import {
  BookOpen,
  Briefcase,
  Calculator,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  FileStack,
  FileText,
  Gavel,
  ImageOff,
  GraduationCap,
  Mail,
  MapPin,
  PenLine,
  Receipt,
  Scale,
  Sparkles,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAppEnv } from "@/lib/app-env";

export type ToolCategoryId =
  "juridico" | "contabeis" | "negocios" | "carreira" | "organizacao";

export interface ToolCategory {
  id: ToolCategoryId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  accentBar: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  /** Texto curto padronizado (~1 linha) para cards da hub. */
  description: string;
  /** Ajuda contextual (tooltip / leitor de tela). */
  tip?: string;
  href: string;
  icon: LucideIcon;
  categoryId: ToolCategoryId;
  actionLabel: string;
  keywords: string[];
  premiumOnly?: boolean;
  status: "available" | "beta" | "soon";
}

export const toolCategories: ToolCategory[] = [
  {
    id: "juridico",
    label: "Advogados e jurídico",
    shortLabel: "Jurídico",
    description: "Peças e contratos do dia a dia do escritório.",
    icon: Gavel,
    iconClass: "bg-amber-100 text-amber-900",
    accentBar: "bg-amber-400",
  },
  {
    id: "contabeis",
    label: "Contadores e despachantes",
    shortLabel: "Contabilidade",
    description:
      "Documentos dinâmicos para rotina contábil, fiscal e de despacho.",
    icon: Calculator,
    iconClass: "bg-cyan-100 text-cyan-900",
    accentBar: "bg-cyan-500",
  },
  {
    id: "negocios",
    label: "Autônomos e negócios",
    shortLabel: "Negócios",
    description: "Orçamentos, cobrança, propostas e recibos.",
    icon: Briefcase,
    iconClass: "bg-sky-100 text-sky-800",
    accentBar: "bg-sky-500",
  },
  {
    id: "carreira",
    label: "Estudantes e carreira",
    shortLabel: "Estudantes",
    description: "Documentos jurídicos acadêmicos, redação, referências, currículos e capas.",
    icon: GraduationCap,
    iconClass: "bg-teal-100 text-teal-800",
    accentBar: "bg-teal-500",
  },
  {
    id: "organizacao",
    label: "Organização",
    shortLabel: "Organização",
    description: "Agenda e rotina para não perder prazo.",
    icon: Users,
    iconClass: "bg-emerald-100 text-emerald-800",
    accentBar: "bg-emerald-500",
  },
];

export const toolsCatalog: ToolDefinition[] = [
  {
    id: "mira",
    name: "MIRA",
    description: "Encontre empresas para prospectar ou profissionais próximos do local do serviço.",
    tip: "Escolha entre a busca empresarial e a busca de profissionais por proximidade.",
    href: process.env.NEXT_PUBLIC_MIRA_URL || (process.env.NODE_ENV === "development"
      ? "http://localhost:4201/escolher-busca?origem=precisoutapronto"
      : "https://search.aerosuite.com.br/escolher-busca?origem=precisoutapronto"),
    icon: MapPin,
    categoryId: "negocios",
    actionLabel: "Abrir o MIRA",
    keywords: ["mira", "empresas", "prospecção", "profissionais", "serviços", "perto", "localização"],
    // Em produção fica oculto (status soon); staging/dev mostram normalmente.
    status: getAppEnv() === "production" ? "soon" : "available",
  },
  {
    id: "juridicos",
    name: "Documentos Jurídicos",
    description:
      "Procuração, honorários, notificação e peças do dia a dia em PDF.",
    tip: "Substabelecimento: transferência de poderes de uma procuração a outro advogado.",
    href: "/ferramentas/juridicos",
    icon: Gavel,
    categoryId: "juridico",
    actionLabel: "Criar documento",
    keywords: [
      "procuração",
      "honorários",
      "substabelecimento",
      "hipossuficiência",
      "notificação",
      "advogado",
      "oab",
    ],
    status: "available",
  },
  {
    id: "contratos",
    name: "Contratos",
    description:
      "Aluguel, serviços, trabalho, compra e venda ou comodato em PDF.",
    tip: "Comodato: empréstimo gratuito de um bem, com devolução combinada.",
    href: "/ferramentas/contratos",
    icon: Scale,
    categoryId: "juridico",
    actionLabel: "Montar contrato",
    keywords: [
      "aluguel",
      "locação",
      "serviços",
      "trabalho",
      "compra",
      "venda",
      "comodato",
      "contrato",
    ],
    status: "available",
  },
  {
    id: "contabeis",
    name: "Docs Contábeis e Despacho",
    description: "Procuração, e-CAC, residência e cartas para rotina fiscal.",
    tip: "e-CAC: portal da Receita Federal para serviços digitais do contribuinte.",
    href: "/ferramentas/contabeis",
    icon: Calculator,
    categoryId: "contabeis",
    actionLabel: "Criar documento",
    keywords: [
      "contábil",
      "despachante",
      "e-cac",
      "residência",
      "responsabilidade",
      "fiscal",
    ],
    status: "available",
  },
  {
    id: "recibos",
    name: "Recibos",
    description:
      "Recibos simples ou personalizados, prontos para enviar ou imprimir.",
    href: "/ferramentas/recibos",
    icon: Receipt,
    categoryId: "contabeis",
    actionLabel: "Gerar recibo",
    keywords: ["recibo", "pagamento", "universitário", "quitação"],
    status: "beta",
  },
  {
    id: "orcamentos",
    name: "Orçamentos",
    description: "Orçamento com link para o cliente aprovar ou pedir ajuste.",
    href: "/ferramentas/orcamentos",
    icon: ClipboardList,
    categoryId: "negocios",
    actionLabel: "Criar orçamento",
    keywords: ["orçamento", "aprovação", "cliente", "proposta de valor"],
    status: "available",
  },
  {
    id: "pix",
    name: "Cobrança Pix",
    description: "QR Code e Pix Copia e Cola no navegador, sem taxa de API.",
    href: "/ferramentas/pix",
    icon: Wallet,
    categoryId: "negocios",
    actionLabel: "Gerar cobrança Pix",
    keywords: ["pix", "qr code", "cobrança", "pagamento", "copia e cola"],
    status: "available",
  },
  {
    id: "propostas",
    name: "Propostas Comerciais",
    description:
      "Proposta com identidade visual, envio e histórico organizado.",
    href: "/ferramentas/propostas",
    icon: FileText,
    categoryId: "negocios",
    actionLabel: "Criar proposta",
    keywords: ["proposta", "comercial", "venda", "agência"],
    status: "available",
  },
  {
    id: "curriculo",
    name: "Currículos",
    description:
      "Currículo universitário ou profissional, pronto em poucos minutos.",
    href: "/ferramentas/curriculo",
    icon: GraduationCap,
    categoryId: "carreira",
    actionLabel: "Montar currículo",
    keywords: ["currículo", "cv", "emprego", "vaga"],
    status: "available",
  },
  {
    id: "curriculo-lattes",
    name: "Lattes Inteligente",
    description:
      "Trajetória acadêmica organizada, com revisão e PDF para editais.",
    tip: "Não envia dados à Plataforma Lattes oficial. Apenas organiza o seu currículo acadêmico.",
    href: "/ferramentas/curriculo-lattes",
    icon: GraduationCap,
    categoryId: "carreira",
    actionLabel: "Criar currículo acadêmico",
    keywords: [
      "lattes",
      "cnpq",
      "acadêmico",
      "pesquisa",
      "orcid",
      "doi",
      "publicações",
    ],
    status: "beta",
  },
  {
    id: "trabalhos",
    name: "Capas de Trabalho",
    description:
      "Capas escolares e universitárias no padrão ABNT para imprimir.",
    tip: "ABNT: normas técnicas brasileiras para trabalhos acadêmicos.",
    href: "/ferramentas/trabalhos",
    icon: BookOpen,
    categoryId: "carreira",
    actionLabel: "Gerar capa",
    keywords: [
      "capa",
      "abnt",
      "trabalho",
      "escola",
      "faculdade",
      "folha de rosto",
    ],
    status: "available",
  },
  {
    id: "agenda",
    name: "Agenda",
    description: "Compromissos, lembretes e visão semanal dos seus prazos.",
    href: "/ferramentas/agenda",
    icon: CalendarDays,
    categoryId: "organizacao",
    actionLabel: "Abrir agenda",
    keywords: ["agenda", "calendário", "compromisso", "lembrete", "prazo"],
    premiumOnly: true,
    status: "beta",
  },
  {
    id: "rescisao",
    name: "Calculadora de Rescisão",
    description:
      "Saldo de salário, 13º, férias, aviso prévio e multa do FGTS em segundos.",
    tip: "Estimativa educativa: valores brutos, sem descontos de INSS/IRRF.",
    href: "/ferramentas/rescisao",
    icon: Scale,
    categoryId: "juridico",
    actionLabel: "Calcular rescisão",
    keywords: [
      "rescisão",
      "trabalhista",
      "demissão",
      "aviso prévio",
      "fgts",
      "13º",
      "férias",
      "clt",
    ],
    status: "beta",
  },
  {
    id: "ferias",
    name: "Calculadora de Férias",
    description: "Calcule férias integrais ou proporcionais, adicional de 1/3 e abono pecuniário.",
    tip: "Estimativa educativa para conferência de férias CLT.",
    href: "/calculadora-de-ferias",
    icon: CalendarRange,
    categoryId: "contabeis",
    actionLabel: "Calcular férias",
    keywords: ["férias", "ferias", "salário", "clt", "abono", "um terço", "proporcional", "vender férias"],
    status: "beta",
  },
  {
    id: "decimo-terceiro",
    name: "Calculadora de 13º Salário",
    description: "Calcule primeira e segunda parcela do décimo terceiro, inclusive proporcional.",
    tip: "Estimativa educativa do 13º salário bruto e suas parcelas.",
    href: "/calculadora-de-decimo-terceiro",
    icon: Wallet,
    categoryId: "contabeis",
    actionLabel: "Calcular 13º salário",
    keywords: ["13º", "13 salario", "décimo terceiro", "decimo terceiro", "parcelas", "proporcional", "clt"],
    status: "beta",
  },
  {
    id: "mei-vs-clt",
    name: "MEI vs CLT",
    description:
      "Compare o líquido mensal como CLT com o lucro estimado como MEI.",
    href: "/ferramentas/mei-vs-clt",
    icon: Scale,
    categoryId: "contabeis",
    actionLabel: "Comparar cenários",
    keywords: [
      "mei",
      "clt",
      "autônomo",
      "simulador",
      "inss",
      "irrf",
      "das",
      "salário líquido",
    ],
    status: "beta",
  },
  {
    id: "precificacao",
    name: "Calculadora de Precificação",
    description:
      "Descubra o preço ideal do seu produto ou serviço com margem real.",
    href: "/ferramentas/precificacao",
    icon: Tag,
    categoryId: "negocios",
    actionLabel: "Calcular preço",
    keywords: ["precificação", "preço", "margem", "markup", "lucro", "custo"],
    status: "beta",
  },
  {
    id: "redacao-enem",
    name: "Corretor de Redação ENEM",
    description:
      "Estimativa de nota por competência, com pontos fortes e alertas.",
    tip: "Estimativa automática por heurísticas. Não substitui a correção humana.",
    href: "/corretor-de-redacao-enem",
    icon: PenLine,
    categoryId: "carreira",
    actionLabel: "Corrigir redação",
    keywords: [
      "redação",
      "enem",
      "competência",
      "nota",
      "vestibular",
      "texto dissertativo",
    ],
    status: "beta",
  },
  {
    id: "cronograma-estudos",
    name: "Cronograma de Estudos",
    description:
      "Distribuição semanal automática por matéria, peso e tempo disponível.",
    href: "/ferramentas/cronograma-estudos",
    icon: CalendarRange,
    categoryId: "carreira",
    actionLabel: "Montar cronograma",
    keywords: [
      "cronograma",
      "estudos",
      "enem",
      "concurso",
      "vestibular",
      "plano de estudo",
    ],
    status: "beta",
  },
  {
    id: "divisor-conta",
    name: "Divisor de Conta em Grupo",
    description:
      "Rateie churrasco, restaurante ou viagem entre amigos, com taxa de serviço.",
    href: "/ferramentas/divisor-conta",
    icon: Users,
    categoryId: "organizacao",
    actionLabel: "Dividir conta",
    keywords: [
      "divisor",
      "conta",
      "rateio",
      "churrasco",
      "restaurante",
      "viagem",
      "amigos",
    ],
    status: "beta",
  },
  {
    id: "editor-pdf",
    name: "Editor de PDF",
    description:
      "Edite texto e imagens, redimensione páginas, junte, gire e extraia PDFs.",
    tip: "Tudo roda no seu navegador. O arquivo nunca é enviado para um servidor.",
    href: "/ferramentas/editor-pdf",
    icon: FileStack,
    categoryId: "organizacao",
    actionLabel: "Editar PDF",
    keywords: [
      "pdf",
      "editor",
      "texto",
      "redimensionar",
      "mesclar",
      "juntar",
      "unir",
      "dividir",
      "extrair",
      "girar",
      "página",
      "marca d\u0027água",
    ],
    status: "beta",
  },
  {
    id: "remover-fundo",
    name: "Removedor de Fundo de Imagem",
    description: "Recorte automático por IA e download em PNG transparente.",
    tip: "Processamento 100% local, direto no navegador.",
    href: "/ferramentas/remover-fundo",
    icon: ImageOff,
    categoryId: "organizacao",
    actionLabel: "Remover fundo",
    keywords: [
      "remover fundo",
      "imagem",
      "foto",
      "png",
      "transparente",
      "recorte",
      "background removal",
    ],
    status: "beta",
  },
  {
    id: "referencias-abnt",
    name: "Referências ABNT",
    description:
      "Gere referências de sites, livros e artigos no padrão ABNT, já ordenadas.",
    tip: "Baseado nas regras gerais da NBR 6023 para referências bibliográficas.",
    href: "/ferramentas/referencias-abnt",
    icon: BookOpen,
    categoryId: "carreira",
    actionLabel: "Gerar referência",
    keywords: [
      "referência",
      "abnt",
      "bibliografia",
      "citação",
      "trabalho acadêmico",
      "tcc",
      "nbr 6023",
    ],
    status: "beta",
  },
  {
    id: "assinatura-email",
    name: "Assinatura de E-mail",
    description:
      "Monte uma assinatura profissional com logo, cores e redes sociais.",
    tip: "Copie pronta para colar nas configurações do Gmail ou Outlook.",
    href: "/ferramentas/assinatura-email",
    icon: Mail,
    categoryId: "negocios",
    actionLabel: "Criar assinatura",
    keywords: [
      "assinatura",
      "e-mail",
      "email",
      "gmail",
      "outlook",
      "profissional",
      "logo",
    ],
    status: "beta",
  },
  {
    id: "cronograma-entregas",
    name: "Cronograma de Entregas",
    description:
      "Monte um cronograma visual das etapas do projeto e envie no WhatsApp.",
    tip: "Ideal para anexar junto com propostas comerciais e orçamentos.",
    href: "/ferramentas/cronograma-entregas",
    icon: CalendarRange,
    categoryId: "negocios",
    actionLabel: "Montar cronograma",
    keywords: [
      "cronograma",
      "entregas",
      "gantt",
      "projeto",
      "etapas",
      "prazo",
      "freelancer",
    ],
    status: "beta",
  },
];

/** Atalhos do wizard inicial (“O que você precisa?”). */
export const toolIntentOptions: Array<{
  id: string;
  label: string;
  hint: string;
  toolId: string;
}> = [
  {
    id: "contrato",
    label: "Contrato",
    hint: "Aluguel, serviços, comodato…",
    toolId: "contratos",
  },
  {
    id: "recibo",
    label: "Recibo",
    hint: "Comprovar um pagamento",
    toolId: "recibos",
  },
  {
    id: "curriculo",
    label: "Currículo",
    hint: "CV ou Lattes",
    toolId: "curriculo",
  },
  {
    id: "orcamento",
    label: "Orçamento",
    hint: "Enviar valor ao cliente",
    toolId: "orcamentos",
  },
  { id: "pix", label: "Cobrar no Pix", hint: "QR Code na hora", toolId: "pix" },
  {
    id: "juridico",
    label: "Doc. jurídico",
    hint: "Procuração e afins",
    toolId: "juridicos",
  },
];

export function getToolsByCategory(categoryId: ToolCategoryId) {
  return toolsCatalog.filter((tool) => tool.categoryId === categoryId);
}

export function getToolCategory(categoryId: ToolCategoryId) {
  return (
    toolCategories.find((item) => item.id === categoryId) ?? toolCategories[0]
  );
}

export function getToolById(toolId: string) {
  return toolsCatalog.find((tool) => tool.id === toolId) ?? null;
}

function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const SEARCH_STOP_WORDS = new Set([
  "a", "ao", "as", "com", "como", "de", "do", "e", "em", "essa", "esse",
  "eu", "fazer", "meu", "minha", "no", "o", "os", "para", "preciso", "quero",
  "uma", "um"
]);

function searchStem(token: string) {
  if (token.length > 4 && token.endsWith("ns")) return `${token.slice(0, -2)}m`;
  if (token.length > 3 && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

function searchTokens(value: string) {
  return normalizeSearchText(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token))
    .map(searchStem);
}

function editDistance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[right.length];
}

function tokenScore(queryToken: string, candidate: string) {
  if (candidate === queryToken) return 12;
  if (candidate.startsWith(queryToken) || queryToken.startsWith(candidate)) return 8;
  if (candidate.includes(queryToken) || queryToken.includes(candidate)) return 5;
  if (queryToken.length >= 5 && candidate.length >= 5 && editDistance(queryToken, candidate) <= 1) return 3;
  return 0;
}

export function rankTools(query: string): ToolDefinition[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return toolsCatalog.filter((tool) => tool.status !== "soon");
  const queryWords = searchTokens(query);
  if (!queryWords.length) return [];

  return toolsCatalog
    .filter((tool) => tool.status !== "soon")
    .map((tool) => {
      const category = getToolCategory(tool.categoryId);
      const titleWords = searchTokens(`${tool.name} ${tool.actionLabel}`);
      const detailWords = searchTokens(`${tool.description} ${tool.tip || ""} ${category.label} ${category.shortLabel} ${tool.keywords.join(" ")}`);
      const matchedScores = queryWords.map((word) => Math.max(
        ...titleWords.map((candidate) => tokenScore(word, candidate) * 3),
        ...detailWords.map((candidate) => tokenScore(word, candidate))
      ));
      const matchedWords = matchedScores.filter(Boolean).length;
      const phraseBonus = normalizeSearchText(`${tool.name} ${tool.actionLabel} ${tool.keywords.join(" ")}`).includes(normalized) ? 40 : 0;
      const coverageBonus = matchedWords === queryWords.length ? 20 : 0;
      return { tool, score: matchedScores.reduce((sum, score) => sum + score, 0) + phraseBonus + coverageBonus, matchedWords };
    })
    .filter(({ score, matchedWords }) => score > 0 && matchedWords >= Math.ceil(queryWords.length / 2))
    .sort((left, right) => right.score - left.score || left.tool.name.localeCompare(right.tool.name, "pt-BR"))
    .map(({ tool }) => tool);
}

export function searchTools(query: string): ToolDefinition[] {
  return rankTools(query);
}

export const valueHighlights = [
  {
    title: "Busca sempre gratuita",
    description: "Explore centenas de links úteis sem cadastro e sem custo.",
    icon: Sparkles,
  },
  {
    title: "Documentos profissionais",
    description: "Orçamentos, Pix, recibos, contratos e currículo em PDF.",
    icon: FileText,
  },
  {
    title: "Totalmente grátis",
    description: "Cadastre-se com e-mail e gere documentos sem pagar nada.",
    icon: GraduationCap,
  },
  {
    title: "Pronto para o WhatsApp",
    description: "Links, QR Pix e PDFs pensados para enviar na hora.",
    icon: CalendarDays,
  },
];
