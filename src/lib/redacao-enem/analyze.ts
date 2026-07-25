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
  if (w.length < 2) return true; // muito curta pra avaliar, não penaliza

  const vogaisCount = [...w].filter((c) => VOGAIS.has(c)).length;
  if (vogaisCount === 0 && w.length > 2) return false; // sem nenhuma vogal = improvável

  const proporcaoVogais = vogaisCount / w.length;
  if (proporcaoVogais < 0.15 || proporcaoVogais > 0.9) return false;

  // sequência de consoantes maior que 4 é rarissima em português
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

  // letra repetida 4+ vezes seguidas (ex: "ffff", "dddd")
  if (/([a-z])\1{3,}/.test(w)) return false;

  return true;
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
  if (totalPalavras < 15) return { invalido: false };

  const tokens = normalized.match(/[a-zà-ú]+/g) || [];
  if (tokens.length === 0) return { invalido: false };

  const funcionaisEncontradas = tokens.filter((t) => PALAVRAS_FUNCIONAIS.has(t)).length;
  const proporcaoFuncionais = funcionaisEncontradas / tokens.length;

  const plausiveis = tokens.filter((t) => palavraTemFormatoPlausivel(t)).length;
  const proporcaoPlausiveis = plausiveis / tokens.length;

  // Texto real em português quase sempre tem >8% de palavras funcionais (de, a, que, para...)
  // e a grande maioria das palavras com formato foneticamente plausível.
  if (proporcaoFuncionais < 0.04 && proporcaoPlausiveis < 0.65) {
    return {
      invalido: true,
      motivo:
        'O texto enviado parece ser uma sequência aleatória de letras (sem palavras reais em português), não uma redação. Escreva frases e parágrafos com sentido para receber uma estimativa de nota confiável.'
    };
  }

  return { invalido: false };
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
    const competenciasInvalidas: CompetenciaScore[] = [
      { id: 1, titulo: 'Domínio da norma culta', nota: 0, comentario: 'Ortografia, gramática e formalidade.' },
      { id: 2, titulo: 'Compreensão do tema', nota: 0, comentario: 'Desenvolvimento e repertório sobre o tema proposto.' },
      { id: 3, titulo: 'Argumentação', nota: 0, comentario: 'Organização das ideias e defesa de ponto de vista.' },
      { id: 4, titulo: 'Coesão textual', nota: 0, comentario: 'Conectivos e articulação entre parágrafos.' },
      { id: 5, titulo: 'Proposta de intervenção', nota: 0, comentario: 'Agente, ação, meio, finalidade e detalhamento.' }
    ];
    return {
      palavras,
      paragrafos,
      frases,
      notaTotalEstimada: 0,
      competencias: competenciasInvalidas,
      alertas: [deteccaoInvalido.motivo as string],
      pontosFortes: [],
      textoInvalido: true,
      avisoCritico: deteccaoInvalido.motivo
    };
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
  const palavrasUnicas = new Set(normalized.match(/[a-zà-ú]+/g) || []).size;
  const diversidadeLexical = palavras > 0 ? palavrasUnicas / palavras : 0;
  let nota2 = 120;
  if (palavras >= 250) nota2 += 40;
  if (palavras >= 350) nota2 += 20;
  if (diversidadeLexical > 0.55) nota2 += 20;
  if (palavras < 150) {
    alertas.push('Texto curto (menos de 150 palavras) dificulta desenvolver bem o tema.');
    nota2 -= 40;
  }
  nota2 = Math.max(0, Math.min(200, nota2));
  if (diversidadeLexical > 0.55) pontosFortes.push('Boa variedade de vocabulário.');

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
