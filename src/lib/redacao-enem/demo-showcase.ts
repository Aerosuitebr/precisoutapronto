/**
 * Demo da home: texto coerente + notas vindas de `analisarRedacao` (sem inventar score).
 * Atualize as notas se mudar o texto, rodando o analisador de novo.
 */
export const REDACAO_HOME_DEMO = {
  tema: 'Desigualdade no acesso à internet e cidadania digital no Brasil',
  trecho:
    'A democratização do acesso à internet no Brasil ainda esbarra em desigualdades regionais e sociais que comprometem a cidadania digital. Em muitas periferias e áreas rurais, a conexão instável limita estudos e serviços públicos online.',
  palavras: 230,
  notaTotal: 820,
  competencias: [
    { id: 1, label: 'C1 · Norma culta', nota: 160 },
    { id: 2, label: 'C2 · Tema', nota: 140 },
    { id: 3, label: 'C3 · Argumentação', nota: 180 },
    { id: 4, label: 'C4 · Coesão', nota: 160 },
    { id: 5, label: 'C5 · Intervenção', nota: 180 }
  ],
  pontosFortes: [
    'Uso de dados/repertório sociocultural identificado.',
    'Proposta de intervenção com agente e ação identificáveis.'
  ]
} as const;
