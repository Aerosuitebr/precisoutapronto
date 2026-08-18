import {
  BRAND_EMAIL,
  BRAND_DESCRIPTION,
  BRAND_DISPLAY_NAME,
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_SAME_AS,
  BRAND_SITE
} from '@/lib/brand';
import { getViralBaseUrl } from '@/lib/viral-loop';

/** JSON-LD de Organization e WebSite (rich results / Knowledge Panel). */
export function SiteJsonLd() {
  const siteUrl = getViralBaseUrl().replace(/\/$/, '') || BRAND_SITE;

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: BRAND_NAME,
    alternateName: [BRAND_DISPLAY_NAME, 'Precisou Tá Pronto', 'Resolva Jato', 'ResolvaJato'],
    url: siteUrl,
    email: BRAND_EMAIL,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/icon-512.png`,
      width: 512,
      height: 512
    },
    image: `${siteUrl}/opengraph-image`,
    description: BRAND_DESCRIPTION,
    slogan: BRAND_TAGLINE,
    foundingDate: '2025',
    areaServed: {
      '@type': 'Country',
      name: 'Brazil'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: BRAND_EMAIL,
        availableLanguage: ['Portuguese', 'English', 'Spanish'],
        url: `${siteUrl}/contato`
      },
      {
        '@type': 'ContactPoint',
        contactType: 'security',
        email: BRAND_EMAIL,
        url: `${siteUrl}/.well-known/security.txt`
      }
    ],
    sameAs: [...BRAND_SAME_AS],
    knowsAbout: [
      'calculadora de rescisão trabalhista',
      'corretor de redação ENEM',
      'recibo de pagamento',
      'documentos profissionais',
      'orçamento com Pix',
      'MEI e freelancers',
      'cobrança para MEI',
      'proposta comercial',
      'contrato de prestação de serviços',
      'precificação de serviços',
      'gestão do trabalho autônomo',
      'edição e organização de PDF',
      'compressão e conversão de imagens',
      'ferramentas online com processamento local'
    ],
    brand: {
      '@type': 'Brand',
      name: BRAND_NAME
    }
  };

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: BRAND_NAME,
    alternateName: [BRAND_DISPLAY_NAME, 'Precisou Tá Pronto', 'Resolva Jato'],
    url: siteUrl,
    inLanguage: 'pt-BR',
    description: BRAND_DESCRIPTION,
    publisher: { '@id': `${siteUrl}/#organization` },
    about: { '@id': `${siteUrl}/#organization` }
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteUrl}/#top-tools`,
    name: 'Ferramentas em destaque',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: 6,
    itemListElement: [
      { name: 'Calculadora de rescisão', path: '/calculadora-de-rescisao' },
      { name: 'Corretor de redação ENEM', path: '/corretor-de-redacao-enem' },
      { name: 'Gerador de recibo', path: '/gerador-de-recibo' },
      { name: 'Orçamento com Pix', path: '/orcamento-com-pix' },
      { name: 'Gerador de currículo', path: '/gerador-de-curriculo' },
      { name: 'Para MEI', path: '/para/mei' }
    ].map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: `${siteUrl}${item.path}`
    }))
  };

  return (
    <>
      {[organization, webSite, itemList].map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
