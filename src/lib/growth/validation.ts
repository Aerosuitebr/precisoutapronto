import { intentPages } from '@/lib/growth/intents';
import { growthSegments } from '@/lib/growth/segments';

export function validateGrowthContent() {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const segmentSlugs = new Set(growthSegments.map((segment) => segment.slug));

  for (const page of intentPages) {
    if (slugs.has(page.slug)) errors.push(`Intent slug duplicado: ${page.slug}`);
    slugs.add(page.slug);
    if (page.steps.length < 3) errors.push(`Intent sem passos suficientes: ${page.slug}`);
    if (page.faqs.length < 2) errors.push(`Intent sem FAQs suficientes: ${page.slug}`);
    if (!page.toolHref.startsWith('/')) errors.push(`CTA inválido: ${page.slug}`);
    for (const segmentSlug of page.segmentSlugs) {
      if (!segmentSlugs.has(segmentSlug)) errors.push(`Segmento inválido em ${page.slug}: ${segmentSlug}`);
    }
  }

  for (const segment of growthSegments) {
    for (const slug of segment.intents) {
      if (!slugs.has(slug)) errors.push(`Intent ausente em ${segment.slug}: ${slug}`);
    }
  }

  return errors;
}
