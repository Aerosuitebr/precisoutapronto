'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { TurnstileWidget } from '@/components/auth/turnstile-widget';
import { PasswordStrength } from '@/components/auth/password-strength';
import { AuthShell } from '@/components/brand/auth-shell';
import { DocumentLang } from '@/components/i18n/document-lang';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { loginUser, registerUser, resendVerification } from '@/lib/auth';
import { internationalCopy, type InternationalLocale } from '@/lib/i18n';
import { evaluatePasswordStrength } from '@/lib/password';
import {
  clearStoredReferralCode,
  readStoredReferralCode
} from '@/components/referral/referral-capture';
import { normalizeReferralCode } from '@/lib/referral-shared';

function safeNext(raw: string | null, fallback: string) {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw;
}

function turnstileLanguage(locale: InternationalLocale): 'en' | 'es' {
  return locale === 'es' ? 'es' : 'en';
}

function requiredMessage(locale: InternationalLocale) {
  return locale === 'es' ? 'Completa este campo.' : 'Please fill out this field.';
}

function applyRequiredValidity(
  event: React.FormEvent<HTMLInputElement>,
  locale: InternationalLocale
) {
  const input = event.currentTarget;
  if (input.validity.valueMissing) {
    input.setCustomValidity(requiredMessage(locale));
  } else {
    input.setCustomValidity('');
  }
}

export function InternationalLoginPage({ locale }: { locale: InternationalLocale }) {
  const copy = internationalCopy[locale].auth;
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'), `/${locale}/tools`);
  const { refresh } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [needsVerify, setNeedsVerify] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await loginUser({ email, password });
      if (!result.ok) {
        setError(copy.login.error);
        return;
      }
      if (!('emailVerified' in result) || !result.emailVerified) {
        setNeedsVerify(true);
        setMessage(copy.login.verify);
      }
      await refresh();
      router.push(next);
    } catch {
      setError(copy.login.error);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError('');
    try {
      await resendVerification(email, turnstileToken, locale);
      setMessage(copy.login.resendSuccess);
    } catch {
      setError(copy.login.error);
    }
  }

  return (
    <>
      <DocumentLang lang={locale} />
    <AuthShell
      subtitle={copy.login.subtitle}
      homeHref={`/${locale}`}
      homeLabel={copy.backHome}
    >
      <form onSubmit={submit} className="space-y-4" lang={locale}>
        <p className="text-center text-sm text-slate-600">{copy.login.intro}</p>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
            {copy.email}
          </span>
          <span className="relative block">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="email"
              value={email}
              onChange={(event) => {
                event.currentTarget.setCustomValidity('');
                setEmail(event.target.value);
              }}
              onInvalid={(event) => applyRequiredValidity(event, locale)}
              placeholder="email@example.com"
              className="pl-10"
              autoComplete="email"
              required
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
            {copy.login.password}
          </span>
          <span className="relative block">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              value={password}
              onChange={(event) => {
                event.currentTarget.setCustomValidity('');
                setPassword(event.target.value);
              }}
              onInvalid={(event) => applyRequiredValidity(event, locale)}
              placeholder={copy.login.password}
              className="pl-10"
              autoComplete="current-password"
              required
            />
          </span>
        </label>

        {needsVerify ? (
          <TurnstileWidget onToken={setTurnstileToken} language={turnstileLanguage(locale)} />
        ) : null}
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        {message ? <p className="text-sm font-medium text-sky-700">{message}</p> : null}

        <Button type="submit" className="w-full" loading={loading}>
          {loading ? copy.login.loading : copy.login.submit}
        </Button>
        {needsVerify ? (
          <Button type="button" variant="outline" className="w-full" onClick={() => void resend()}>
            {copy.login.resend}
          </Button>
        ) : null}

        <p className="text-center text-sm text-slate-600">
          {copy.login.noAccount}{' '}
          <Link
            href={`/${locale}/cadastro?next=${encodeURIComponent(next)}`}
            className="font-semibold text-sky-700 hover:text-sky-800"
          >
            {copy.login.createAccount}
          </Link>
        </p>
        <p className="flex items-center justify-center gap-2 rounded-xl bg-sky-50 px-4 py-3 text-center text-xs text-slate-600">
          <ShieldCheck className="h-4 w-4 text-sky-700" />
          {copy.privacy}
        </p>
      </form>
    </AuthShell>
    </>
  );
}

export function InternationalRegisterPage({ locale }: { locale: InternationalLocale }) {
  const copy = internationalCopy[locale].auth;
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'), `/${locale}/tools`);
  const referralFromUrl = normalizeReferralCode(searchParams.get('ref'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [doneEmail, setDoneEmail] = useState('');
  const [referralCode] = useState(() => referralFromUrl || readStoredReferralCode());
  const strength = useMemo(() => evaluatePasswordStrength(password, locale), [password, locale]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!strength.valid) {
      setError(strength.firstError || copy.register.passwordHelp);
      return;
    }
    setLoading(true);
    try {
      const result = await registerUser({
        name,
        email,
        password,
        turnstileToken,
        referralCode: referralCode || undefined,
        locale
      });
      clearStoredReferralCode();
      setDoneEmail(result.email);
    } catch {
      setError(copy.register.error);
    } finally {
      setLoading(false);
    }
  }

  if (doneEmail) {
    return (
      <>
        <DocumentLang lang={locale} />
      <AuthShell
        subtitle={copy.register.subtitle}
        homeHref={`/${locale}`}
        homeLabel={copy.backHome}
      >
        <div className="space-y-4 text-center">
          <Mail className="mx-auto h-10 w-10 text-sky-600" />
          <p className="text-lg font-bold text-slate-900">{copy.register.confirmTitle}</p>
          <p className="text-sm leading-6 text-slate-600">
            {copy.register.confirmText} <strong>{doneEmail}</strong>.
          </p>
          <Button asChild className="w-full">
            <Link
              href={`/${locale}/login?next=${encodeURIComponent(next)}&email=${encodeURIComponent(doneEmail)}`}
            >
              {copy.register.goToLogin}
            </Link>
          </Button>
          <p className="text-xs text-slate-500">{copy.register.confirmHelp}</p>
        </div>
      </AuthShell>
      </>
    );
  }

  return (
    <>
      <DocumentLang lang={locale} />
    <AuthShell
      subtitle={copy.register.subtitle}
      homeHref={`/${locale}`}
      homeLabel={copy.backHome}
    >
      <form onSubmit={submit} className="space-y-4" lang={locale}>
        <p className="text-center text-sm text-slate-600">{copy.register.intro}</p>
        <label className="relative block">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={name}
            onChange={(event) => {
              event.currentTarget.setCustomValidity('');
              setName(event.target.value);
            }}
            onInvalid={(event) => applyRequiredValidity(event, locale)}
            placeholder={copy.register.name}
            className="pl-10"
            autoComplete="name"
          />
        </label>
        <label className="relative block">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="email"
            value={email}
            onChange={(event) => {
              event.currentTarget.setCustomValidity('');
              setEmail(event.target.value);
            }}
            onInvalid={(event) => applyRequiredValidity(event, locale)}
            placeholder={copy.email}
            className="pl-10"
            autoComplete="email"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
            {copy.register.password}
          </span>
          <span className="relative block">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              value={password}
              onChange={(event) => {
                event.currentTarget.setCustomValidity('');
                setPassword(event.target.value);
              }}
              onInvalid={(event) => applyRequiredValidity(event, locale)}
              placeholder={copy.register.passwordPlaceholder}
              className="pl-10"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </span>
        </label>
        <PasswordStrength password={password} locale={locale} />
        <TurnstileWidget onToken={setTurnstileToken} language={turnstileLanguage(locale)} />
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={(Boolean(password) && !strength.valid) || !turnstileToken}
        >
          {loading ? copy.register.loading : copy.register.submit}
        </Button>
        <p className="text-center text-sm text-slate-600">
          {copy.register.hasAccount}{' '}
          <Link
            href={`/${locale}/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-sky-700 hover:text-sky-800"
          >
            {copy.register.signIn}
          </Link>
        </p>
      </form>
    </AuthShell>
    </>
  );
}
