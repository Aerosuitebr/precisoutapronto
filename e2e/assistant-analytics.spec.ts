import { expect, test } from '@playwright/test';
import { assistantFunnelParams } from '../src/lib/assistant/analytics';

test('assistant telemetry contains only structural funnel data', () => {
  const params = assistantFunnelParams({
    type: 'contrato',
    step: 2.9,
    totalSteps: 3,
    provider: 'local',
    answers: { case: 'conteúdo privado' }
  } as Parameters<typeof assistantFunnelParams>[0] & { answers: Record<string, string> });

  expect(params).toEqual({
    document_type: 'contrato',
    step: 2,
    total_steps: 3,
    provider: 'local'
  });
  expect(JSON.stringify(params)).not.toContain('conteúdo privado');
});
