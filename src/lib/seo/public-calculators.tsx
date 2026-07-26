import { getViralBaseUrl } from '@/lib/viral-loop';

export type PublicCalculatorSeo = {
  path: string;
  name: string;
  description: string;
  breadcrumbLabel: string;
  faq: Array<{ question: string; answer: string }>;
};

export const PUBLIC_CALCULATORS: Record<string, PublicCalculatorSeo> = {
  rescisao: {
    path: '/calculadora-de-rescisao',
    name: 'Calculadora de rescisão trabalhista',
    description:
      'Calcule uma estimativa de saldo de salário, férias, 13º, aviso-prévio e FGTS sem cadastro.',
    breadcrumbLabel: 'Rescisão',
    faq: [
      {
        question: 'A calculadora de rescisão substitui a homologação?',
        answer:
          'Não. O resultado é uma estimativa educativa das verbas mais comuns. Convenções coletivas, médias salariais e descontos podem alterar o valor final.'
      },
      {
        question: 'Quais verbas entram no cálculo?',
        answer:
          'A simulação organiza saldo de salário, 13º proporcional, férias proporcionais e vencidas, aviso-prévio e estimativas relacionadas ao FGTS, conforme a modalidade informada.'
      },
      {
        question: 'Preciso me cadastrar para usar?',
        answer:
          'Não. A versão pública funciona sem cadastro. Você pode compartilhar o resumo no WhatsApp ou baixar um card visual do resultado.'
      },
      {
        question: 'O valor é líquido ou bruto?',
        answer:
          'Os valores são estimados e brutos, sem descontos de INSS ou IRRF. Confirme o cálculo com um contador ou advogado trabalhista antes de homologar.'
      }
    ]
  },
  precificacao: {
    path: '/calculadora-de-preco-freelancer',
    name: 'Calculadora de preço para freelancer',
    description:
      'Calcule custos, horas, taxas, impostos e margem para chegar a um preço de venda sustentável sem cadastro.',
    breadcrumbLabel: 'Preço freelancer',
    faq: [
      {
        question: 'Como a calculadora define o preço sugerido?',
        answer:
          'Ela combina materiais, frete, tempo produtivo, custos fixos, taxas, impostos e margem desejada para chegar a uma referência de preço de venda.'
      },
      {
        question: 'O preço sugerido é o valor final que devo cobrar?',
        answer:
          'É uma referência gerencial. Demanda, posicionamento e complexidade do projeto também influenciam o preço final negociado com o cliente.'
      },
      {
        question: 'Posso usar sem cadastro?',
        answer:
          'Sim. A página pública permite simular e compartilhar o resultado no WhatsApp ou em um card para Stories sem criar conta.'
      },
      {
        question: 'Serve para produto e serviço?',
        answer:
          'Sim. Você pode informar custos de materiais e horas de trabalho. Ajuste as taxas e a margem conforme o seu modelo de negócio.'
      }
    ]
  },
  'mei-clt': {
    path: '/mei-ou-clt',
    name: 'Simulador MEI ou CLT',
    description:
      'Compare uma estimativa de renda líquida como CLT e MEI considerando descontos, DAS e custos mensais.',
    breadcrumbLabel: 'MEI ou CLT',
    faq: [
      {
        question: 'A simulação MEI ou CLT é uma recomendação oficial?',
        answer:
          'Não. É uma comparação educativa de renda líquida estimada. Benefícios, estabilidade, férias, FGTS e risco comercial também entram na decisão real.'
      },
      {
        question: 'O que entra no cenário CLT?',
        answer:
          'A simulação considera o salário informado e descontos típicos para estimar um líquido aproximado. Não substitui holerite nem orientação trabalhista.'
      },
      {
        question: 'O que entra no cenário MEI?',
        answer:
          'Entram faturamento estimado, DAS e custos mensais informados por você. A atividade precisa se enquadrar nas regras do MEI vigentes.'
      },
      {
        question: 'Preciso de conta para comparar?',
        answer:
          'Não. Você pode simular grátis, compartilhar o resumo no WhatsApp e baixar um card do resultado sem cadastro.'
      }
    ]
  }
};

/** JSON-LD para calculadoras públicas: WebApplication, FAQ e breadcrumb. */
export function CalculatorJsonLd({ calculator }: { calculator: PublicCalculatorSeo }) {
  const siteUrl = getViralBaseUrl().replace(/\/$/, '');
  const pageUrl = `${siteUrl}${calculator.path}`;

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: calculator.name,
        description: calculator.description,
        url: pageUrl,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
        inLanguage: 'pt-BR',
        isPartOf: { '@type': 'WebSite', name: 'Resolva Jato', url: siteUrl }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Recursos', item: `${siteUrl}/recursos` },
          { '@type': 'ListItem', position: 3, name: calculator.breadcrumbLabel, item: pageUrl }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: calculator.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer }
        }))
      }
    ]
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
  );
}
