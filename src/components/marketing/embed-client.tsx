'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Copy } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { Button } from '@/components/ui/button';
import { partnerUtm } from '@/lib/seo/authority-assets';
import { BRAND_SITE } from '@/lib/brand';

const EMBEDS = [
  {
    id: 'badge-geral',
    title: 'Badge geral',
    html: `<a href="${partnerUtm('/', 'embed', 'badge_geral')}" rel="noopener noreferrer"><img src="${BRAND_SITE}/badges/ferramentas-gratis.svg" alt="Ferramentas grátis · Precisou, Tá Pronto" width="260" height="40" /></a>`
  },
  {
    id: 'badge-feito',
    title: 'Badge “feito com”',
    html: `<a href="${partnerUtm('/', 'embed', 'badge_feito')}" rel="noopener noreferrer"><img src="${BRAND_SITE}/badges/feito-com-precisou-ta-pronto.svg" alt="Feito com Precisou, Tá Pronto" width="240" height="40" /></a>`
  },
  {
    id: 'rescisao',
    title: 'Bloco · calculadora de rescisão',
    html: `<p><strong>Calculadora de rescisão grátis:</strong> estime saldo, férias, 13º, aviso e FGTS no navegador. <a href="${partnerUtm('/calculadora-de-rescisao', 'embed', 'rescisao')}" rel="noopener noreferrer">Abrir no Precisou, Tá Pronto</a>.</p>`
  },
  {
    id: 'recibos',
    title: 'Bloco · gerador de recibos',
    html: `<p><strong>Gerador de recibo online grátis:</strong> crie recibos de pagamento, serviço, Pix e aluguel e baixe em PDF. <a href="${partnerUtm('/recibos', 'embed', 'recibos')}" rel="noopener noreferrer">Criar recibo no Precisou, Tá Pronto</a>.</p>`
  },
  {
    id: 'mei-pix',
    title: 'Bloco · orçamento com Pix',
    html: `<p><strong>Orçamento com Pix no WhatsApp:</strong> o cliente aprova no celular e você cobra na hora. <a href="${partnerUtm('/orcamento-com-pix', 'embed', 'mei_pix')}" rel="noopener noreferrer">Montar orçamento grátis</a>.</p>`
  },
  {
    id: 'enem',
    title: 'Bloco · redação ENEM',
    html: `<p><strong>Corretor de redação ENEM:</strong> estimativa por competência para treinar antes da prova. <a href="${partnerUtm('/corretor-de-redacao-enem', 'embed', 'enem')}" rel="noopener noreferrer">Analisar redação</a>.</p>`
  },
  {
    id: 'orcamento-eletricista',
    title: 'Bloco · orçamento para eletricista',
    html: `<p><strong>Modelo de orçamento para eletricista:</strong> organize visita, materiais e mão de obra em um link com aprovação e Pix. <a href="${partnerUtm('/orcamento-para/eletricista', 'embed', 'eletricista')}" rel="noopener noreferrer">Usar modelo grátis</a>.</p>`
  },
  {
    id: 'orcamento-pintor',
    title: 'Bloco · orçamento para pintor',
    html: `<p><strong>Modelo de orçamento para pintor:</strong> descreva ambientes, metragem, preparação, materiais e prazo. <a href="${partnerUtm('/orcamento-para/pintor', 'embed', 'pintor')}" rel="noopener noreferrer">Criar orçamento</a>.</p>`
  },
  {
    id: 'orcamento-ar',
    title: 'Bloco · instalação de ar-condicionado',
    html: `<p><strong>Orçamento para instalação de ar-condicionado:</strong> separe equipamento, tubulação, instalação e deslocamento. <a href="${partnerUtm('/orcamento-para/instalacao-ar-condicionado', 'embed', 'ar_condicionado')}" rel="noopener noreferrer">Abrir modelo</a>.</p>`
  },
  {
    id: 'recibo-aluguel',
    title: 'Bloco · recibo de aluguel',
    html: `<p><strong>Recibo de aluguel online grátis:</strong> identifique locador, inquilino, imóvel e competência e baixe o PDF. <a href="${partnerUtm('/recibo-de-aluguel', 'embed', 'imobiliarias')}" rel="noopener noreferrer">Gerar recibo</a>.</p>`
  },
  {
    id: 'assinatura-email',
    title: 'Bloco · assinatura de e-mail',
    html: `<p><strong>Gerador de assinatura de e-mail grátis:</strong> adicione logo, cargo, WhatsApp e redes e copie pronta para Gmail ou Outlook. <a href="${partnerUtm('/assinatura-de-email', 'embed', 'assinatura_email')}" rel="noopener noreferrer">Criar assinatura</a>.</p>`
  },
  {
    id: 'pdf',
    title: 'Bloco · ferramentas para PDF',
    html: `<p><strong>Ferramentas grátis para PDF:</strong> junte, divida, comprima e edite arquivos diretamente no navegador. <a href="${partnerUtm('/pdf', 'embed', 'pdf')}" rel="noopener noreferrer">Abrir ferramentas para PDF</a>.</p>`
  },
  {
    id: 'curriculo',
    title: 'Bloco · gerador de currículo',
    html: `<p><strong>Gerador de currículo grátis em PDF:</strong> modelos prontos no navegador, sem cadastro para começar. <a href="${partnerUtm('/gerador-de-curriculo', 'embed', 'curriculo')}" rel="noopener noreferrer">Criar currículo no Precisou, Tá Pronto</a>.</p>`
  },
  {
    id: 'abnt',
    title: 'Bloco · referências ABNT',
    html: `<p><strong>Gerador de referências ABNT:</strong> formate bibliografia para TCC e trabalhos. <a href="${partnerUtm('/gerador-de-referencias-abnt', 'embed', 'abnt')}" rel="noopener noreferrer">Gerar referência</a>.</p>`
  },
  {
    id: 'checklist',
    title: 'Bloco · checklist MEI',
    html: `<p><strong>Checklist de cobrança para MEI:</strong> do orçamento ao recibo, sem planilha solta. <a href="${partnerUtm('/checklist-cobranca-mei', 'embed', 'checklist_mei')}" rel="noopener noreferrer">Ver checklist</a>.</p>`
  },
  {
    id: 'pesquisa-orcamentos',
    title: 'Bloco · pesquisa sobre orçamentos',
    html: `<p><strong>O que não pode faltar em um orçamento de serviço:</strong> análise aberta dos modelos para prestadores, com metodologia e dados citáveis. <a href="${partnerUtm('/pesquisa/orcamentos-prestadores', 'embed', 'pesquisa_orcamentos')}" rel="noopener noreferrer">Consultar a pesquisa</a>.</p>`
  },
  {
    id: 'markdown',
    title: 'Markdown (README / fóruns)',
    html: `[![Ferramentas grátis · Precisou, Tá Pronto](${BRAND_SITE}/badges/ferramentas-gratis.svg)](${partnerUtm('/', 'embed', 'markdown')})`
  }
] as const;

function CopyBlock({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        <Button type="button" variant="outline" size="sm" className="gap-2 font-semibold" onClick={copy}>
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
      <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        <code>{code}</code>
      </pre>
    </article>
  );
}

export function EmbedClient() {
  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Para parceiros</p>
            <h1 className="precisoutapronto-display mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Badges e embeds prontos para linkar
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Cole no seu blog, portal, material de curso ou comunidade. Os snippets já incluem UTM para
              medirmos o impacto da parceria.
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Regras: use o link canônico, não altere o destino, e não apresente o Precisou, Tá Pronto como serviço pago
              obrigatório. Dúvidas: <Link href="/imprensa" className="font-semibold text-sky-700">imprensa</Link>.
            </p>
          </div>
        </header>
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-12 sm:px-6">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-950">Prévia dos badges</p>
            <div className="mt-4 flex flex-wrap gap-4">
              <Image src="/badges/ferramentas-gratis.svg" alt="Ferramentas grátis" width={260} height={40} />
              <Image src="/badges/feito-com-precisou-ta-pronto.svg" alt="Feito com Precisou, Tá Pronto" width={240} height={40} />
            </div>
          </div>
          {EMBEDS.map((item) => (
            <CopyBlock key={item.id} title={item.title} code={item.html} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
