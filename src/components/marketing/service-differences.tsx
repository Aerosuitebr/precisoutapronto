import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';

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
          ['O combinado fica claro.', 'Itens, condições e aprovação no orçamento. Serviço, data, pagamento recebido e saldo no recibo.']
        ].map(([title, text]) => <div key={title} className="rounded-2xl border border-emerald-200 bg-white p-6"><h3 className="text-lg font-extrabold text-slate-950">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p></div>)}
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <LandingConversionLink href="/orcamento-com-pix#montar" landingPath={landingPath} placement="inline_primary" className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Criar orçamento sem cadastro</LandingConversionLink>
        <LandingConversionLink href="/gerador-de-recibo?tipo=entrada#ferramenta" landingPath={landingPath} placement="inline_primary" className="rounded-xl border border-emerald-700 bg-white px-5 py-3 font-bold text-emerald-900">Recebi a entrada: gerar recibo</LandingConversionLink>
      </div>
      {comparison ? <details className="mt-8 rounded-2xl border border-emerald-200 bg-white p-5">
        <summary className="cursor-pointer font-extrabold text-slate-950">Compare antes de criar uma conta</summary>
        <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm leading-6">
          <caption className="mb-3 text-left text-slate-600">Condições de entrada divulgadas nos sites oficiais, consultadas em 19/09/2026.</caption>
          <thead><tr><th scope="col" className="p-3">Produto</th><th scope="col" className="p-3">Como começar</th><th scope="col" className="p-3">Oferta divulgada</th></tr></thead>
          <tbody>
            <tr className="bg-emerald-50"><th scope="row" className="p-3">Precisou, Tá Pronto</th><td className="p-3">Orçamento e recibo sem cadastro</td><td className="p-3">Geração grátis com a marca no PDF; sem prazo de teste para esse uso</td></tr>
            <tr className="border-t"><th scope="row" className="p-3"><a className="underline" href="https://www.orcamentozap.com.br/" target="_blank" rel="noopener noreferrer">OrçamentoZap</a></th><td className="p-3">Cadastro para testar a plataforma</td><td className="p-3">14 dias de teste; plano anunciado de R$ 39/mês</td></tr>
            <tr className="border-t"><th scope="row" className="p-3"><a className="underline" href="https://meuorcamentodigital.com.br/orcamento-para-eletricista" target="_blank" rel="noopener noreferrer">Meu Orçamento Digital</a></th><td className="p-3">Conta grátis para iniciar o teste</td><td className="p-3">7 dias de teste sem cartão</td></tr>
          </tbody>
        </table></div>
        <p className="mt-4 text-xs leading-6 text-slate-600">Comparação das ofertas públicas de acesso, não de todos os recursos dos planos. OrçamentoZap também oferece modelos gratuitos fora da plataforma. Condições podem mudar; confira as fontes. Aqui, o saldo do recibo é calculado com os valores que você informa, sem conciliação bancária automática.</p>
      </details> : null}
    </div>
  </section>;
}
