import { getViralBaseUrl } from '@/lib/viral-loop';

/** JSON-LD de Organization e WebSite para a home (ajuda buscadores a entender a marca). */
export function SiteJsonLd() {
  const siteUrl = getViralBaseUrl().replace(/\/$/, '');

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Resolva Jato',
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`
  };

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Resolva Jato',
    url: siteUrl,
    inLanguage: 'pt-BR',
    description:
      'Orçamento com aprovação e Pix no WhatsApp, além de currículo, contrato, proposta e recibo em PDF.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/busca?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      {[organization, webSite].map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
