import type { SeoPageContent } from '@/lib/seo-pages/types';
import { getViralBaseUrl } from '@/lib/viral-loop';

export function ToolLandingJsonLd({ content }: { content: SeoPageContent }) {
  const siteUrl = getViralBaseUrl().replace(/\/$/, '');
  const pageUrl = `${siteUrl}/${content.slug}`;
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: content.seo.metaTitle,
    description: content.seo.metaDescription,
    url: pageUrl,
    inLanguage: 'pt-BR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Resolva Jato',
      url: siteUrl
    }
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Recursos', item: `${siteUrl}/recursos` },
      { '@type': 'ListItem', position: 3, name: content.seo.breadcrumbLabel, item: pageUrl }
    ]
  };

  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `Resolva Jato: ${content.toolName}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: pageUrl,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL'
    }
  };

  const faqPage =
    content.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: content.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer
            }
          }))
        }
      : null;

  // Organization e WebSite já são declarados uma vez no layout raiz. Aqui usamos
  // referências por @id e um único @graph para não repetir entidades em cada landing.
  const blocks = [webPage, breadcrumb, softwareApplication, faqPage].filter(Boolean).map((block) => {
    if (block === webPage) {
      return {
        ...block,
        isPartOf: { '@id': `${siteUrl}/#website` },
        publisher: { '@id': `${siteUrl}/#organization` }
      };
    }
    if (block === softwareApplication) {
      return { ...block, provider: { '@id': `${siteUrl}/#organization` } };
    }
    return block;
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': blocks })
      }}
    />
  );
}
