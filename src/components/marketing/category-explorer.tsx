'use client';

import { useState } from 'react';
import { ArrowRight, LayoutGrid } from 'lucide-react';
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
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por área">
        <button
          type="button"
          role="tab"
          aria-selected={active === 'todos'}
          onClick={() => setActive('todos')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition',
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
              'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition',
              active === category.id
                ? 'border-[#031f4b] bg-[#031f4b] text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            )}
          >
            {category.shortLabel}
          </button>
        ))}
      </div>

      <ul className="mt-6 flex snap-x gap-5 overflow-x-auto pb-2 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-5">
        {CATEGORY_OVERVIEW.map((category) => {
          const CategoryIcon = category.icon;
          const isActive = active === category.id;
          const isDimmed = active !== 'todos' && !isActive;
          const shownTools = active === 'todos' ? category.tools.slice(0, 3) : category.tools;
          const highlights = active === 'todos' ? CATEGORY_HIGHLIGHTS[category.id] : undefined;
          const extra = active === 'todos' ? category.tools.length - shownTools.length : 0;

          return (
            <li key={category.id} className="relative w-[260px] shrink-0 snap-start sm:w-auto">
              <AuthAwareLink
                href={`/recursos#category-${category.id}`}
                onMouseEnter={() => setActive(category.id)}
                className={cn(
                  'group flex h-full flex-col overflow-hidden rounded-2xl border bg-slate-50/80 p-5 transition hover:-translate-y-0.5 hover:shadow-md',
                  isActive
                    ? 'border-[#0b5cff]/45 bg-white shadow-md ring-1 ring-[#0b5cff]/20'
                    : 'border-slate-200 hover:border-[#0b5cff]/40 hover:bg-white',
                  isDimmed && 'opacity-60'
                )}
              >
                <span className={cn('absolute inset-x-0 top-0 h-1', category.accentBar)} aria-hidden />
                <span
                  className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', category.iconClass)}
                >
                  <CategoryIcon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-base font-bold text-[#031f4b] group-hover:text-[#0b5cff]">
                  {category.shortLabel}
                </p>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {category.tools.length} ferramentas
                </p>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{category.description}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {(highlights || shownTools.map((tool) => tool.name)).map((name) => (
                    <li
                      key={name}
                      className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200"
                    >
                      {name}
                    </li>
                  ))}
                  {extra > 0 && (
                    <li className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-400 ring-1 ring-slate-200">
                      +{extra}
                    </li>
                  )}
                </ul>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0b5cff]">
                  Explorar
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
