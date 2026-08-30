import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { LandingConversionLink } from '@/components/analytics/landing-conversion-link';
import { SeoLandingJsonLd } from '@/components/marketing/seo-landing-json-ld';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { TrustSeals } from '@/components/marketing/trust-seals';
import { Button } from '@/components/ui/button';
import type { SeoLandingContent } from '@/lib/seo/landing-content';
import { StrategicSeoClusters } from '@/components/marketing/strategic-seo-clusters';
import { UsefulToolsStrip } from '@/components/marketing/useful-tools-strip';

const primaryCtaClass =
  'h-12 bg-[#155eef] px-6 text-base font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-[#004eeb]';

function isAuthGatedHref(href: string) {
  const path = href.split('#')[0]?.split('?')[0] || '';
  return path === '/ferramentas' || path.startsWith('/ferramentas/');
}

function CtaLink({
  href,
  landingPath,
  placement,
  className,
  children
}: {
  href: string;
  landingPath: string;
  placement: 'hero_primary' | 'hero_secondary' | 'footer_primary';
  className?: string;
  children: ReactNode;
}) {
  if (isAuthGatedHref(href)) {
    return (
      <AuthAwareLink href={href} className={className}>
        {children}
      </AuthAwareLink>
    );
  }
  return (
    <LandingConversionLink href={href} landingPath={landingPath} placement={placement} className={className}>
      {children}
    </LandingConversionLink>
  );
}

export function SeoLandingPage({
  content,
  demo
}: {
  content: SeoLandingContent;
  demo?: ReactNode;
}) {
  return (
    <>
      <SeoLandingJsonLd content={content} />
      <TopEnvBanner />
      <div className="pt-8">
        <SiteHeader />
        <main>
          <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3 text-xs text-slate-500 sm:px-6">
              <Link href="/">Início</Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <Link href="/recursos" className="hover:text-slate-700">
                Recursos
              </Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <span aria-current="page" className="font-semibold text-slate-700">{content.eyebrow}</span>
            </div>
          </nav>
          <section className="relative overflow-hidden border-b border-blue-100 bg-[#f8faff] text-slate-950">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(21,94,239,.13),transparent_28%),radial-gradient(circle_at_12%_90%,rgba(131,214,0,.12),transparent_25%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(21,94,239,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(21,94,239,.045)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#155eef]">
                {content.eyebrow}
              </p>
              <h1 className="precisoutapronto-display mt-3 max-w-3xl text-[clamp(1.85rem,4vw,3.1rem)] font-extrabold leading-[1.1] tracking-tight">
                {content.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {content.description}
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-600">
                {content.heroBullets.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className={`${primaryCtaClass} w-full sm:w-auto`}>
                  <CtaLink href={content.toolHref} landingPath={content.path} placement="hero_primary">
                    {content.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </CtaLink>
                </Button>
                {content.secondaryCta ? (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 w-full border-slate-300 bg-white px-6 text-slate-800 shadow-sm hover:border-blue-300 hover:bg-white sm:w-auto"
                  >
                    <CtaLink href={content.secondaryCta.href} landingPath={content.path} placement="hero_secondary">
                      {content.secondaryCta.label}
                    </CtaLink>
                  </Button>
                ) : null}
              </div>
              <TrustSeals className="mt-8" />
              <p className="mt-5 text-xs leading-5 text-slate-500">Ferramenta testada no navegador · conteúdo atualizado em <time dateTime="2026-08-27">27 de agosto de 2026</time> · o cliente não precisa instalar aplicativo</p>
            </div>
          </section>

          {demo}

          <UsefulToolsStrip currentPath={content.path} title="Ferramentas úteis para o próximo passo" />

          {content.path === '/orcamento-com-pix' ? <StrategicSeoClusters current="/orcamento-com-pix" /> : null}

          {content.sections.map((section) => (
            <section key={section.title} className="border-b border-slate-200 bg-white">
              <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
                <h2 className="precisoutapronto-display max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900">
                  {section.title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  {section.body}
                </p>
                {section.bullets?.length ? (
                  <ul className="mt-6 max-w-xl space-y-2.5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2.5 text-sm text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}

          <section className="border-b border-slate-200 bg-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
              <h2 className="precisoutapronto-display text-3xl font-extrabold tracking-tight text-slate-900">
                Perguntas frequentes
              </h2>
              <dl className="mt-8 space-y-5">
                {content.faqs.map((item) => (
                  <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <dt className="text-sm font-bold text-slate-900">{item.q}</dt>
                    <dd className="mt-2 text-sm leading-6 text-slate-600">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="bg-white">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
              <h2 className="precisoutapronto-display text-3xl font-extrabold tracking-tight text-slate-900">
                Continue explorando
              </h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {content.related.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block h-full rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-sky-300 hover:bg-white"
                    >
                      <p className="font-bold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.blurb}</p>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button asChild size="lg" className={primaryCtaClass}>
                  <CtaLink href={content.toolHref} landingPath={content.path} placement="footer_primary">
                    {content.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </CtaLink>
                </Button>
              </div>
            </div>
          </section>

          <section className="border-t border-slate-200 bg-slate-50" aria-label="Informações editoriais">
            <div className="mx-auto max-w-6xl px-4 py-8 text-sm leading-6 text-slate-600 sm:px-6">
              <p>
                Conteúdo educativo do Precisou, Tá Pronto. Materiais com impacto jurídico, contábil ou trabalhista
                devem ser validados por profissional habilitado quando a decisão envolver riscos ou
                particularidades do caso. Conheça a{' '}
                <Link href="/autores/equipe-editorial" className="font-semibold text-emerald-700 hover:underline">
                  equipe editorial
                </Link>{' '}
                consulte os{' '}
                <Link href="/criterios-editoriais" className="font-semibold text-emerald-700 hover:underline">
                  critérios de revisão
                </Link>{' '}
                e a{' '}
                <Link href="/politica-de-correcoes" className="font-semibold text-emerald-700 hover:underline">
                  política de correções
                </Link>{' '}
                ou{' '}
                <Link href="/contato" className="font-semibold text-emerald-700 hover:underline">
                  fale conosco
                </Link>
                .
              </p>
              <p className="mt-3">Revisão editorial interna em <time dateTime="2026-08-27">27 de agosto de 2026</time>. Exemplos exibidos são demonstrativos e usam dados fictícios; resultados e valores devem ser revisados antes do compartilhamento.</p>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
