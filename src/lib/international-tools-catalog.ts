import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Briefcase,
  Calculator,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  FileStack,
  FileText,
  FileArchive,
  Images,
  Gavel,
  GraduationCap,
  ImageOff,
  Mail,
  PenLine,
  Receipt,
  Scale,
  Search,
  Sparkles,
  Users,
  Wallet
} from 'lucide-react';
import type { InternationalLocale } from '@/lib/i18n';

export type InternationalToolSlug =
  | 'quote-pix'
  | 'pix'
  | 'proposal'
  | 'receipt'
  | 'freelance-pricing'
  | 'service-contract'
  | 'legal-documents'
  | 'accounting-documents'
  | 'severance'
  | 'resume'
  | 'academic-cover'
  | 'agenda'
  | 'resource-search'
  | 'email-signature'
  | 'delivery-schedule'
  | 'bill-splitter'
  | 'study-schedule'
  | 'background-remover'
  | 'pdf-editor'
  | 'merge-pdf'
  | 'split-pdf'
  | 'compress-pdf'
  | 'image-optimizer'
  | 'image-converter'
  | 'mei-vs-employment'
  | 'enem-essay'
  | 'abnt-references'
  | 'lattes-cv';

export interface InternationalToolDefinition {
  slug: InternationalToolSlug;
  /** Canonical PT path for hreflang / LocaleSwitcher */
  ptPath: string;
  icon: LucideIcon;
  category: 'business' | 'legal' | 'career' | 'utilities' | 'brazil';
  /** Brazil-specific tools stay available in EN/ES UI but labeled clearly. */
  brazilOnly?: boolean;
  en: { name: string; description: string };
  es: { name: string; description: string };
}

export const INTERNATIONAL_TOOLS: InternationalToolDefinition[] = [
  {
    slug: 'quote-pix',
    ptPath: '/orcamento-com-pix',
    icon: ClipboardList,
    category: 'business',
    en: {
      name: 'Quote + client approval',
      description: 'Send a mobile approval link before collecting payment.'
    },
    es: {
      name: 'Presupuesto + aprobación',
      description: 'Envía un enlace para que el cliente apruebe desde su celular.'
    }
  },
  {
    slug: 'pix',
    ptPath: '/gerador-de-qr-code-pix',
    icon: Wallet,
    category: 'business',
    en: {
      name: 'Pix payment',
      description: 'Generate a QR code and copy-and-paste Pix payment code.'
    },
    es: {
      name: 'Cobro con Pix',
      description: 'Genera un código QR y un código Pix para copiar y pegar.'
    }
  },
  {
    slug: 'proposal',
    ptPath: '/gerador-de-proposta-comercial',
    icon: FileText,
    category: 'business',
    en: {
      name: 'Business proposal',
      description: 'Present scope, pricing and terms with an agency-style PDF.'
    },
    es: {
      name: 'Propuesta comercial',
      description: 'Presenta alcance, precios y condiciones con un PDF profesional.'
    }
  },
  {
    slug: 'receipt',
    ptPath: '/gerador-de-recibo',
    icon: Receipt,
    category: 'business',
    en: {
      name: 'Receipt',
      description: 'Create a receipt with the amount written out automatically.'
    },
    es: {
      name: 'Recibo',
      description: 'Crea un recibo con el valor escrito automáticamente.'
    }
  },
  {
    slug: 'freelance-pricing',
    ptPath: '/calculadora-de-preco-freelancer',
    icon: Calculator,
    category: 'business',
    en: {
      name: 'Freelance pricing',
      description: 'Calculate an hourly rate and a sustainable project price.'
    },
    es: {
      name: 'Precio para freelancers',
      description: 'Calcula una tarifa por hora y un precio sostenible por proyecto.'
    }
  },
  {
    slug: 'email-signature',
    ptPath: '/ferramentas/assinatura-email',
    icon: Mail,
    category: 'business',
    en: {
      name: 'Email signature',
      description: 'Build a professional signature ready to paste into Gmail or Outlook.'
    },
    es: {
      name: 'Firma de correo',
      description: 'Crea una firma profesional lista para pegar en Gmail u Outlook.'
    }
  },
  {
    slug: 'delivery-schedule',
    ptPath: '/ferramentas/cronograma-entregas',
    icon: CalendarRange,
    category: 'business',
    en: {
      name: 'Delivery schedule',
      description: 'Plan project stages and export a visual timeline for clients.'
    },
    es: {
      name: 'Cronograma de entregas',
      description: 'Planifica etapas del proyecto y exporta una línea de tiempo visual.'
    }
  },
  {
    slug: 'service-contract',
    ptPath: '/gerador-de-contrato',
    icon: Scale,
    category: 'legal',
    en: {
      name: 'Service contract',
      description: 'Editable service agreement template ready for PDF export.'
    },
    es: {
      name: 'Contrato de servicio',
      description: 'Modelo editable de contrato de servicios listo para PDF.'
    }
  },
  {
    slug: 'legal-documents',
    ptPath: '/documentos-juridicos-online',
    icon: Gavel,
    category: 'legal',
    en: {
      name: 'Legal documents',
      description: 'Powers of attorney, notices and practical legal templates.'
    },
    es: {
      name: 'Documentos jurídicos',
      description: 'Poderes, notificaciones y modelos jurídicos prácticos.'
    }
  },
  {
    slug: 'accounting-documents',
    ptPath: '/documentos-contabeis-online',
    icon: Calculator,
    category: 'legal',
    en: {
      name: 'Accounting documents',
      description: 'Tax and administrative documents for daily operations.'
    },
    es: {
      name: 'Documentos contables',
      description: 'Documentos fiscales y administrativos para la rutina diaria.'
    }
  },
  {
    slug: 'severance',
    ptPath: '/calculadora-de-rescisao',
    icon: Calculator,
    category: 'legal',
    brazilOnly: true,
    en: {
      name: 'Termination calculator (Brazil)',
      description: 'Estimate salary balance, vacation and Brazilian severance amounts.'
    },
    es: {
      name: 'Calculadora de liquidación (Brasil)',
      description: 'Estima saldo salarial, vacaciones e indemnizaciones de Brasil.'
    }
  },
  {
    slug: 'resume',
    ptPath: '/gerador-de-curriculo',
    icon: GraduationCap,
    category: 'career',
    en: {
      name: 'Professional résumé',
      description: 'Build a clear résumé and export it as a PDF.'
    },
    es: {
      name: 'Currículum profesional',
      description: 'Crea un currículum claro y expórtalo en PDF.'
    }
  },
  {
    slug: 'academic-cover',
    ptPath: '/ferramentas/trabalhos',
    icon: BookOpen,
    category: 'career',
    en: {
      name: 'Academic cover page',
      description: 'Create school and university cover pages with ABNT-style layout.'
    },
    es: {
      name: 'Portada académica',
      description: 'Crea portadas escolares y universitarias con estilo ABNT.'
    }
  },
  {
    slug: 'agenda',
    ptPath: '/agenda-online',
    icon: CalendarDays,
    category: 'career',
    en: {
      name: 'Agenda',
      description: 'Organize appointments, reminders and weekly deadlines.'
    },
    es: {
      name: 'Agenda',
      description: 'Organiza compromisos, recordatorios y plazos semanales.'
    }
  },
  {
    slug: 'study-schedule',
    ptPath: '/ferramentas/cronograma-estudos',
    icon: BookOpen,
    category: 'career',
    en: {
      name: 'Study schedule',
      description: 'Distribute subjects across available study days and weeks.'
    },
    es: {
      name: 'Cronograma de estudios',
      description: 'Distribuye materias en los días y semanas disponibles.'
    }
  },
  {
    slug: 'resource-search',
    ptPath: '/busca',
    icon: Search,
    category: 'utilities',
    en: {
      name: 'Free resource search',
      description: 'Browse a curated collection of useful links.'
    },
    es: {
      name: 'Buscador de recursos',
      description: 'Explora una selección de enlaces útiles y gratuitos.'
    }
  },
  {
    slug: 'bill-splitter',
    ptPath: '/divisor-de-conta',
    icon: Users,
    category: 'utilities',
    en: {
      name: 'Bill splitter',
      description: 'Split a shared bill with tip and optional extras per person.'
    },
    es: {
      name: 'Divisor de cuenta',
      description: 'Divide una cuenta compartida con propina y extras por persona.'
    }
  },
  {
    slug: 'background-remover',
    ptPath: '/remover-fundo-de-imagem',
    icon: ImageOff,
    category: 'utilities',
    en: {
      name: 'Background remover',
      description: 'Remove image backgrounds in the browser and download a PNG.'
    },
    es: {
      name: 'Quitar fondo',
      description: 'Quita el fondo de una imagen en el navegador y descarga un PNG.'
    }
  },
  {
    slug: 'pdf-editor',
    ptPath: '/editor-de-pdf-online',
    icon: FileStack,
    category: 'utilities',
    en: {
      name: 'PDF editor',
      description: 'Merge, reorder, rotate and annotate PDF pages in the browser.'
    },
    es: {
      name: 'Editor de PDF',
      description: 'Une, reordena, rota y anota páginas PDF en el navegador.'
    }
  },
  {
    slug: 'merge-pdf',
    ptPath: '/juntar-pdf-online',
    icon: FileStack,
    category: 'utilities',
    en: { name: 'Merge PDF', description: 'Combine PDF files locally while preserving page size and order.' },
    es: { name: 'Unir PDF', description: 'Combina archivos PDF localmente conservando el tamaño y el orden.' }
  },
  {
    slug: 'split-pdf',
    ptPath: '/dividir-pdf-online',
    icon: FileStack,
    category: 'utilities',
    en: { name: 'Split PDF', description: 'Extract selected pages into a new PDF without uploading files.' },
    es: { name: 'Dividir PDF', description: 'Extrae páginas seleccionadas en un PDF nuevo sin subir archivos.' }
  },
  {
    slug: 'compress-pdf',
    ptPath: '/comprimir-pdf-online',
    icon: FileArchive,
    category: 'utilities',
    en: { name: 'Compress PDF', description: 'Choose safe optimization or stronger compression for scanned PDFs.' },
    es: { name: 'Comprimir PDF', description: 'Elige optimización segura o compresión intensa para PDF escaneados.' }
  },
  {
    slug: 'image-optimizer',
    ptPath: '/comprimir-redimensionar-imagem',
    icon: Images,
    category: 'utilities',
    en: { name: 'Compress and resize image', description: 'Control image dimensions, format and quality directly in the browser.' },
    es: { name: 'Comprimir y redimensionar imagen', description: 'Controla dimensiones, formato y calidad directamente en el navegador.' }
  },
  {
    slug: 'image-converter',
    ptPath: '/converter-imagem-online',
    icon: Images,
    category: 'utilities',
    en: { name: 'Image converter', description: 'Convert JPG, PNG and WebP images, including image-to-PDF output.' },
    es: { name: 'Convertidor de imágenes', description: 'Convierte JPG, PNG y WebP, incluso de imagen a PDF.' }
  },
  {
    slug: 'mei-vs-employment',
    ptPath: '/mei-ou-clt',
    icon: Briefcase,
    category: 'brazil',
    brazilOnly: true,
    en: {
      name: 'MEI vs employment (Brazil)',
      description: 'Compare Brazilian MEI self-employment with formal CLT employment costs.'
    },
    es: {
      name: 'MEI vs empleo (Brasil)',
      description: 'Compara el régimen MEI brasileño con el empleo formal CLT.'
    }
  },
  {
    slug: 'enem-essay',
    ptPath: '/corretor-de-redacao-enem',
    icon: PenLine,
    category: 'brazil',
    brazilOnly: true,
    en: {
      name: 'ENEM essay helper (Brazil)',
      description: 'Practice Brazilian ENEM essay structure with competency feedback.'
    },
    es: {
      name: 'Redacción ENEM (Brasil)',
      description: 'Practica la estructura de redacción ENEM con comentarios por competencia.'
    }
  },
  {
    slug: 'abnt-references',
    ptPath: '/gerador-de-referencias-abnt',
    icon: BookOpen,
    category: 'brazil',
    brazilOnly: true,
    en: {
      name: 'ABNT references (Brazil)',
      description: 'Format bibliographic references using Brazilian ABNT rules.'
    },
    es: {
      name: 'Referencias ABNT (Brasil)',
      description: 'Formatea referencias bibliográficas con las reglas ABNT de Brasil.'
    }
  },
  {
    slug: 'lattes-cv',
    ptPath: '/ferramentas/curriculo-lattes',
    icon: GraduationCap,
    category: 'brazil',
    brazilOnly: true,
    en: {
      name: 'Lattes CV helper (Brazil)',
      description: 'Organize academic profile data for the Brazilian Lattes platform.'
    },
    es: {
      name: 'Currículum Lattes (Brasil)',
      description: 'Organiza datos académicos para la plataforma Lattes de Brasil.'
    }
  }
];

const categoryMeta = {
  en: {
    business: {
      title: 'Business and payments',
      description: 'Quotes, Pix payments, proposals and receipts.',
      icon: Briefcase
    },
    legal: {
      title: 'Legal and accounting',
      description: 'Everyday documents for service providers and small offices.',
      icon: Gavel
    },
    career: {
      title: 'Career and organization',
      description: 'Documents and resources for work, study and deadlines.',
      icon: GraduationCap
    },
    utilities: {
      title: 'Utilities',
      description: 'Everyday helpers for files, images and shared expenses.',
      icon: Sparkles
    },
    brazil: {
      title: 'Brazil-specific',
      description: 'Tools for Brazilian standards, exams and labor rules. UI available in English.',
      icon: Scale
    }
  },
  es: {
    business: {
      title: 'Negocios y cobros',
      description: 'Presupuestos, Pix, propuestas y recibos.',
      icon: Briefcase
    },
    legal: {
      title: 'Jurídico y contabilidad',
      description: 'Documentos cotidianos para profesionales y pequeños despachos.',
      icon: Gavel
    },
    career: {
      title: 'Carrera y organización',
      description: 'Documentos y recursos para trabajar, estudiar y cumplir plazos.',
      icon: GraduationCap
    },
    utilities: {
      title: 'Utilidades',
      description: 'Ayudas diarias para archivos, imágenes y gastos compartidos.',
      icon: Sparkles
    },
    brazil: {
      title: 'Específicas de Brasil',
      description: 'Herramientas para normas, exámenes y reglas laborales de Brasil. Interfaz en español.',
      icon: Scale
    }
  }
} as const;

export function internationalToolHref(locale: InternationalLocale, slug: InternationalToolSlug) {
  return `/${locale}/tools/${slug}`;
}

export function listInternationalToolsByCategory(locale: InternationalLocale) {
  const order: Array<InternationalToolDefinition['category']> = [
    'business',
    'legal',
    'career',
    'utilities',
    'brazil'
  ];
  return order.map((category) => ({
    category,
    ...categoryMeta[locale][category],
    tools: INTERNATIONAL_TOOLS.filter((tool) => tool.category === category).map((tool) => ({
      ...tool,
      name: tool[locale].name,
      description: tool[locale].description,
      href: internationalToolHref(locale, tool.slug)
    }))
  }));
}

export function findInternationalTool(slug: string) {
  return INTERNATIONAL_TOOLS.find((tool) => tool.slug === slug) || null;
}
