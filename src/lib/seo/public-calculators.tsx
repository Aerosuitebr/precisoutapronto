import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getViralBaseUrl } from '@/lib/viral-loop';

export type PublicCalculatorSeo = {
  path: string;
  name: string;
  description: string;
  breadcrumbLabel: string;
  interpretTitle: string;
  interpretBody: string[];
  howToTitle: string;
  howToSteps: string[];
  disclaimer: string;
  guideHref: string;
  guideLabel: string;
  related: Array<{ href: string; label: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
};

export const PUBLIC_CALCULATORS: Record<string, PublicCalculatorSeo> = {
  rescisao: {
    path: '/calculadora-de-rescisao',
    name: 'Calculadora de rescisão trabalhista',
    description:
      'Calcule uma estimativa de saldo de salário, férias, 13º, aviso-prévio e FGTS sem cadastro.',
    breadcrumbLabel: 'Rescisão',
    interpretTitle: 'Como interpretar a estimativa',
    interpretBody: [
      'O resultado organiza as verbas mais frequentes conforme os dados informados. A modalidade de desligamento, convenções coletivas, médias salariais e descontos podem alterar o valor final.',
      'Use a simulação como conferência inicial. Ela não substitui TRCT, homologação nem análise de um contador ou advogado trabalhista.'
    ],
    howToTitle: 'Como usar a calculadora em 4 passos',
    howToSteps: [
      'Informe salário, data de admissão e data de desligamento.',
      'Escolha a modalidade de rescisão (pedido de demissão, sem justa causa, acordo e afins).',
      'Revise o detalhamento de saldo, férias, 13º, aviso e FGTS.',
      'Copie o resumo, envie no WhatsApp ou baixe o card para conferir com um profissional.'
    ],
    disclaimer:
      'Conteúdo educativo. Não constitui parecer jurídico, trabalhista ou contábil. Regras e percentuais podem variar por acordo coletivo, categoria e legislação vigente.',
    guideHref: '/guias/como-calcular-rescisao',
    guideLabel: 'guia de cálculo de rescisão',
    related: [
      {
        href: '/guias/aviso-previo-proporcional-como-calcular',
        label: 'Aviso-prévio proporcional',
        description: 'Entenda como o tempo de casa altera o aviso.'
      },
      {
        href: '/mei-ou-clt',
        label: 'MEI ou CLT',
        description: 'Compare cenários de remuneração líquida.'
      },
      {
        href: '/orcamento-com-pix',
        label: 'Orçamento com Pix',
        description: 'Cobrança profissional no WhatsApp.'
      }
    ],
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
      },
      {
        question: 'Aviso-prévio indenizado e trabalhado são iguais?',
        answer:
          'Não. No indenizado o empregador paga o período sem exigir trabalho. No trabalhado, a pessoa continua na função durante o aviso. A calculadora usa a modalidade que você informar.'
      },
      {
        question: 'Serve para estágio ou MEI?',
        answer:
          'Não. A ferramenta foca vínculos CLT típicos. Estágio, contratos intermitentes e regimes especiais pedem análise específica.'
      }
    ]
  },
  precificacao: {
    path: '/calculadora-de-preco-freelancer',
    name: 'Calculadora de preço para freelancer',
    description:
      'Calcule custos, horas, taxas, impostos e margem para chegar a um preço de venda sustentável sem cadastro.',
    breadcrumbLabel: 'Preço freelancer',
    interpretTitle: 'Preço sustentável começa pelo custo real',
    interpretBody: [
      'A calculadora combina materiais, frete, tempo produtivo, custos fixos, taxas, impostos e margem. O valor sugerido é uma referência gerencial.',
      'Demanda, posicionamento e complexidade do projeto também influenciam o preço final negociado com o cliente.'
    ],
    howToTitle: 'Como precificar com a calculadora',
    howToSteps: [
      'Liste materiais, frete e outros custos diretos do trabalho.',
      'Informe horas produtivas e o custo da sua hora de trabalho.',
      'Rateie custos fixos e aplique taxas, impostos e margem desejada.',
      'Use o preço sugerido como base e ajuste conforme o mercado.'
    ],
    disclaimer:
      'Estimativa educativa para gestão de preço. Não substitui planejamento financeiro, análise tributária nem consultoria de negócios.',
    guideHref: '/guias/como-precificar-servico-freelancer',
    guideLabel: 'como precificar serviço freelancer',
    related: [
      {
        href: '/guias/quanto-cobrar-por-hora-freelancer',
        label: 'Quanto cobrar por hora',
        description: 'Monte a hora mínima sem esquecer custos ocultos.'
      },
      {
        href: '/guias/custos-fixos-do-freelancer-como-ratear',
        label: 'Rateio de custos fixos',
        description: 'Distribua aluguel, internet e ferramentas no preço.'
      },
      {
        href: '/gerador-de-proposta-comercial',
        label: 'Proposta comercial',
        description: 'Transforme o preço em uma proposta clara.'
      }
    ],
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
      },
      {
        question: 'Devo mostrar meu valor por hora ao cliente?',
        answer:
          'Não é obrigatório. Muitos freelancers usam a hora só como referência interna e apresentam um valor fechado por projeto.'
      },
      {
        question: 'O que fazer se o mercado pagar menos?',
        answer:
          'Revise escopo, posicionamento e custos. Aceitar preço abaixo do custo por muito tempo torna a operação insustentável.'
      }
    ]
  },
  'mei-clt': {
    path: '/mei-ou-clt',
    name: 'Simulador MEI ou CLT',
    description:
      'Compare uma estimativa de renda líquida como CLT e MEI considerando descontos, DAS e custos mensais.',
    breadcrumbLabel: 'MEI ou CLT',
    interpretTitle: 'A comparação não termina no valor líquido',
    interpretBody: [
      'Benefícios, estabilidade, férias, FGTS, risco comercial e custos de operação também fazem parte da decisão.',
      'A simulação é educativa e não substitui orientação contábil, tributária ou trabalhista.'
    ],
    howToTitle: 'Como comparar MEI e CLT aqui',
    howToSteps: [
      'Informe o salário CLT e os descontos típicos do holerite.',
      'No cenário MEI, estime faturamento, DAS e custos mensais.',
      'Compare o líquido aproximado dos dois lados.',
      'Leia o guia complementar antes de decidir com um contador.'
    ],
    disclaimer:
      'Comparação educativa. Não avalia pejotização indevida, enquadramento de atividade MEI nem benefícios específicos do seu contrato.',
    guideHref: '/guias/mei-ou-clt-como-comparar',
    guideLabel: 'MEI ou CLT: como comparar',
    related: [
      {
        href: '/guias/quando-o-mei-compensa-mais-que-a-clt',
        label: 'Quando o MEI compensa',
        description: 'Sinais práticos além do valor mensal.'
      },
      {
        href: '/calculadora-de-preco-freelancer',
        label: 'Precificação',
        description: 'Monte preço sustentável se for autônomo.'
      },
      {
        href: '/proposta-comercial-mei',
        label: 'Proposta para MEI',
        description: 'Apresente serviços com cara de empresa.'
      }
    ],
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
      },
      {
        question: 'Todo profissional pode ser MEI?',
        answer:
          'Não. A ocupação precisa estar entre as permitidas e respeitar o limite de faturamento e demais requisitos vigentes.'
      },
      {
        question: 'Qual percentual a mais compensa ser MEI?',
        answer:
          'Não existe percentual universal. Benefícios, impostos, risco, custos e períodos sem faturamento variam demais para uma regra única.'
      }
    ]
  }
};

/** JSON-LD para calculadoras públicas: WebApplication, HowTo, FAQ e breadcrumb. */
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
        '@type': 'HowTo',
        name: calculator.howToTitle,
        description: calculator.description,
        step: calculator.howToSteps.map((text, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: `Passo ${index + 1}`,
          text
        }))
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

/** Blocos editoriais compartilhados pelas landings das calculadoras. */
export function CalculatorContentSections({ calculator }: { calculator: PublicCalculatorSeo }) {
  return (
    <div className="mx-auto mt-10 max-w-4xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950">{calculator.interpretTitle}</h2>
        {calculator.interpretBody.map((paragraph) => (
          <p key={paragraph} className="mt-4 leading-7 text-slate-600">
            {paragraph}
          </p>
        ))}
        <p className="mt-4 leading-7 text-slate-600">
          Consulte também o nosso{' '}
          <Link href={calculator.guideHref} className="font-semibold text-sky-700 hover:underline">
            {calculator.guideLabel}
          </Link>
          .
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950">{calculator.howToTitle}</h2>
        <ol className="mt-5 space-y-3">
          {calculator.howToSteps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          {calculator.disclaimer}
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950">Perguntas frequentes</h2>
        <div className="mt-5 divide-y divide-slate-200">
          {calculator.faq.map((item) => (
            <div key={item.question} className="py-4">
              <h3 className="font-bold text-slate-900">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-950">Continue explorando</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {calculator.related.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-white"
              >
                <span className="font-bold text-slate-900">{item.label}</span>
                <span className="mt-2 flex-1 text-sm leading-6 text-slate-600">{item.description}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
                  Abrir <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
