import Link from 'next/link';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { TESTIMONIAL_CONSENT_VERSION } from '@/lib/testimonials/contracts';

export async function ApprovedServiceStories() {
  if (!isDatabaseConfigured()) return null;
  const stories = await getPrisma().testimonialSubmission.findMany({
    where: { status: 'approved', reviewedAt: { not: null }, consentVersion: TESTIMONIAL_CONSENT_VERSION, toolKey: { in: ['orcamento', 'pix', 'recibo'] } },
    orderBy: { reviewedAt: 'desc' }, take: 3,
    select: { id: true, publicName: true, profession: true, quote: true }
  }).catch(() => []);
  if (!stories.length) return null;
  return <section className="mx-auto max-w-6xl px-4 py-12" aria-label="Experiências de prestadores">
    <h2 className="text-3xl font-black">Como prestadores usam no dia a dia</h2>
    <p className="mt-3 text-sm text-slate-600">Relatos enviados pelos usuários, revisados pela equipe e publicados com autorização. Resultados individuais não são garantia de resultado.</p>
    <ul className="mt-6 grid gap-5 md:grid-cols-3">{stories.map((story) => <li key={story.id} className="rounded-2xl border bg-white p-6"><blockquote className="leading-7">{story.quote}</blockquote><p className="mt-4 font-bold">{story.publicName}</p><p className="text-sm text-slate-600">{story.profession}</p></li>)}</ul>
    <Link href="/depoimentos" className="mt-5 inline-block font-bold text-emerald-800">Conte sua experiência</Link>
  </section>;
}
