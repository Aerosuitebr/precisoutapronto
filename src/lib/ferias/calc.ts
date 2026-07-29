export interface FeriasInput {
  salario: number;
  diasGozo: number;
  /** Dias convertidos em abono pecuniário (até 10, ou 1/3 do período). */
  diasAbono: number;
  mediaVariaveis?: number;
}

export interface FeriasResult {
  baseCalculo: number;
  valorFerias: number;
  tercoFerias: number;
  valorAbono: number;
  tercoAbono: number;
  totalBruto: number;
  resumoLinhas: { label: string; value: number; info?: string }[];
}

/** Estimativa educativa de férias CLT com 1/3 constitucional e abono opcional. */
export function calcularFerias(input: FeriasInput): FeriasResult {
  const salario = Math.max(0, input.salario);
  const media = Math.max(0, input.mediaVariaveis ?? 0);
  const baseCalculo = salario + media;
  const diasGozo = Math.min(30, Math.max(0, Math.floor(input.diasGozo)));
  const maxAbono = Math.min(10, Math.floor(diasGozo / 3) || 10);
  const diasAbono = Math.min(maxAbono, Math.max(0, Math.floor(input.diasAbono)));
  const diasPagosGozo = Math.max(0, diasGozo - diasAbono);

  const valorFerias = (baseCalculo / 30) * diasPagosGozo;
  const tercoFerias = valorFerias / 3;
  const valorAbono = (baseCalculo / 30) * diasAbono;
  const tercoAbono = valorAbono / 3;
  const totalBruto = valorFerias + tercoFerias + valorAbono + tercoAbono;

  const resumoLinhas: FeriasResult['resumoLinhas'] = [
    {
      label: 'Férias (dias de gozo)',
      value: valorFerias,
      info: `${diasPagosGozo} dia(s)`
    },
    {
      label: '1/3 constitucional sobre férias',
      value: tercoFerias
    }
  ];

  if (diasAbono > 0) {
    resumoLinhas.push(
      {
        label: 'Abono pecuniário',
        value: valorAbono,
        info: `${diasAbono} dia(s) vendidos`
      },
      {
        label: '1/3 sobre abono',
        value: tercoAbono
      }
    );
  }

  return {
    baseCalculo,
    valorFerias,
    tercoFerias,
    valorAbono,
    tercoAbono,
    totalBruto,
    resumoLinhas
  };
}
