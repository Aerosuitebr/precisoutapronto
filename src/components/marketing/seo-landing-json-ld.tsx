import type { SeoLandingContent } from '@/lib/seo/landing-content';
import { getViralBaseUrl } from '@/lib/viral-loop';

/** JSON-LD (WebPage, BreadcrumbList e FAQPage) para as landings de SEO. */
export function SeoLandingJsonLd({ content }: { content: SeoLandingContent }) {
  const siteUrl = getViralBaseUrl();
  const pageUrl = `${siteUrl}${content.path}`;

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
    }
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: content.title, item: pageUrl }
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

  const blocks = [webPage, breadcrumb, faqPage].filter(Boolean);

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
