import test from 'node:test';
import assert from 'node:assert/strict';
import { pageSegment, normalizePath, eventCount } from './report-segments.mjs';

test('utilitários não entram no comercial e recibo PDF permanece comercial', () => {
  for (const url of ['/en/tools/receipt-generator', '/games/ferramentas/meu-pc-roda', '/comprimir-pdf-online']) {
    assert.notEqual(pageSegment(url), 'Comercial');
  }
  for (const url of ['/recibos/recibo-em-pdf', '/recibos/recibo-pagamento-pix', '/orcamento-para/chaveiro', '/guias/como-registrar-sinal-e-saldo-pix']) {
    assert.equal(pageSegment(url), 'Comercial');
  }
  assert.equal(pageSegment('/corretor-de-redacao-enem'), 'Outros — fora do comercial');
});

test('normalização retira query e não atribui dados ausentes à home', () => {
  assert.equal(normalizePath('https://precisoutapronto.com.br/orcamento-com-pix/?utm_source=test'), '/orcamento-com-pix');
  assert.equal(normalizePath(''), '');
  assert.equal(normalizePath('(not set)'), '');
});

test('contagem aceita inteiros nas duas localidades e rejeita dado ausente', () => {
  assert.equal(eventCount('1,234'), 1234);
  assert.equal(eventCount('1.234'), 1234);
  assert.equal(eventCount('0'), 0);
  assert.equal(eventCount('n/d'), null);
  assert.equal(eventCount(''), null);
});
