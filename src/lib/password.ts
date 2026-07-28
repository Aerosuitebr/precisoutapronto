export interface PasswordRule {
  id: string;
  label: string;
  ok: boolean;
}

export interface PasswordStrengthResult {
  valid: boolean;
  score: number;
  maxScore: number;
  level: 'vazia' | 'fraca' | 'media' | 'forte';
  label: string;
  rules: PasswordRule[];
  firstError: string | null;
}

export type PasswordLocale = 'pt-BR' | 'en' | 'es';

const SPECIAL_CHAR = /[^A-Za-z0-9]/;

const copy: Record<
  PasswordLocale,
  {
    strengthTitle: string;
    empty: string;
    emptyError: string;
    weak: string;
    medium: string;
    strong: string;
    needsPrefix: string;
    assertFallback: string;
    rules: Record<string, string>;
  }
> = {
  'pt-BR': {
    strengthTitle: 'Força da senha',
    empty: 'Digite uma senha',
    emptyError: 'Informe uma senha.',
    weak: 'Senha fraca',
    medium: 'Senha média',
    strong: 'Senha forte',
    needsPrefix: 'A senha precisa ter:',
    assertFallback: 'A senha não atende aos requisitos de segurança.',
    rules: {
      length: 'Pelo menos 8 caracteres',
      upper: 'Uma letra maiúscula',
      lower: 'Uma letra minúscula',
      number: 'Um número',
      special: 'Um caractere especial (ex.: !@#$%)',
      sequence: 'Sem letras ou números em sequência (ex.: abc, 123)'
    }
  },
  en: {
    strengthTitle: 'Password strength',
    empty: 'Enter a password',
    emptyError: 'Please enter a password.',
    weak: 'Weak password',
    medium: 'Medium password',
    strong: 'Strong password',
    needsPrefix: 'Your password needs:',
    assertFallback: 'The password does not meet the security requirements.',
    rules: {
      length: 'At least 8 characters',
      upper: 'One uppercase letter',
      lower: 'One lowercase letter',
      number: 'One number',
      special: 'One special character (e.g. !@#$%)',
      sequence: 'No sequential letters or numbers (e.g. abc, 123)'
    }
  },
  es: {
    strengthTitle: 'Fortaleza de la contraseña',
    empty: 'Escribe una contraseña',
    emptyError: 'Ingresa una contraseña.',
    weak: 'Contraseña débil',
    medium: 'Contraseña media',
    strong: 'Contraseña fuerte',
    needsPrefix: 'La contraseña necesita:',
    assertFallback: 'La contraseña no cumple los requisitos de seguridad.',
    rules: {
      length: 'Al menos 8 caracteres',
      upper: 'Una letra mayúscula',
      lower: 'Una letra minúscula',
      number: 'Un número',
      special: 'Un carácter especial (ej.: !@#$%)',
      sequence: 'Sin letras o números en secuencia (ej.: abc, 123)'
    }
  }
};

/** Detecta 3+ letras ou dígitos em sequência crescente ou decrescente (ex.: abc, 321). */
export function hasSequentialRun(value: string, runLength = 3): boolean {
  const text = value.toLowerCase();
  if (text.length < runLength) return false;

  for (let i = 0; i <= text.length - runLength; i += 1) {
    const slice = text.slice(i, i + runLength);
    const onlyLetters = /^[a-z]+$/.test(slice);
    const onlyDigits = /^\d+$/.test(slice);
    if (!onlyLetters && !onlyDigits) continue;

    let ascending = true;
    let descending = true;
    for (let j = 1; j < slice.length; j += 1) {
      const prev = slice.charCodeAt(j - 1);
      const curr = slice.charCodeAt(j);
      if (curr !== prev + 1) ascending = false;
      if (curr !== prev - 1) descending = false;
    }
    if (ascending || descending) return true;
  }

  return false;
}

export function getPasswordStrengthTitle(locale: PasswordLocale = 'pt-BR') {
  return copy[locale].strengthTitle;
}

export function evaluatePasswordStrength(
  password: string,
  locale: PasswordLocale = 'pt-BR'
): PasswordStrengthResult {
  const t = copy[locale];
  const value = password;
  const rules: PasswordRule[] = [
    { id: 'length', label: t.rules.length, ok: value.length >= 8 },
    { id: 'upper', label: t.rules.upper, ok: /[A-Z]/.test(value) },
    { id: 'lower', label: t.rules.lower, ok: /[a-z]/.test(value) },
    { id: 'number', label: t.rules.number, ok: /\d/.test(value) },
    { id: 'special', label: t.rules.special, ok: SPECIAL_CHAR.test(value) },
    {
      id: 'sequence',
      label: t.rules.sequence,
      ok: value.length === 0 ? false : !hasSequentialRun(value)
    }
  ];

  if (!value) {
    return {
      valid: false,
      score: 0,
      maxScore: rules.length,
      level: 'vazia',
      label: t.empty,
      rules: rules.map((rule) => ({ ...rule, ok: false })),
      firstError: t.emptyError
    };
  }

  const score = rules.filter((rule) => rule.ok).length;
  const valid = score === rules.length;
  const failed = rules.find((rule) => !rule.ok);

  let level: PasswordStrengthResult['level'] = 'fraca';
  let label = t.weak;
  if (score >= rules.length) {
    level = 'forte';
    label = t.strong;
  } else if (score >= 4) {
    level = 'media';
    label = t.medium;
  }

  return {
    valid,
    score,
    maxScore: rules.length,
    level,
    label,
    rules,
    firstError: failed ? `${t.needsPrefix} ${failed.label.toLowerCase()}.` : null
  };
}

export function assertStrongPassword(password: string, locale: PasswordLocale = 'pt-BR') {
  const result = evaluatePasswordStrength(password, locale);
  if (!result.valid) {
    throw new Error(result.firstError || copy[locale].assertFallback);
  }
  return result;
}
