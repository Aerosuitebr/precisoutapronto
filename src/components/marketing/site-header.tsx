'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { growthSegments } from '@/lib/growth/segments';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const links = [
  { href: '/biblioteca', label: 'Biblioteca', auth: false },
  { href: '/assistente/documentos', label: 'Assistente IA', auth: false },
  { href: '/recursos', label: 'Ferramentas', auth: false }
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [segmentsOpen, setSegmentsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6 lg:gap-5">
        <Link href="/" className="min-w-0 shrink" aria-label="Página inicial Resolva Jato">
          <Logo
            variant="marketing"
            className="h-10 max-w-[7.5rem] sm:h-12 sm:max-w-none lg:h-14"
          />
        </Link>
        <nav className="hidden items-center gap-1.5 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setSegmentsOpen(true)}
            onMouseLeave={() => setSegmentsOpen(false)}
            onFocus={() => setSegmentsOpen(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setSegmentsOpen(false);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setSegmentsOpen(false);
                event.currentTarget.querySelector('button')?.focus();
              }
            }}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={segmentsOpen}
              onClick={() => setSegmentsOpen(true)}
              className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                segmentsOpen
                  ? 'bg-slate-100 text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              Para você
              <ChevronDown className={cn('h-4 w-4 transition-transform', segmentsOpen && 'rotate-180')} />
            </button>
            <div
              className={cn(
                'absolute left-0 top-full z-50 w-[560px] pt-2 transition duration-150',
                segmentsOpen
                  ? 'visible translate-y-0 opacity-100'
                  : 'invisible -translate-y-1 opacity-0'
              )}
            >
              <div role="menu" className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15">
                {growthSegments.map((segment) => (
                  <Link
                    key={segment.slug}
                    href={`/para/${segment.slug}`}
                    role="menuitem"
                    onClick={() => setSegmentsOpen(false)}
                    className="rounded-xl p-3 outline-none transition-colors hover:bg-sky-50 focus:bg-sky-50 focus:ring-2 focus:ring-sky-300"
                  >
                    <span className="block text-sm font-bold text-slate-900">{segment.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{segment.shortDescription}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {links.map((link) => {
            const className = cn(
              'whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
              pathname === link.href || pathname.startsWith(`${link.href}/`)
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            );
            if (link.auth) {
              return (
                <AuthAwareLink key={link.href} href={link.href} className={className}>
                  {link.label}
                </AuthAwareLink>
              );
            }
            return (
              <Link key={link.href} href={link.href} className={className}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          <LocaleSwitcher locale="pt-BR" label="Idioma" />
          {isAuthenticated ? (
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/ferramentas">Minhas ferramentas</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/cadastro">Criar conta grátis</Link>
              </Button>
            </>
          )}
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav className="mx-auto grid max-w-6xl gap-2">
            <p className="px-4 pt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Por perfil</p>
            <div className="grid grid-cols-2 gap-1">
              {growthSegments.map((segment) => (
                <Link key={segment.slug} href={`/para/${segment.slug}`} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => setMobileOpen(false)}>
                  {segment.name}
                </Link>
              ))}
            </div>
            {links.map((link) => {
              const className =
                'rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100';
              if (link.auth) {
                return (
                  <AuthAwareLink
                    key={link.href}
                    href={link.href}
                    className={className}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </AuthAwareLink>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={className}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <Button asChild className="mt-2">
                <Link href="/ferramentas" onClick={() => setMobileOpen(false)}>
                  Minhas ferramentas
                </Link>
              </Button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Entrar
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/cadastro" onClick={() => setMobileOpen(false)}>
                    Criar conta
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
