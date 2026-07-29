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
  { href: '/calculadora-de-rescisao', label: 'Rescisão', auth: false },
  { href: '/mei-ou-clt', label: 'MEI ou CLT', auth: false },
  { href: '/recursos', label: 'Ferramentas', auth: false }
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-3.5">
        <Link href="/" className="min-w-0 shrink" aria-label="Página inicial Resolva Jato">
          <Logo
            variant="marketing"
            className="h-10 max-w-[7.5rem] sm:h-14 sm:max-w-none lg:h-[4.25rem]"
          />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <div className="group relative">
            <button className="inline-flex items-center gap-1 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              Para você <ChevronDown className="h-4 w-4" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 mt-2 grid w-[520px] grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
              {growthSegments.map((segment) => (
                <Link key={segment.slug} href={`/para/${segment.slug}`} className="rounded-xl p-3 hover:bg-slate-50">
                  <span className="block text-sm font-bold text-slate-900">{segment.name}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{segment.shortDescription}</span>
                </Link>
              ))}
            </div>
          </div>
          {links.map((link) => {
            const className = cn(
              'rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
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
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
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
