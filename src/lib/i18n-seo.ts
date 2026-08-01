import type { Metadata } from 'next';
import { isStagingEnv, stagingRobots } from '@/lib/app-env';
import type { InternationalLocale } from '@/lib/i18n';
import { isPublicIndexablePath } from '@/lib/seo/public-indexable-path';

const descriptionOverrides: Record<InternationalLocale, Record<string, string>> = {
  en: {
    about: 'Learn how Resolva Jato creates practical online tools for documents, independent professionals, students and small businesses.',
    contact: 'Contact Resolva Jato for product support, security reports, privacy requests, corrections or questions about our online tools.',
    terms: 'Read the rules, responsibilities and acceptable-use conditions for accounts, documents and online tools provided by Resolva Jato.',
    privacy: 'Understand what personal data Resolva Jato collects, why it is processed and how to request access, correction or deletion.',
    'tools/email-signature': 'Create a professional email signature with contact details, social links and a clean layout ready to copy and use.',
    'tools/delivery-schedule': 'Build a delivery schedule with milestones, owners and deadlines to organize projects and monitor progress online.',
    'tools/bill-splitter': 'Split a shared bill fairly, calculate each participant’s amount and organize payments quickly in your browser.',
    'tools/study-schedule': 'Create a practical study schedule with subjects, priorities and available time to organize your learning routine.',
    'tools/background-remover': 'Remove image backgrounds online and prepare clean visual assets for documents, products and presentations.',
    'tools/pdf-editor': 'Edit PDF files online to organize document pages and complete everyday tasks directly in your browser.',
    'tools/enem-essay': 'Review an ENEM-style essay with structured criteria and identify opportunities to improve clarity and argumentation.',
    'tools/abnt-references': 'Format academic references with organized bibliographic data for books, websites, articles and other sources.',
    'tools/lattes-cv': 'Create and organize an academic Lattes-style CV with education, publications, projects and professional experience.'
  },
  es: {
    about: 'Conoce cómo Resolva Jato crea herramientas prácticas para documentos, profesionales independientes, estudiantes y pequeñas empresas.',
    contact: 'Contacta con Resolva Jato para soporte, seguridad, privacidad, correcciones o preguntas sobre nuestras herramientas en línea.',
    terms: 'Consulta las reglas, responsabilidades y condiciones de uso de cuentas, documentos y herramientas ofrecidas por Resolva Jato.',
    privacy: 'Conoce qué datos personales recopila Resolva Jato, por qué los trata y cómo solicitar acceso, corrección o eliminación.',
    'tools/receipt': 'Crea un recibo profesional con pagador, beneficiario, importe, concepto y fecha, listo para exportar y compartir.',
    'tools/email-signature': 'Crea una firma de correo profesional con datos de contacto, enlaces sociales y un diseño limpio listo para usar.',
    'tools/delivery-schedule': 'Crea un cronograma de entregas con etapas, responsables y fechas para organizar proyectos y seguir su avance.',
    'tools/bill-splitter': 'Divide una cuenta compartida, calcula el importe de cada participante y organiza los pagos desde el navegador.',
    'tools/study-schedule': 'Crea un cronograma de estudio con materias, prioridades y tiempo disponible para organizar mejor tu aprendizaje.',
    'tools/background-remover': 'Elimina el fondo de imágenes en línea y prepara recursos visuales limpios para documentos y presentaciones.',
    'tools/pdf-editor': 'Edita archivos PDF en línea para organizar páginas y completar tareas cotidianas directamente en el navegador.',
    'tools/mei-vs-employment': 'Compara escenarios de trabajo independiente y empleo considerando ingresos, costes, beneficios y riesgos.',
    'tools/abnt-references': 'Formatea referencias académicas con datos organizados de libros, sitios web, artículos y otras fuentes.',
    'tools/lattes-cv': 'Crea y organiza un currículum académico estilo Lattes con formación, publicaciones, proyectos y experiencia.'
  }
};

export function internationalSeo(
  locale: InternationalLocale,
  internationalPath: string,
  portuguesePath: string
): Pick<Metadata, 'alternates' | 'robots' | 'openGraph' | 'twitter' | 'description'> {
  const suffix = internationalPath ? `/${internationalPath.replace(/^\/+/, '')}` : '';
  const socialImage = `/${locale}/opengraph-image`;
  const includeHreflang = isPublicIndexablePath(portuguesePath);

  return {
    ...(descriptionOverrides[locale][internationalPath]
      ? { description: descriptionOverrides[locale][internationalPath] }
      : {}),
    alternates: {
      canonical: `/${locale}${suffix}`,
      ...(includeHreflang
        ? {
            languages: {
              'pt-BR': portuguesePath,
              en: `/en${suffix}`,
              es: `/es${suffix}`,
              'x-default': portuguesePath
            }
          }
        : {})
    },
    // Sem landing PT pública: não indexar EN/ES órfãs (fora do sitemap / sem hreflang).
    robots: isStagingEnv()
      ? stagingRobots()
      : includeHreflang
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      locale: locale === 'en' ? 'en_US' : 'es_ES',
      alternateLocale: ['pt_BR', locale === 'en' ? 'es_ES' : 'en_US'],
      type: 'website',
      url: `/${locale}${suffix}`,
      siteName: 'Resolva Jato',
      images: [{ url: socialImage, width: 1200, height: 630 }]
    },
    twitter: {
      card: 'summary_large_image',
      images: [socialImage]
    }
  };
}
