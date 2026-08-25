'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Lock, Mail, MonitorSmartphone } from 'lucide-react';
import { AuthReturnBanner } from '@/components/auth/auth-return-banner';
import { TurnstileWidget } from '@/components/auth/turnstile-widget';
import { AuthShell } from '@/components/brand/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { loginUser, resendVerification } from '@/lib/auth';

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/ferramentas';
  return raw;
}

function formatSeenAt(iso?: string) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const { ready, isAuthenticated, refresh } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [sessionConflict, setSessionConflict] = useState<{
    message: string;
    lastSeenAt?: string;
  } | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (isAuthenticated) router.replace(next);
  }, [isAuthenticated, next, ready, router]);

  useEffect(() => {
    try {
      const replaced = sessionStorage.getItem('precisoutapronto-session-replaced');
      if (replaced) {
        setInfo(replaced);
        sessionStorage.removeItem('precisoutapronto-session-replaced');
      }
    } catch {
      // ignore
    }
  }, []);

  async function submitLogin(forceTakeover: boolean) {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const data = await loginUser({ email, password, forceTakeover });
      if (!data.ok && data.code === 'SESSION_ACTIVE') {
        setSessionConflict({
          message: data.message,
          lastSeenAt: data.lastSeenAt
        });
        return;
      }

      setSessionConflict(null);
      await refresh();
      if (!('emailVerified' in data) || !data.emailVerified) {
        setNeedsVerify(true);
        setInfo(
          'Conta encontrada. Você já pode usar as ferramentas. Confirme o e-mail quando puder para proteger o acesso.'
        );
      }
      if ('replaced' in data && data.replaced) {
        setInfo('O outro dispositivo foi desconectado. Você está conectado aqui.');
      }
      router.push(next);
    } catch (submitError) {
      setSessionConflict(null);
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitLogin(false);
  }

  async function handleResend() {
    setError('');
    setInfo('');
    try {
      const result = (await resendVerification(email, turnstileToken)) as {
        emailSent?: boolean;
        emailError?: string;
        message?: string;
      };
      if (result.emailSent === false) {
        setError(
          result.emailError
            ? `Não foi possível enviar o e-mail: ${result.emailError}`
            : 'Não foi possível enviar o e-mail de confirmação. Tente de novo em instantes.'
        );
        return;
      }
      setInfo(result.message || 'Se a conta existir e ainda não estiver confirmada, enviamos um novo e-mail.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao reenviar.');
    }
  }

  const lastSeenLabel = formatSeenAt(sessionConflict?.lastSeenAt);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthReturnBanner nextHref={searchParams.get('next')} />
      <p className="text-center text-sm text-slate-600">Acesse suas ferramentas e gere documentos profissionais.</p>
      <label className="relative block">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSessionConflict(null);
          }}
          placeholder="email@exemplo.com"
          className="pl-10"
          required
          disabled={Boolean(sessionConflict)}
        />
      </label>
      <label className="relative block">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setSessionConflict(null);
          }}
          placeholder="Senha"
          className="pl-10"
          required
          disabled={Boolean(sessionConflict)}
        />
      </label>
      {needsVerify ? <TurnstileWidget onToken={setTurnstileToken} language="pt-BR" /> : null}

      {sessionConflict ? (
        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <div className="flex items-start gap-3">
            <MonitorSmartphone className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-bold">Há um dispositivo conectado</p>
              <p className="mt-1 leading-6 text-amber-900/90">{sessionConflict.message}</p>
              {lastSeenLabel ? (
                <p className="mt-2 text-xs font-medium text-amber-800/80">
                  Última atividade: {lastSeenLabel}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="w-full bg-amber-500 font-bold text-slate-950 hover:bg-amber-400"
              loading={loading}
              onClick={() => void submitLogin(true)}
            >
              Continuar e desconectar o outro
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
              disabled={loading}
              onClick={() => setSessionConflict(null)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {info ? <p className="text-sm font-medium text-sky-700">{info}</p> : null}

      {!sessionConflict ? (
        <Button type="submit" className="w-full" loading={loading}>
          Entrar
        </Button>
      ) : null}

      {needsVerify ? (
        <Button type="button" variant="outline" className="w-full" onClick={() => void handleResend()}>
          Reenviar confirmação
        </Button>
      ) : null}
      <p className="text-center text-sm text-slate-600">
        Ainda não tem conta?{' '}
        <Link
          href={`/cadastro?next=${encodeURIComponent(next)}`}
          className="font-semibold text-sky-700 hover:text-sky-800"
        >
          Criar conta grátis
        </Link>
      </p>
      <p className="rounded-xl bg-sky-50 px-4 py-3 text-center text-sm leading-6 text-slate-700">
        A busca de recursos continua gratuita e sem cadastro em{' '}
        <Link href="/busca" className="font-semibold text-sky-700">
          /busca
        </Link>
        .
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell subtitle="Entre para usar currículos, recibos, propostas e agenda.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
