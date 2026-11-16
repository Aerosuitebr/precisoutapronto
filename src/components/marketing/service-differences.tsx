import Link from 'next/link';
import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';

const comparisonRows = [
  {
    name: 'Precisou, Tá Pronto',
    start: 'Link de aprovação sem cadastro; QR Code Pix opcional.',
    payment: 'Reaproveita cliente, serviço e total do orçamento no recibo. Calcula o saldo e prepara o próximo recibo com o acumulado.',
    tradeoff: 'Conferência manual do Pix. O PDF grátis leva a marca.'
  },
  {
    name: 'OrçamentoPix', url: 'https://orcamentopix.com.br/',
    start: 'Orçamento, recibo e QR Code Pix sem cadastro.',
    payment: 'QR Code com valor e resumo para WhatsApp; recibo com valor por extenso.',
    tradeoff: 'Dados no navegador e PDF sem marca, segundo o site.'
  },
  {
    name: 'AprovaPro', url: 'https://www.aprovapro.com.br/',
    start: 'PDF e Excel sem cadastro. Aprovação por link na plataforma com conta.',
    payment: 'A plataforma registra entradas e parcelas e mostra o saldo.',
    tradeoff: 'O gerador exporta Excel e PDF sem marca, segundo o site.'
  },
  {
    name: 'Vistobra', url: 'https://vistobra.com.br/gerador-de-orcamento',
    start: 'Gerador de PDF sem cadastro. Aprovação por link no app.',
    payment: 'O app anuncia sinal via Pix e geração de recibo a partir do serviço.',
    tradeoff: 'O app também oferece preços regionais, fotos de obra e garantia.'
  },
  {
    name: 'OrçamentoZap', url: 'https://www.orcamentozap.com.br/',
    start: 'Plataforma com cadastro e teste de 14 dias anunciado.',
    payment: 'Converte orçamento em cobrança Pix com acompanhamento em tempo real.',
    tradeoff: 'A confirmação automática é um recurso anunciado pela plataforma.'
  }
];

export function ServiceDifferences({ landingPath, comparison = false }: { landingPath: string; comparison?: boolean }) {
  return <section className="border-y border-emerald-200 bg-emerald-50 py-12">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">Para MEIs e prestadores que vendem pelo WhatsApp</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Seu serviço é profissional. Sua cobrança também pode ser.</h2>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">Comece sem cadastro. Envie o orçamento para aprovação e, quando receber, emita o recibo de cada Pix com o saldo explicado.</p>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {[
          ['Comece agora. Sem conta.', 'Orçamento e recibo disponíveis sem cadastro. O PDF grátis leva a marca Precisou, Tá Pronto.'],
          ['Recebeu R$ 150 de R$ 490?', 'Registre a entrada de R$ 150 e mostre os R$ 340 pendentes no recibo. Quando receber o restante, emita o recibo do saldo.'],
          ['Continue de onde parou.', 'Leve cliente, serviço e total do orçamento para o recibo. Se faltar receber, prepare outro recibo com o acumulado já preenchido.']
        ].map(([title, text]) => <div key={title} className="rounded-2xl border border-emerald-200 bg-white p-6"><h3 className="text-lg font-extrabold text-slate-950">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p></div>)}
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <LandingConversionLink href="/orcamento-com-pix#montar" landingPath={landingPath} placement="inline_primary" className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Criar orçamento sem cadastro</LandingConversionLink>
        <LandingConversionLink href="/gerador-de-recibo?tipo=entrada#ferramenta" landingPath={landingPath} placement="inline_primary" className="rounded-xl border border-emerald-700 bg-white px-5 py-3 font-bold text-emerald-900">Recebi a entrada: gerar recibo</LandingConversionLink>
      </div>
      {comparison ? <section id="comparativo" aria-labelledby="comparativo-title" className="mt-8 scroll-mt-24 rounded-2xl border border-emerald-200 bg-white p-5">
        <h3 id="comparativo-title" className="text-xl font-extrabold text-slate-950">Compare o caminho do orçamento ao recibo</h3>
        <div className="mt-5 overflow-x-auto" role="region" aria-labelledby="comparativo-title" tabIndex={0}><table className="w-full min-w-[720px] text-left text-sm leading-6">
          <caption className="mb-3 text-left text-slate-600">Recursos divulgados nas páginas oficiais, consultadas em 16/11/2026. No celular, deslize a tabela para ver todas as colunas.</caption>
          <thead><tr><th scope="col" className="p-3">Produto</th><th scope="col" className="p-3">Como começar</th><th scope="col" className="p-3">Pix, pagamentos e recibos</th><th scope="col" className="p-3">O que considerar</th></tr></thead>
          <tbody>
            {comparisonRows.map(({ name, url, start, payment, tradeoff }) => (
              <tr key={name} className={url ? 'border-t align-top' : 'bg-emerald-50 align-top'}>
                <th scope="row" className="p-3">{url ? <a className="underline" href={url}>{name}</a> : name}</th>
                <td className="p-3">{start}</td><td className="p-3">{payment}</td><td className="p-3">{tradeoff}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <p className="mt-4 text-xs leading-6 text-slate-600">O comparativo cobre os recursos descritos nessas páginas públicas, sem acesso aos painéis dos concorrentes. Confira as fontes para ver as condições atuais. No Precisou, Tá Pronto, confira o Pix no seu banco antes de emitir um recibo; o saldo é calculado com os valores que você informa.</p>
      </section> : <Link href="/orcamento-com-pix#comparativo" className="mt-6 inline-block text-sm font-bold text-emerald-900 underline underline-offset-4">Comparar ferramentas de orçamento e recibo</Link>}
    </div>
  </section>;
}
