import {
  BRAND_EMAIL,
  BRAND_NAME,
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
    alternateName: 'RJ',
    url: siteUrl,
    email: BRAND_EMAIL,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/icon-512.png`,
      width: 512,
      height: 512
    },
    image: `${siteUrl}/opengraph-image`,
    description:
      'Plataforma brasileira de orçamento com Pix, recibos, propostas e contratos para MEI, autônomos e prestadores de serviço.',
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
      'documentos profissionais',
      'orçamento com Pix',
      'MEI e freelancers',
      'cobrança para MEI',
      'recibo de pagamento',
      'proposta comercial',
      'contrato de prestação de serviços',
      'precificação de serviços',
      'gestão do trabalho autônomo'
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
    url: siteUrl,
    inLanguage: 'pt-BR',
    description:
      'Ferramentas online para MEI e autônomos criarem orçamento com Pix, recibo, proposta e contrato para seus clientes.',
    publisher: { '@id': `${siteUrl}/#organization` },
    about: { '@id': `${siteUrl}/#organization` }
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteUrl}/#top-tools`,
    name: 'Ferramentas em destaque',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: 7,
    itemListElement: [
      { name: 'Orçamento com Pix', path: '/orcamento-com-pix' },
      { name: 'Gerador de contrato', path: '/gerador-de-contrato' },
      { name: 'Gerador de recibo', path: '/gerador-de-recibo' },
      { name: 'Proposta comercial', path: '/gerador-de-proposta-comercial' },
      { name: 'Calculadora de rescisão', path: '/calculadora-de-rescisao' },
      { name: 'Para MEI', path: '/para/mei' },
      { name: 'Calculadora de preço freelancer', path: '/calculadora-de-preco-freelancer' }
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
