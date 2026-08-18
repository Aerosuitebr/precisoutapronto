import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { BRAND_EMAIL, BRAND_NAME, BRAND_SITE } from '@/lib/brand';
import {
  AUTHORITY_ASSETS,
  PRESS_FACTS,
  PRESS_STORY_ANGLES
} from '@/lib/seo/authority-assets';
import { getViralBaseUrl } from '@/lib/viral-loop';

const PATH = '/imprensa';
const SITE = getViralBaseUrl().replace(/\/$/, '') || BRAND_SITE;

export const metadata: Metadata = {
  title: 'Imprensa e press kit',
  description:
    'Informações oficiais sobre o Precisou, Tá Pronto, fatos citáveis, materiais da marca e contato para imprensa e parceiros.',
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Imprensa | Precisou, Tá Pronto',
    description: 'Press kit, fatos citáveis e contato de mídia.',
    url: `${SITE}${PATH}`,
    images: [{ url: `${PATH}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Imprensa | Precisou, Tá Pronto',
    description: 'Press kit, fatos citáveis e contato de mídia.',
    images: [`${PATH}/opengraph-image`]
  }
};

export default function ImprensaPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        name: 'Imprensa · Precisou, Tá Pronto',
        url: `${SITE}${PATH}`,
        description: metadata.description,
        isPartOf: { '@type': 'WebSite', name: BRAND_NAME, url: SITE },
        about: { '@id': `${SITE}/#organization` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Imprensa', item: `${SITE}${PATH}` }
        ]
      }
    ]
  };

  const shortBoiler =
    'Precisou, Tá Pronto é uma plataforma brasileira de ferramentas online grátis para documentos, cobranças, estudos e cálculos no navegador.';
  const longBoiler =
    'O Precisou, Tá Pronto (resolvajato.com.br), operado pela Aerosuite, oferece ferramentas práticas para MEIs, freelancers, estudantes e pequenos negócios: orçamento com Pix, currículo, recibo, proposta, contrato, calculadoras trabalhistas, corretor de redação ENEM, editor de PDF e referências ABNT. O uso começa com duas gerações livres, sem cartão.';

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Sala de imprensa</p>
            <h1 className="rj-display mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Materiais oficiais para mídia e parceiros
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Use estes textos e links sem pedir autorização prévia para citação editorial. Para entrevistas e
              parcerias, fale com {BRAND_EMAIL}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
              <a href={`mailto:${BRAND_EMAIL}`} className="rounded-full bg-sky-700 px-4 py-2 text-white">
                Contato de imprensa
              </a>
              <Link href="/embed" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-800">
                Badges e embeds
              </Link>
              <Link href="/sobre" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-800">
                Sobre a marca
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">Sobre o Precisou, Tá Pronto</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{shortBoiler}</p>
            <h2 className="mt-8 text-xl font-bold text-slate-950">Apresentação institucional</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{longBoiler}</p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">Fatos citáveis</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {PRESS_FACTS.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-slate-500">
              <strong>Como citar:</strong> Precisou, Tá Pronto. Ferramentas online grátis. Disponível em:{' '}
              {SITE}. Acesso em: [data].
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">Ângulos de pauta</h2>
            <ul className="mt-4 space-y-4">
              {PRESS_STORY_ANGLES.map((angle) => (
                <li key={angle.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{angle.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{angle.hook}</p>
                  <Link href={angle.link} className="mt-2 inline-block text-sm font-semibold text-sky-700 hover:underline">
                    Abrir recurso
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">Assets e links úteis</h2>
            <ul className="mt-4 space-y-2 text-sm font-semibold text-sky-700">
              <li>
                <Link href="/favicon.svg" className="hover:underline">
                  Símbolo SVG
                </Link>
              </li>
              <li>
                <Link href="/icon-512.png" className="hover:underline">
                  Ícone 512px
                </Link>
              </li>
              <li>
                <Link href="/opengraph-image" className="hover:underline">
                  Imagem institucional Open Graph
                </Link>
              </li>
              <li>
                <Link href="/badges/feito-com-resolva-jato.svg" className="hover:underline">
                  Badge “Feito com Precisou, Tá Pronto”
                </Link>
              </li>
              <li>
                <Link href="/embed" className="hover:underline">
                  Página de embeds para parceiros
                </Link>
              </li>
            </ul>
            <h3 className="mt-8 text-base font-bold text-slate-950">Páginas boas para linkar</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {AUTHORITY_ASSETS.map((asset) => (
                <li key={asset.path}>
                  <Link href={asset.path} className="font-semibold text-sky-700 hover:underline">
                    {asset.title}
                  </Link>
                  <span className="text-slate-500"> · {asset.pitch}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
