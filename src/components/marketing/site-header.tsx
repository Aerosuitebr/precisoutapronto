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
  { href: '/recursos', label: 'Ferramentas', auth: false },
  { href: '/biblioteca', label: 'Biblioteca', auth: false },
  { href: '/guias', label: 'Guias', auth: false }
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [segmentsOpen, setSegmentsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#0b5cff]/20 bg-white/95 shadow-[0_8px_24px_-20px_rgba(3,31,75,.45)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6 lg:gap-5">
        <Link href="/" className="min-w-0 shrink" aria-label="Precisou, Tá Pronto, ferramentas online que resolvem de verdade">
          <Logo
            variant="marketing"
            className="h-16 max-w-none sm:h-20"
          />
          <span className="sr-only">Ferramentas online que resolvem de verdade</span>
        </Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-1.5 lg:flex">
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
                  ? 'bg-[#eef5ff] text-[#031f4b]'
                  : 'text-slate-600 hover:bg-[#eef5ff] hover:text-[#031f4b]'
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
                    className="rounded-xl p-3 outline-none transition-colors hover:bg-[#eef5ff] focus:bg-[#eef5ff] focus:ring-2 focus:ring-[#0b5cff]/35"
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
                ? 'bg-[#031f4b] text-white'
                : 'text-slate-600 hover:bg-[#eef5ff] hover:text-[#031f4b]'
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
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            aria-controls="menu-principal-mobile"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div id="menu-principal-mobile" className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav aria-label="Navegação principal no celular" className="mx-auto grid max-w-6xl gap-2">
            <p className="px-4 pt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Por perfil</p>
            <div className="grid grid-cols-2 gap-1">
              {growthSegments.map((segment) => (
                <Link key={segment.slug} href={`/para/${segment.slug}`} className="flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => setMobileOpen(false)}>
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
                  <Link href="/recursos" onClick={() => setMobileOpen(false)}>
                    Explorar ferramentas
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
