interface SharedDocumentCta {
  href: string;
  label: string;
  description: string;
}

const CTA_BY_TOOL: Record<string, SharedDocumentCta> = {
  contratos: {
    href: '/ferramentas/contratos',
    label: 'Criar meu contrato',
    description: 'Monte um contrato personalizado com orientação etapa a etapa.'
  },
  curriculo: {
    href: '/ferramentas/curriculo',
    label: 'Criar meu currículo',
    description: 'Escolha um modelo profissional e gere seu currículo em poucos minutos.'
  },
  recibos: {
    href: '/ferramentas/recibos',
    label: 'Criar meu recibo',
    description: 'Gere um recibo personalizado, pronto para enviar ou imprimir.'
  },
  propostas: {
    href: '/ferramentas/propostas',
    label: 'Criar minha proposta',
    description: 'Prepare uma proposta comercial com identidade visual e valores organizados.'
  },
  juridicos: {
    href: '/ferramentas/juridicos',
    label: 'Criar documento jurídico',
    description: 'Encontre modelos jurídicos e preencha o documento adequado ao seu caso.'
  },
  contabeis: {
    href: '/ferramentas/contabeis',
    label: 'Criar documento contábil',
    description: 'Gere documentos para rotinas contábeis, fiscais e administrativas.'
  }
};

const FALLBACK_CTA: SharedDocumentCta = {
  href: '/recursos',
  label: 'Conhecer ferramentas',
  description: 'Ferramentas gratuitas para documentos, cálculos e trabalho.'
};

export function getSharedDocumentCta(toolId: string) {
  const cta = CTA_BY_TOOL[toolId] || FALLBACK_CTA;
  const query = new URLSearchParams({
    utm_source: 'shared_document',
    utm_medium: 'referral',
    utm_campaign: 'document_sharing',
    utm_content: toolId
  });
  return { ...cta, href: `${cta.href}?${query.toString()}` };
}
