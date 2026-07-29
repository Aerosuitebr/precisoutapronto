import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InternationalPlansPage } from '@/components/marketing/international-public-page';
import { isInternationalLocale } from '@/lib/i18n';
import { internationalSeo } from '@/lib/i18n-seo';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { locale } = await params; if (!isInternationalLocale(locale)) return {}; return { title: locale === 'en' ? 'Plans and pricing' : 'Planes y precios', ...internationalSeo(locale, 'plans', '/planos') }; }
export default async function Page({ params }: Props) { const { locale } = await params; if (!isInternationalLocale(locale)) notFound(); return <><script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} /><InternationalPlansPage locale={locale} /></>; }
