import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalAgenda } from '@/components/agenda/international-agenda';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) return {};
  return {
    title: locale === 'en' ? 'Agenda and appointments' : 'Agenda y compromisos',
    description:
      locale === 'en'
        ? 'Organize meetings, deliveries and deadlines in a secure synchronized agenda.'
        : 'Organiza reuniones, entregas y plazos en una agenda segura y sincronizada.',
    ...internationalSeo(locale, 'tools/agenda', '/ferramentas/agenda')
  };
}

export default async function AgendaPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isInternationalLocale(locale)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      <InternationalAgenda locale={locale} />
    </>
  );
}
