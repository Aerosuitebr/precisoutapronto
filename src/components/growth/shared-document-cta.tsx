'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getSharedDocumentCta } from '@/lib/shared-document-growth';
import { trackEvent } from '@/lib/analytics';

export function SharedDocumentCta({ toolId }: { toolId: string }) {
  const cta = getSharedDocumentCta(toolId);

  useEffect(() => {
    trackEvent('shared_document_landing_viewed', { tool_id: toolId });
  }, [toolId]);

  return (
    <div className="mt-8 rounded-2xl bg-emerald-950 p-6 text-white">
      <Sparkles className="h-5 w-5 text-amber-300" />
      <h2 className="mt-3 text-xl font-bold">Crie o seu no Precisou, Tá Pronto</h2>
      <p className="mt-2 text-sm text-emerald-100">{cta.description}</p>
      <Link
        href={cta.href}
        onClick={() => trackEvent('shared_document_cta_clicked', { tool_id: toolId })}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950"
      >
        {cta.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
