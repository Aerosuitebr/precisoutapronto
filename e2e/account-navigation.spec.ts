import { expect, test } from '@playwright/test';
import { ACCOUNT_SECTIONS } from '../src/lib/account-sections';
import { menuSections } from '../src/lib/menu-config';

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

test('menu global oferece acesso direto aos compartilhamentos', () => {
  const accountMenu = menuSections.find((section) => section.id === 'conta');
  expect(accountMenu?.items.some((item) =>
    item.id === 'meus-compartilhamentos' &&
    item.href === '/conta#compartilhamentos'
  )).toBe(true);
});
