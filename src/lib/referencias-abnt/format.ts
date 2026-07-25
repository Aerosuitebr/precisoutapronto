import type { Referencia } from './types';

const MESES = [
  'jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.',
  'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'
];

/**
 * Normaliza autor(es) para o padrão ABNT: SOBRENOME, Nome.
 * Aceita múltiplos autores separados por ";".
 * Se o usuário já digitar "Sobrenome, Nome" mantém a ordem, só maiusculiza o sobrenome.
 */
export function formatarAutorAbnt(autorInput: string): string {
  const partes = autorInput
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean);
  if (partes.length === 0) return '';

  const formatados = partes.map((parte) => {
    if (parte.includes(',')) {
      const [sobrenome, ...resto] = parte.split(',');
      const nome = resto.join(',').trim();
      return `${sobrenome.trim().toUpperCase()}${nome ? `, ${nome}` : ''}`;
    }
    const tokens = parte.trim().split(/\s+/);
    if (tokens.length === 1) return tokens[0].toUpperCase();
    const sobrenome = tokens[tokens.length - 1].toUpperCase();
    const nome = tokens.slice(0, -1).join(' ');
    return `${sobrenome}, ${nome}`;
  });

  return formatados.join('; ');
}

function formatarDataAcesso(dataAcesso: string): string {
  if (!dataAcesso) return '';
  const [ano, mes, dia] = dataAcesso.split('-');
  if (!ano || !mes || !dia) return dataAcesso;
  const mesLabel = MESES[Number(mes) - 1] ?? mes;
  return `${Number(dia)} ${mesLabel} ${ano}`;
}

export function formatarReferenciaAbnt(ref: Referencia): string {
  const autor = formatarAutorAbnt(ref.autor);
  const titulo = ref.titulo.trim();
  const ano = ref.ano.trim();

  if (ref.tipo === 'livro') {
    const edicaoTxt = ref.edicao ? `${ref.edicao}. ` : '';
    return [
      `${autor}.`,
      `${titulo}.`,
      edicaoTxt ? edicaoTxt.trim() + '.' : '',
      `${ref.cidade ? ref.cidade + ':' : ''} ${ref.editora}, ${ano}.`
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+\./g, '.')
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (ref.tipo === 'artigo') {
    const partes = [`${autor}.`, `${titulo}.`, `${ref.revista}${ref.cidade ? `, ${ref.cidade}` : ''}`];
    const tecnicos: string[] = [];
    if (ref.volume) tecnicos.push(`v. ${ref.volume}`);
    if (ref.numero) tecnicos.push(`n. ${ref.numero}`);
    if (ref.paginas) tecnicos.push(`p. ${ref.paginas}`);
    const tecnicosStr = tecnicos.length ? `, ${tecnicos.join(', ')}` : '';
    return `${partes.join(' ')}${tecnicosStr}, ${ano}.`;
  }

  // site
  const acesso = formatarDataAcesso(ref.dataAcesso);
  return [
    `${autor}.`,
    `${titulo}.`,
    `${ref.nomeSite}, ${ano}.`,
    `Disponível em: ${ref.url}.`,
    acesso ? `Acesso em: ${acesso}.` : ''
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ordenarReferencias(refs: Referencia[]): Referencia[] {
  return [...refs].sort((a, b) =>
    formatarAutorAbnt(a.autor).localeCompare(formatarAutorAbnt(b.autor), 'pt-BR')
  );
}

export function gerarCitacaoCurta(ref: Referencia): string {
  const primeiroAutor = ref.autor.split(';')[0]?.trim() ?? '';
  let sobrenome = primeiroAutor;
  if (primeiroAutor.includes(',')) {
    sobrenome = primeiroAutor.split(',')[0].trim();
  } else {
    const tokens = primeiroAutor.split(/\s+/);
    sobrenome = tokens[tokens.length - 1] ?? primeiroAutor;
  }
  return `(${sobrenome.toUpperCase()}, ${ref.ano})`;
}
