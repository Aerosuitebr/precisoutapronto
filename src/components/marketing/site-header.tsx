'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { AuthAwareLink } from '@/components/auth/auth-aware-link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { SEO_FOCUS_CLUSTERS } from '@/lib/seo/focus-cycle';

const links = [
  ...SEO_FOCUS_CLUSTERS.map(({ href, label }) => ({ href, label, auth: false as const })),
  { href: '/guias', label: 'Guias', auth: false }
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#0b5cff]/20 bg-white/95 shadow-[0_8px_24px_-20px_rgba(3,31,75,.45)] backdrop-blur-xl">
      <div className="mx-auto flex min-w-0 max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-2.5 lg:gap-5">
        <Link href="/" className="min-w-0 flex-1 overflow-hidden" aria-label="Precisou, Tá Pronto, ferramentas online que resolvem de verdade">
          <Logo
            variant="marketing"
            className="h-12 max-w-[145px] sm:h-16 sm:max-w-none lg:h-20"
          />
          <span className="sr-only">Ferramentas online que resolvem de verdade</span>
        </Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-1.5 lg:flex">
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
        <div id="menu-principal-mobile" className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 shadow-2xl lg:hidden">
          <nav aria-label="Navegação principal no celular" className="mx-auto grid max-w-6xl gap-2">
            <p className="px-4 pt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Temas principais</p>
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
