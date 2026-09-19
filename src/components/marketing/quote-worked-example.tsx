import Link from 'next/link';
import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';
import { PROMO_ORCAMENTO_VIDEO } from '@/lib/seo/promo-orcamento-video';

export function QuoteWorkedExample() {
  return (
    <section id="exemplo" className="scroll-mt-24 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-3xl font-extrabold text-slate-950">Exemplo de orçamento enviado pelo WhatsApp</h2>
        <p className="mt-2 text-xs text-slate-500">Exemplo revisado em <time dateTime="2026-09-16">16 de setembro de 2026</time></p>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">Instalação de tomadas: R$ 350 de mão de obra + R$ 140 de materiais = R$ 490. Exemplo fictício; ajuste os valores após avaliar o serviço.</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-bold text-slate-950">Mensagem para acompanhar o link</h3>
            <blockquote className="mt-3 leading-7 text-slate-700">Olá! Segue o orçamento da instalação de tomadas: total de R$ 490, com materiais inclusos. Validade de 7 dias e execução em data a combinar. Confira os itens no link e escolha aprovar ou pedir ajuste. Entrada de R$ 150 e saldo de R$ 340 após a conclusão.</blockquote>
            <p className="mt-4 text-sm leading-6 text-slate-600">Cole o link gerado no final da mensagem. Registre essas mesmas condições no orçamento antes de compartilhar.</p>
            <LandingConversionLink href="#montar" landingPath="/orcamento-com-pix" placement="inline_primary" className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Montar meu orçamento</LandingConversionLink>
          </div>
          <div>
            <video controls preload="none" playsInline aria-label="Apresentação do orçamento com aprovação e Pix" className="aspect-video w-full rounded-2xl bg-slate-950" poster="/orcamento-com-pix/opengraph-image">
              <source src={PROMO_ORCAMENTO_VIDEO.path} type="video/mp4" />
              <a href={PROMO_ORCAMENTO_VIDEO.path}>Assistir à apresentação do orçamento</a>
            </video>
            <p className="mt-3 text-sm leading-6 text-slate-600">Apresentação do produto. Para experimentar, preencha o formulário desta página e confira a prévia antes de enviar.</p>
          </div>
        </div>
        <p className="mt-6 leading-7 text-slate-700">Recebeu a entrada? Emita um <Link href="/recibos/recibo-pagamento-pix" className="font-semibold text-emerald-800 underline">recibo de Pix de R$ 150</Link>. Registre os R$ 340 restantes somente após recebê-los. Veja também os <Link href="/modelos-de-orcamento" className="font-semibold text-emerald-800 underline">modelos por profissão</Link>.</p>
      </div>
    </section>
  );
}
