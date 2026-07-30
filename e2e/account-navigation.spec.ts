import { expect, test } from '@playwright/test';
import { ACCOUNT_SECTIONS } from '../src/lib/account-sections';

test('atalhos da conta usam âncoras únicas e permanentes', () => {
  expect(ACCOUNT_SECTIONS.map((section) => section.id)).toEqual([
    'documentos',
    'compartilhamentos',
    'perfil',
    'indicacoes'
  ]);
  expect(new Set(ACCOUNT_SECTIONS.map((section) => section.id)).size).toBe(ACCOUNT_SECTIONS.length);
  for (const section of ACCOUNT_SECTIONS) {
    expect(section.href).toBe(`/conta#${section.id}`);
    expect(section.label.trim()).not.toBe('');
    expect(section.description.trim()).not.toBe('');
  }
});
