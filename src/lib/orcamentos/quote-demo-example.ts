import type { OrcamentoItem } from './types';

export const QUOTE_DEMO_EXAMPLE = {
  name: 'Elétrica Silva',
  client: 'Cliente de exemplo',
  items: [
    { id: 'service', nome: 'Instalação de tomadas', quantidade: 1, valorUnitario: 350 },
    { id: 'materials', nome: 'Materiais elétricos', quantidade: 1, valorUnitario: 140 }
  ] satisfies OrcamentoItem[]
};
