import { describe, expect, it } from 'vitest';
import { isPublicIndexablePath } from './public-indexable-path';

describe('isPublicIndexablePath', () => {
  it('aceita landings públicas', () => {
    expect(isPublicIndexablePath('/gerador-de-recibo')).toBe(true);
    expect(isPublicIndexablePath('/mei-ou-clt')).toBe(true);
    expect(isPublicIndexablePath('/')).toBe(true);
  });

  it('rejeita áreas privadas ou noindex', () => {
    expect(isPublicIndexablePath('/ferramentas/pix')).toBe(false);
    expect(isPublicIndexablePath('/busca')).toBe(false);
    expect(isPublicIndexablePath('/conta')).toBe(false);
    expect(isPublicIndexablePath('/login')).toBe(false);
  });
});
