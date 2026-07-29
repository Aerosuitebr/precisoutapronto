export interface DecimoTerceiroInput {
  salario: number;
  /** Avos no ano (1 a 12). Fração de 15+ dias no mês conta como 1 avo. */
  avos: number;
  mediaVariaveis?: number;
}

export interface DecimoTerceiroResult {
  baseCalculo: number;
  avos: number;
  totalBruto: number;
  primeiraParcela: number;
  segundaParcela: number;
  resumoLinhas: { label: string; value: number; info?: string }[];
}

/** Estimativa educativa do 13º salário CLT por avos. */
export function calcularDecimoTerceiro(input: DecimoTerceiroInput): DecimoTerceiroResult {
  const salario = Math.max(0, input.salario);
  const media = Math.max(0, input.mediaVariaveis ?? 0);
  const baseCalculo = salario + media;
  const avos = Math.min(12, Math.max(0, Math.floor(input.avos)));
  const totalBruto = (baseCalculo / 12) * avos;
  const primeiraParcela = totalBruto / 2;
  const segundaParcela = totalBruto - primeiraParcela;

  return {
    baseCalculo,
    avos,
    totalBruto,
    primeiraParcela,
    segundaParcela,
    resumoLinhas: [
      {
        label: '13º proporcional',
        value: totalBruto,
        info: `${avos}/12 avos`
      },
      {
        label: '1ª parcela (estimativa)',
        value: primeiraParcela,
        info: 'Metade do valor, em regra até novembro'
      },
      {
        label: '2ª parcela (estimativa)',
        value: segundaParcela,
        info: 'Saldo até dezembro, com eventuais descontos'
      }
    ]
  };
}
