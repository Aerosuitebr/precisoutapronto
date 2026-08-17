export const ACCOUNT_SECTIONS = [
  {
    id: 'documentos',
    label: 'Meus documentos',
    description: 'Retomar, buscar e duplicar',
    href: '/conta#documentos'
  },
  {
    id: 'compartilhamentos',
    label: 'Compartilhamentos',
    description: 'Links, acessos e desempenho',
    href: '/conta#compartilhamentos'
  },
  {
    id: 'resultados',
    label: 'Resultados Jato',
    description: 'Cálculos salvos neste aparelho',
    href: '/conta#resultados'
  },
  {
    id: 'perfil',
    label: 'Perfil profissional',
    description: 'Segmento e memória',
    href: '/conta#perfil'
  },
  {
    id: 'indicacoes',
    label: 'Indicações',
    description: 'Convites e recompensas',
    href: '/conta#indicacoes'
  }
] as const;

export type AccountSectionId = (typeof ACCOUNT_SECTIONS)[number]['id'];
