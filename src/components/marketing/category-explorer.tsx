'use client';

import { useState } from 'react';
import { ArrowRight, Check, LayoutGrid } from 'lucide-react';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { getToolsByCategory, toolCategories, type ToolCategoryId } from '@/lib/tools-catalog';
import { cn } from '@/lib/utils';

const CATEGORY_OVERVIEW = toolCategories.map((category) => ({
  ...category,
  tools: getToolsByCategory(category.id)
}));

const CATEGORY_HIGHLIGHTS: Partial<Record<ToolCategoryId, string[]>> = {
  carreira: ['Documentos jurídicos acadêmicos', 'Redação ENEM', 'Referências ABNT']
};

/** Grid de categorias com filtro rápido por perfil — sem recarregar a página. */
export function CategoryExplorer() {
  const [active, setActive] = useState<ToolCategoryId | 'todos'>('todos');

  return (
    <div className="min-w-0 max-w-full">
      <div className="-mx-4 flex max-w-[calc(100vw)] snap-x gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:max-w-none sm:flex-wrap sm:overflow-visible sm:px-0" role="tablist" aria-label="Filtrar por área">
        <button
          type="button"
          role="tab"
          aria-selected={active === 'todos'}
          onClick={() => setActive('todos')}
          className={cn(
            'inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition',
            active === 'todos'
              ? 'border-[#031f4b] bg-[#031f4b] text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Todas as áreas
        </button>
        {CATEGORY_OVERVIEW.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={active === category.id}
            onClick={() => setActive(category.id)}
            className={cn(
              'inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition',
              active === category.id
                ? 'border-[#031f4b] bg-[#031f4b] text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            )}
          >
            {category.shortLabel}
          </button>
        ))}
      </div>

      <ul className="mt-7 grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_OVERVIEW.map((category) => {
          const CategoryIcon = category.icon;
          const isActive = active === category.id;
          const isDimmed = active !== 'todos' && !isActive;
          const shownTools = active === 'todos' ? category.tools.slice(0, 3) : category.tools;
          const highlights = active === 'todos' ? CATEGORY_HIGHLIGHTS[category.id] : undefined;
          const extra = active === 'todos' ? category.tools.length - shownTools.length : 0;

          return (
            <li key={category.id} className={cn('relative min-w-0', isDimmed && 'hidden')}>
              <AuthAwareLink
                href={`/recursos#category-${category.id}`}
                className={cn(
                  'group flex h-full min-h-[330px] flex-col overflow-hidden rounded-[1.5rem] border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg',
                  isActive
                    ? 'border-[#0b5cff] ring-2 ring-[#0b5cff]/15'
                    : 'border-slate-200 hover:border-[#0b5cff]/40'
                )}
              >
                <span className={cn('absolute inset-x-0 top-0 h-1', category.accentBar)} aria-hidden />
                <span
                  className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', category.iconClass)}
                >
                  <CategoryIcon className="h-5 w-5" />
                </span>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xl font-black text-[#031f4b] group-hover:text-[#0b5cff]">{category.shortLabel}</p>
                  <span className="shrink-0 rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#0b5cff]">{category.tools.length} opções</span>
                </div>
                <p className="mt-3 break-words text-sm leading-6 text-slate-600">{category.description}</p>
                <ul className="mt-5 flex-1 space-y-2.5 border-t border-slate-100 pt-5">
                  {(highlights || shownTools.map((tool) => tool.name)).map((name) => (
                    <li
                      key={name}
                      className="flex max-w-full items-start gap-2 break-words text-sm font-medium leading-5 text-slate-700"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                      <span>{name}</span>
                    </li>
                  ))}
                  {extra > 0 && (
                    <li className="pl-6 text-sm font-semibold text-slate-500">
                      + {extra} {extra === 1 ? 'ferramenta' : 'ferramentas'}
                    </li>
                  )}
                </ul>
                <span className="mt-6 inline-flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-black text-[#0b5cff]">
                  Ver ferramentas
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </AuthAwareLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
