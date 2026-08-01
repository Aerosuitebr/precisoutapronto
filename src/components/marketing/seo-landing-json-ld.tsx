import type { SeoLandingContent } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';

/** JSON-LD (WebPage, SoftwareApplication opcional, BreadcrumbList e FAQPage) para landings SEO. */
export function SeoLandingJsonLd({ content }: { content: SeoLandingContent }) {
  const siteUrl = getViralBaseUrl().replace(/\/$/, '');
  const pageUrl = `${siteUrl}${content.path}`;
  const toolUrl = `${siteUrl}${content.toolHref}`;
  const toolIsSamePage = content.toolHref === content.path;
  const toolIsPublicLanding =
    toolIsSamePage ||
    (!content.toolHref.startsWith('/ferramentas') && content.toolHref !== '/busca');

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: content.title,
    description: content.description,
    url: pageUrl,
    inLanguage: 'pt-BR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Resolva Jato',
      url: siteUrl
    },
    ...(toolIsPublicLanding && !toolIsSamePage
      ? { significantLink: toolUrl }
      : {})
  };

  const softwareApplication = toolIsPublicLanding
    ? {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `Resolva Jato: ${content.eyebrow}`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: toolUrl,
        description: content.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'BRL'
        }
      }
    : null;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Recursos', item: `${siteUrl}/recursos` },
      { '@type': 'ListItem', position: 3, name: content.eyebrow, item: pageUrl }
    ]
  };

  const faqPage =
    content.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: content.faqs.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a
            }
          }))
        }
      : null;

  const blocks = [webPage, softwareApplication, breadcrumb, faqPage].filter(Boolean);

  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
