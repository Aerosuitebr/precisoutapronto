export interface CompetenciaScore {
  id: number;
  titulo: string;
  nota: number; // 0-200
  comentario: string;
}

export interface RedacaoAnaliseResult {
  palavras: number;
  paragrafos: number;
  frases: number;
  notaTotalEstimada: number;
  competencias: CompetenciaScore[];
  alertas: string[];
  pontosFortes: string[];
  textoInvalido: boolean;
  avisoCritico?: string;
}

const CONECTIVOS = [
  'além disso',
  'portanto',
  'contudo',
  'entretanto',
  'dessa forma',
  'desse modo',
  'por conseguinte',
  'assim',
  'nesse sentido',
  'em suma',
  'ademais',
  'outrossim',
  'todavia',
  'no entanto',
  'por fim',
  'sobretudo',
  'ou seja',
  'isto é',
  'em vista disso',
  'diante disso'
];

const PROPOSTA_MARCADORES = [
  'para tanto',
  'a fim de',
  'cabe ao estado',
  'cabe ao governo',
  'é necessário que',
  'faz-se necessário',
  'deve-se',
  'por meio de',
  'com o intuito de',
  'promover',
  'implementar',
  'fiscalizar',
  'criar políticas',
  'ministério',
  'escolas',
  'mídia',
  'ong'
];

const GIRIAS = ['tipo assim', 'ai que', 'né', 'daí', 'coisa', 'trem', 'meu deus', 'pra caramba', 'muito louco'];

// Palavras funcionais (artigos, preposições, conjunções, pronomes) de altíssima frequência
// em qualquer texto real em português. Um texto coerente de 15+ palavras praticamente sempre
// contém várias delas. Sua ausência é um forte indício de "salada de letras" (teclado batido
// aleatoriamente) em vez de linguagem natural.
const PALAVRAS_FUNCIONAIS = new Set([
  'de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'não', 'os', 'as',
  'no', 'na', 'nos', 'nas', 'se', 'por', 'mais', 'dos', 'das', 'como', 'mas', 'ao', 'aos', 'às',
  'ele', 'ela', 'eles', 'elas', 'seu', 'sua', 'seus', 'suas', 'ou', 'quando', 'muito', 'já', 'eu',
  'também', 'só', 'pelo', 'pela', 'pelos', 'pelas', 'até', 'isso', 'entre', 'depois', 'sem',
  'mesmo', 'ter', 'quem', 'me', 'esse', 'essa', 'esses', 'essas', 'este', 'esta', 'estes', 'estas',
  'você', 'nós', 'lhe', 'lhes', 'tu', 'te', 'vocês', 'nosso', 'nossa', 'nossos', 'nossas', 'dele',
  'dela', 'deles', 'delas', 'isto', 'aquilo', 'é', 'são', 'foi', 'foram', 'ser', 'estar', 'está',
  'estão', 'há', 'sobre', 'assim', 'todo', 'toda', 'todos', 'todas', 'outro', 'outra', 'outros',
  'outras', 'qual', 'quais', 'porque', 'pois', 'então', 'bem', 'sim', 'ainda', 'hoje', 'sociedade',
  'brasil', 'brasileiro', 'brasileira', 'país', 'governo', 'pessoas', 'vida', 'forma'
]);

/** Artigos/conjunções curtos demais para sozinhos “provar” português (aparecem em mash de teclado). */
const FUNCIONAIS_FRACOS = new Set(['a', 'o', 'e', 'as', 'os', 'um', 'uns', 'é']);

/** Núcleo que quase sempre aparece em redação real. */
const FUNCIONAIS_NUCLEO = new Set([
  'de', 'que', 'do', 'da', 'em', 'para', 'com', 'não', 'no', 'na', 'por', 'mais', 'dos', 'das',
  'como', 'mas', 'ao', 'se', 'ou', 'quando', 'também', 'pelo', 'pela', 'até', 'entre', 'sem',
  'mesmo', 'porque', 'pois', 'então', 'sobre', 'assim', 'são', 'foi', 'ser', 'estar', 'há',
  'sociedade', 'brasil', 'governo', 'pessoas', 'uma'
]);

const TECLADO_HOME = new Set('asdfghjklçqwertyuiopzxcvbnm'.split(''));

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function countOccurrences(haystack: string, needle: string) {
  if (!needle) return 0;
  return haystack.split(needle).length - 1;
}

const VOGAIS = new Set(['a', 'e', 'i', 'o', 'u']);

/**
 * Heurística leve (sem dicionário completo) para avaliar se uma "palavra" tem formato
 * plausível em português: precisa ter vogais, não pode ter sequências enormes de
 * consoantes/vogais iguais ou repetidas, típicas de "asdkfjaskdjf" batido no teclado.
 */
function palavraTemFormatoPlausivel(palavraNormalizada: string): boolean {
  const w = palavraNormalizada.replace(/[^a-z]/g, '');
  if (w.length < 2) return true;

  const vogaisCount = [...w].filter((c) => VOGAIS.has(c)).length;
  if (vogaisCount === 0 && w.length > 2) return false;

  const proporcaoVogais = vogaisCount / w.length;
  if (proporcaoVogais < 0.15 || proporcaoVogais > 0.9) return false;

  let maiorSequenciaConsoantes = 0;
  let atual = 0;
  for (const c of w) {
    if (!VOGAIS.has(c)) {
      atual += 1;
      maiorSequenciaConsoantes = Math.max(maiorSequenciaConsoantes, atual);
    } else {
      atual = 0;
    }
  }
  if (maiorSequenciaConsoantes > 4) return false;

  if (/([a-z])\1{3,}/.test(w)) return false;

  // Poucas letras distintas em palavra longa: típico de "adasdasdas" / "qweqweqwe"
  const unicas = new Set(w).size;
  if (w.length >= 8 && unicas <= 3) return false;
  if (w.length >= 12 && unicas <= 4) return false;
  if (w.length >= 6 && unicas / w.length <= 0.28) return false;

  // Ciclo curto repetido (asd asd asd)
  if (w.length >= 6 && /^(.{2,4})\1+$/.test(w)) return false;

  return true;
}

/** Detecta mash de teclado (asdf, qwer, padrões asd/das). */
function pareceTecladoBatido(palavraNormalizada: string): boolean {
  const w = palavraNormalizada.replace(/[^a-z]/g, '');
  if (w.length < 4) return false;

  const soHomeRow = [...w].every((c) => TECLADO_HOME.has(c));
  const unicas = new Set(w).size;
  if (soHomeRow && w.length >= 6 && unicas <= 4) return true;

  if (/(asd|das|sda|ads|qwe|wer|rew|zxc|xcv|cvb){2,}/.test(w)) return true;
  if (/^([asdf]{2,4})\1+$/.test(w)) return true;

  // Alternância estreita a/d/s (ex.: adasdasdas)
  if (w.length >= 8 && /^[ads]+$/.test(w) && unicas <= 3) return true;

  return false;
}

export interface DeteccaoTextoInvalido {
  invalido: boolean;
  motivo?: string;
}

/**
 * Detecta texto sem sentido (letras aleatórias / teclado batido) antes de aplicar
 * qualquer heurística de nota, para não gerar elogios falsos (ex.: "boa variedade
 * de vocabulário") sobre um texto que não tem palavras reais.
 */
function detectarTextoInvalido(normalized: string, totalPalavras: number): DeteccaoTextoInvalido {
  if (totalPalavras < 8) return { invalido: false };

  const tokens = normalized.match(/[a-zà-ú]+/g) || [];
  if (tokens.length === 0) return { invalido: false };

  const funcionaisDistintas = new Set(tokens.filter((t) => PALAVRAS_FUNCIONAIS.has(t)));
  const funcionaisFortesDistintas = [...funcionaisDistintas].filter((t) => !FUNCIONAIS_FRACOS.has(t));
  const funcionaisNucleoDistintas = [...funcionaisDistintas].filter((t) => FUNCIONAIS_NUCLEO.has(t));

  const funcionaisFortesCount = tokens.filter(
    (t) => PALAVRAS_FUNCIONAIS.has(t) && !FUNCIONAIS_FRACOS.has(t)
  ).length;
  const proporcaoFuncionaisFortes = funcionaisFortesCount / tokens.length;

  const plausiveis = tokens.filter((t) => palavraTemFormatoPlausivel(t)).length;
  const proporcaoPlausiveis = plausiveis / tokens.length;

  const mash = tokens.filter((t) => pareceTecladoBatido(t)).length;
  const proporcaoMash = mash / tokens.length;

  const motivoPadrao =
    'O texto enviado parece ser uma sequência aleatória de letras (sem português coerente), não uma redação. Escreva frases e parágrafos com sentido para receber uma estimativa confiável.';

  // Núcleo lexical mínimo: redação real quase sempre tem várias palavras-função distintas
  if (totalPalavras >= 12 && funcionaisNucleoDistintas.length < 2 && funcionaisFortesDistintas.length < 3) {
    return { invalido: true, motivo: motivoPadrao };
  }

  if (totalPalavras >= 12 && proporcaoFuncionaisFortes < 0.06) {
    return { invalido: true, motivo: motivoPadrao };
  }

  if (proporcaoPlausiveis < 0.55) {
    return { invalido: true, motivo: motivoPadrao };
  }

  if (proporcaoMash >= 0.35) {
    return {
      invalido: true,
      motivo:
        'O texto parece digitado sem sentido (padrão de teclado / letras repetidas), sem frases em português. Reescreva a redação com introdução, desenvolvimento e conclusão.'
    };
  }

  return { invalido: false };
}

/** Nota baixa e honesta quando o texto não é uma redação válida. */
function resultadoTextoInvalido(
  palavras: number,
  paragrafos: number,
  frases: number,
  motivo: string
): RedacaoAnaliseResult {
  const competencias: CompetenciaScore[] = [
    {
      id: 1,
      titulo: 'Domínio da norma culta',
      nota: 40,
      comentario: 'Não há frases legíveis em português para avaliar ortografia e gramática.'
    },
    {
      id: 2,
      titulo: 'Compreensão do tema',
      nota: 40,
      comentario: 'Sem desenvolvimento do tema: o texto não apresenta ideias compreensíveis.'
    },
    {
      id: 3,
      titulo: 'Argumentação',
      nota: 40,
      comentario: 'Não há ponto de vista nem argumentos identificáveis.'
    },
    {
      id: 4,
      titulo: 'Coesão textual',
      nota: 40,
      comentario: 'Sem encadeamento entre frases ou parágrafos.'
    },
    {
      id: 5,
      titulo: 'Proposta de intervenção',
      nota: 40,
      comentario: 'Não há proposta de intervenção (agente, ação, meio e finalidade).'
    }
  ];

  return {
    palavras,
    paragrafos,
    frases,
    notaTotalEstimada: 200,
    competencias,
    alertas: [
      motivo,
      'Texto sem sentido ou ilegível: a estimativa fica no piso para não gerar falsa segurança.',
      'Escreva pelo menos 4 parágrafos em português, com tema claro, argumentos e conclusão com proposta.'
    ],
    pontosFortes: [],
    textoInvalido: true,
    avisoCritico: motivo
  };
}

export function analisarRedacao(texto: string): RedacaoAnaliseResult {
  const trimmed = texto.trim();
  const normalized = normalize(trimmed);
  const palavras = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const paragrafos = trimmed ? trimmed.split(/\n{1,}/).map((p) => p.trim()).filter(Boolean).length : 0;
  const frases = trimmed ? (trimmed.match(/[.!?]+/g) || []).length : 0;

  const alertas: string[] = [];
  const pontosFortes: string[] = [];

  const deteccaoInvalido = detectarTextoInvalido(normalized, palavras);
  if (deteccaoInvalido.invalido) {
    return resultadoTextoInvalido(palavras, paragrafos, frases, deteccaoInvalido.motivo as string);
  }

  // Competência 1: norma culta (heurística: repetição excessiva de palavras, gírias, tamanho de frases)
  const girias = GIRIAS.reduce((acc, g) => acc + countOccurrences(normalized, g), 0);
  const frasesMuitoLongas = trimmed
    .split(/[.!?]+/)
    .filter((f) => f.trim().split(/\s+/).filter(Boolean).length > 40).length;

  let nota1 = 160;
  if (girias > 0) {
    nota1 -= girias * 30;
    alertas.push('Evite gírias e linguagem informal: a Competência 1 exige norma culta.');
  }
  if (frasesMuitoLongas > 1) {
    nota1 -= 20;
    alertas.push('Algumas frases estão muito longas, o que pode indicar problema de pontuação/coesão.');
  }
  nota1 = Math.max(0, Math.min(200, nota1));

  // Competência 2: compreensão do tema e uso de repertório (proxy: tamanho do texto e diversidade lexical)
  const tokens = normalized.match(/[a-zà-ú]+/g) || [];
  const palavrasUnicas = new Set(tokens).size;
  const diversidadeLexical = palavras > 0 ? palavrasUnicas / palavras : 0;
  const funcionaisFortes = tokens.filter((t) => PALAVRAS_FUNCIONAIS.has(t) && !FUNCIONAIS_FRACOS.has(t));
  const temPortuguesMinimo = funcionaisFortes.length >= 4;

  let nota2 = 120;
  if (palavras >= 250) nota2 += 40;
  if (palavras >= 350) nota2 += 20;
  // Diversidade só conta se o texto tem português mínimo (evita elogiar mash de teclado)
  if (diversidadeLexical > 0.55 && temPortuguesMinimo && palavras >= 120) nota2 += 20;
  if (palavras < 150) {
    alertas.push('Texto curto (menos de 150 palavras) dificulta desenvolver bem o tema.');
    nota2 -= 40;
  }
  nota2 = Math.max(0, Math.min(200, nota2));
  if (diversidadeLexical > 0.55 && temPortuguesMinimo && palavras >= 120) {
    pontosFortes.push('Boa variedade de vocabulário.');
  }

  // Competência 3: argumentação (proxy: presença de dados/repertório e nº de parágrafos)
  let nota3 = 120;
  if (paragrafos >= 4) nota3 += 30;
  else {
    alertas.push('Estrutura ideal do ENEM costuma ter 4 a 5 parágrafos (introdução, 2 desenvolvimentos, conclusão).');
    nota3 -= 20;
  }
  if (/\d{4}/.test(trimmed) || /segundo|de acordo com|dados do/i.test(trimmed)) {
    nota3 += 30;
    pontosFortes.push('Uso de dados/repertório sociocultural identificado.');
  }
  nota3 = Math.max(0, Math.min(200, nota3));

  // Competência 4: coesão (proxy: conectivos)
  const conectivosEncontrados = CONECTIVOS.filter((c) => normalized.includes(c));
  let nota4 = 100;
  nota4 += Math.min(conectivosEncontrados.length * 15, 90);
  if (conectivosEncontrados.length === 0) {
    alertas.push('Nenhum conectivo de coesão identificado (ex: "portanto", "além disso", "entretanto").');
  } else {
    pontosFortes.push(`${conectivosEncontrados.length} conectivo(s) de coesão identificado(s).`);
  }
  nota4 = Math.max(0, Math.min(200, nota4));

  // Competência 5: proposta de intervenção (proxy: presença de marcadores de proposta no último parágrafo)
  const ultimoParagrafo = normalize(trimmed.split(/\n{1,}/).filter(Boolean).slice(-1)[0] || '');
  const marcadoresProposta = PROPOSTA_MARCADORES.filter((m) => ultimoParagrafo.includes(m));
  let nota5 = 80;
  if (marcadoresProposta.length >= 2) {
    nota5 = 180;
    pontosFortes.push('Proposta de intervenção com agente e ação identificáveis.');
  } else if (marcadoresProposta.length === 1) {
    nota5 = 130;
    alertas.push('Proposta de intervenção incompleta: detalhe agente, ação, meio e finalidade.');
  } else {
    alertas.push(
      'Não identificamos uma proposta de intervenção clara no último parágrafo (agente + ação + meio + finalidade).'
    );
  }
  nota5 = Math.max(0, Math.min(200, nota5));

  const competencias: CompetenciaScore[] = [
    { id: 1, titulo: 'Domínio da norma culta', nota: nota1, comentario: 'Ortografia, gramática e formalidade.' },
    { id: 2, titulo: 'Compreensão do tema', nota: nota2, comentario: 'Desenvolvimento e repertório sobre o tema proposto.' },
    { id: 3, titulo: 'Argumentação', nota: nota3, comentario: 'Organização das ideias e defesa de ponto de vista.' },
    { id: 4, titulo: 'Coesão textual', nota: nota4, comentario: 'Conectivos e articulação entre parágrafos.' },
    { id: 5, titulo: 'Proposta de intervenção', nota: nota5, comentario: 'Agente, ação, meio, finalidade e detalhamento.' }
  ];

  const notaTotalEstimada = competencias.reduce((acc, c) => acc + c.nota, 0);

  if (paragrafos >= 4 && paragrafos <= 5) pontosFortes.push('Estrutura em parágrafos dentro do esperado pelo ENEM.');

  return {
    palavras,
    paragrafos,
    frases,
    notaTotalEstimada,
    competencias,
    alertas,
    pontosFortes,
    textoInvalido: false
  };
}
