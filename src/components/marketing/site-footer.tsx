'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { useAuth } from '@/hooks/use-auth';

const YEAR = new Date().getFullYear();

const NAV_LINKS: { href: string; label: string; authAware?: boolean }[] = [
  { href: '/', label: 'Início' },
  { href: '/calculadora-de-rescisao', label: 'Calculadora de rescisão' },
  { href: '/corretor-de-redacao-enem', label: 'Redação ENEM' },
  { href: '/gerador-de-recibo', label: 'Recibo' },
  { href: '/orcamento-com-pix', label: 'Orçamento + Pix' },
  { href: '/biblioteca', label: 'Biblioteca' },
  { href: '/guias', label: 'Guias' },
  { href: '/sobre', label: 'Sobre e equipe' },
  { href: '/precisou-ta-pronto', label: 'Site oficial Precisou, Tá Pronto' },
  { href: '/qualidade-e-seguranca', label: 'Qualidade e segurança' },
  { href: '/criterios-editoriais', label: 'Critérios editoriais' },
  { href: '/recursos', label: 'Catálogo público' },
  { href: '/busca', label: 'Busca grátis' }
];

const SEO_LINKS = [
  { href: '/recibos', label: 'Central de recibos' },
  { href: '/rescisao', label: 'Central de rescisão' },
  { href: '/redacao-enem', label: 'Central de redação ENEM' },
  { href: '/pix', label: 'Central Pix' },
  { href: '/pdf', label: 'Central PDF' },
  { href: '/calculadora-de-rescisao', label: 'Calculadora de rescisão' },
  { href: '/calculadora-de-preco-freelancer', label: 'Preço para freelancer' },
  { href: '/mei-ou-clt', label: 'MEI ou CLT' },
  { href: '/corretor-de-redacao-enem', label: 'Corretor de redação ENEM' },
  { href: '/editor-de-pdf-online', label: 'Editor de PDF' },
  { href: '/remover-fundo-de-imagem', label: 'Remover fundo de imagem' },
  { href: '/juntar-pdf-online', label: 'Juntar PDF' },
  { href: '/dividir-pdf-online', label: 'Dividir PDF' },
  { href: '/comprimir-pdf-online', label: 'Comprimir PDF' },
  { href: '/comprimir-redimensionar-imagem', label: 'Comprimir imagem' },
  { href: '/converter-imagem-online', label: 'Converter imagem' },
  { href: '/gerador-de-referencias-abnt', label: 'Referências ABNT' },
  { href: '/divisor-de-conta', label: 'Divisor de conta' },
  { href: '/agenda-online', label: 'Agenda online' },
  { href: '/checklist-cobranca-mei', label: 'Checklist cobrança MEI' },
  { href: '/imprensa', label: 'Imprensa' },
  { href: '/embed', label: 'Badges e embeds' },
  { href: '/politica-de-correcoes', label: 'Política de correções' },
  { href: '/metodologia-calculadoras', label: 'Metodologia das calculadoras' },
  { href: '/precisou-ta-pronto', label: 'Marca Precisou, Tá Pronto' },
  { href: '/qualidade-e-seguranca', label: 'Qualidade Jato' },
  { href: '/guias', label: 'Todos os guias' },
  { href: '/contrato-de-aluguel', label: 'Contrato de aluguel' },
  { href: '/recibo-de-pagamento', label: 'Recibo de pagamento' },
  { href: '/proposta-comercial-mei', label: 'Proposta para MEI' },
  { href: '/conta', label: 'Indique e ganhe' },
  { href: '/para/mei', label: 'Para MEI' },
  { href: '/para/freelancers', label: 'Para freelancers' },
  { href: '/para/estudantes', label: 'Para estudantes' },
  { href: '/gerador-de-curriculo', label: 'Currículo' },
  { href: '/gerador-de-recibo', label: 'Recibo' }
] as const;

/** Links públicos no bloco Ferramentas (evita empurrar só rotas autenticadas). */
const PUBLIC_TOOL_LINKS = [
  { href: '/calculadora-de-rescisao', label: 'Rescisão' },
  { href: '/corretor-de-redacao-enem', label: 'Redação ENEM' },
  { href: '/gerador-de-recibo', label: 'Recibo' },
  { href: '/orcamento-com-pix', label: 'Orçamento + Pix' },
  { href: '/gerador-de-curriculo', label: 'Currículo' },
  { href: '/calculadora-de-preco-freelancer', label: 'Precificação' },
  { href: '/mei-ou-clt', label: 'MEI ou CLT' },
  { href: '/recursos', label: 'Ver catálogo completo' }
] as const;

function FooterDisclosure({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-slate-200 pb-3 lg:border-0 lg:pb-0" open>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-1 text-[15px] font-bold text-slate-950 marker:content-none lg:pointer-events-none lg:cursor-default">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700">{title}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180 lg:hidden"
          aria-hidden
        />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

export function SiteFooter() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-700">
      <div className="h-1 bg-gradient-to-r from-sky-600 via-sky-500 to-emerald-500" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.3fr_0.7fr_0.9fr] lg:gap-10">
        <div className="max-w-md">
          <Link href="/" className="inline-block" aria-label="Página inicial Precisou, Tá Pronto">
            <Logo variant="marketing" className="h-14 sm:h-16" />
          </Link>
          <p className="mt-3 text-[15px] font-medium leading-7 text-slate-900">
            Ferramentas online que resolvem de verdade.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            PDFs, imagens, documentos e cálculos com Qualidade Jato: privacidade, clareza e resultados verificáveis.
          </p>
        </div>

        <FooterDisclosure title="Navegação">
          <ul className="flex flex-col gap-2.5">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                {item.authAware ? (
                  <AuthAwareLink
                    href={item.href}
                    className="text-[15px] font-semibold text-slate-800 transition-colors hover:text-sky-700"
                  >
                    {item.label}
                  </AuthAwareLink>
                ) : (
                  <Link
                    href={item.href}
                    className="text-[15px] font-semibold text-slate-800 transition-colors hover:text-sky-700"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              {isAuthenticated ? (
                <Link
                  href="/conta"
                  className="text-[15px] font-semibold text-slate-800 transition-colors hover:text-sky-700"
                >
                  Minha conta
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-[15px] font-semibold text-slate-800 transition-colors hover:text-sky-700"
                >
                  Entrar
                </Link>
              )}
            </li>
          </ul>
        </FooterDisclosure>

        <FooterDisclosure title="Ferramentas">
          <ul className="flex flex-col gap-2.5">
            {PUBLIC_TOOL_LINKS.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className={
                    tool.href === '/recursos'
                      ? 'text-[15px] font-semibold text-sky-700 transition-colors hover:text-sky-900'
                      : 'text-[15px] font-medium text-slate-700 transition-colors hover:text-sky-700'
                  }
                >
                  {tool.label}
                </Link>
              </li>
            ))}
          </ul>
        </FooterDisclosure>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700">Explore</p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {SEO_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-sky-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm leading-6 text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {YEAR} Precisou, Tá Pronto</p>
          <p className="sm:text-right">Links de terceiros são de responsabilidade de seus autores.</p>
        </div>
      </div>
    </footer>
  );
}
