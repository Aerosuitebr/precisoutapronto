'use client';

import { useState, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/** 16px no mobile evita zoom do iOS ao focar o campo. */
export const livePreviewFieldClass =
  'w-full rounded-lg border border-slate-300 px-3 py-3 text-base text-slate-900 outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200';

/**
 * Layout do experimente-agora nas landings:
 * - Mobile: formulário estável; preview oculto por padrão (sem “samba” ao digitar).
 * - Desktop: formulário sticky + preview ao lado.
 */
export function LiveToolPreviewLayout({
  form,
  preview,
  previewAside
}: {
  form: ReactNode;
  preview: ReactNode;
  previewAside?: ReactNode;
}) {
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="min-w-0 lg:sticky lg:top-3 lg:z-10 lg:self-start">
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:space-y-6 sm:p-6">
          {form}
        </div>

        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100 lg:hidden"
          onClick={() => setMobilePreviewOpen((open) => !open)}
          aria-expanded={mobilePreviewOpen}
        >
          {mobilePreviewOpen ? (
            <>
              <EyeOff className="h-4 w-4" aria-hidden />
              Ocultar preview
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" aria-hidden />
              Ver preview ao vivo
            </>
          )}
        </button>
      </div>

      <div
        className={cn(
          'min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm [overflow-anchor:none]',
          mobilePreviewOpen ? 'max-lg:block' : 'max-lg:hidden',
          'lg:block'
        )}
      >
        <div className="relative max-lg:h-[min(52vh,400px)] max-lg:overflow-y-auto max-lg:overscroll-contain sm:p-6 lg:h-auto lg:overflow-visible lg:p-8">
          <div className="p-3 sm:p-0">
            <div className="relative mx-auto w-full max-w-[560px] max-lg:h-[520px] max-lg:overflow-hidden lg:h-auto">
              <div className="origin-top rounded-lg bg-white shadow-lg max-lg:absolute max-lg:left-0 max-lg:top-0 max-lg:w-[560px] max-lg:max-w-none max-lg:scale-[0.62] lg:relative lg:w-full lg:scale-100">
                {preview}
              </div>
            </div>
          </div>
        </div>

        {previewAside ? (
          <div className="border-t border-slate-200 bg-white/70 p-3 sm:p-4">{previewAside}</div>
        ) : null}
      </div>
    </div>
  );
}
