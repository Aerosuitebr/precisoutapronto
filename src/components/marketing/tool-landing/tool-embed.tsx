import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolStartBoundary } from '@/components/analytics/tool-start-boundary';

export function ToolLandingEmbed({
  toolName,
  tool,
  ctaHref,
  ctaLabel,
  openWithoutAccount = false
}: {
  toolName: string;
  tool: ReactNode;
  ctaHref: string;
  ctaLabel: string;
  openWithoutAccount?: boolean;
}) {
  return (
    <section id="ferramenta" className="scroll-mt-20 border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20">
        <p className="precisoutapronto-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Experimente agora</p>
        <h2 className="precisoutapronto-display mt-3 max-w-xl text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Monte seu {toolName.toLowerCase()} sem precisar sair da página.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Preencha alguns dados abaixo. No celular, o preview fica sob demanda pra digitação fluida.
          {openWithoutAccount
            ? ` ${toolName} sai sem conta. Cadastro só se quiser histórico ou PDF sem o rodapé da marca.`
            : ' Duas gerações livres sem conta; depois o cadastro libera PDF sem marca e histórico.'}
        </p>
        <div className="mt-8 sm:mt-10"><ToolStartBoundary toolName={toolName}>{tool}</ToolStartBoundary></div>
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-12 w-full bg-sky-600 px-6 font-bold hover:bg-sky-500 sm:w-auto">
            <Link href={ctaHref}>
              {ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <p className="text-sm font-medium text-slate-500">
            {openWithoutAccount ? 'Sem cadastro. Sem cartão.' : '2 gerações grátis. Sem cartão.'}
          </p>
        </div>
      </div>
    </section>
  );
}
