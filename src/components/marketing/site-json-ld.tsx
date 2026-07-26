import { getViralBaseUrl } from '@/lib/viral-loop';

/** JSON-LD de Organization e WebSite para a home (ajuda buscadores a entender a marca). */
export function SiteJsonLd() {
  const siteUrl = getViralBaseUrl();

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Resolva Jato',
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`
  };

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Resolva Jato',
    url: siteUrl,
    inLanguage: 'pt-BR',
    description:
      'Orçamento com aprovação e Pix no WhatsApp, além de currículo, contrato, proposta e recibo em PDF.'
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
