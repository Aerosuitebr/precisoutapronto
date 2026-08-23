import { expect, test } from '@playwright/test';
import { parseTestimonialSubmission, TESTIMONIAL_CONSENT_VERSION } from '../src/lib/testimonials/contracts';

const valid = {
  publicName: 'Ana Souza', profession: 'Designer', city: 'Recife', state: 'pe',
  toolKey: 'orcamento', quote: 'Montei o orçamento, enviei ao cliente e recebi a aprovação no mesmo dia.',
  consent: true, consentVersion: TESTIMONIAL_CONSENT_VERSION
};

test('testimonial requires explicit versioned publication consent', () => {
  expect(parseTestimonialSubmission({ ...valid, consent: false })).toBeNull();
  expect(parseTestimonialSubmission({ ...valid, consentVersion: 'old' })).toBeNull();
  expect(parseTestimonialSubmission(valid)).toMatchObject({ state: 'PE', toolKey: 'orcamento' });
});

test('testimonial rejects unknown tools and low-information stories', () => {
  expect(parseTestimonialSubmission({ ...valid, toolKey: 'admin' })).toBeNull();
  expect(parseTestimonialSubmission({ ...valid, quote: 'Muito bom.' })).toBeNull();
});
