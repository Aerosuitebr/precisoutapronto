'use client';

import { ChangeEvent, forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, Bot, Check, ChevronLeft, ChevronRight, Download, FileSearch, GraduationCap, Loader2, Plus, RefreshCw, Sparkles, Trash2, Upload, Wand2 } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { DocumentExportShell } from '@/components/brand/document-export-shell';
import { ToolsWatermark } from '@/components/brand/tools-watermark';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useDocumentBranding } from '@/hooks/use-document-branding';
import { exportElementToPdf } from '@/lib/curriculo/pdf';
import { cn } from '@/lib/utils';
import { completion, createEntry, createLattesProfile, LATTES_STORAGE_KEY, validateProfile } from '@/lib/lattes/model';
import type { AcademicEntry, LattesProfile, LattesSectionId } from '@/lib/lattes/types';

type Locale = 'pt-BR' | 'en' | 'es';

const STEP_IDS = ['geral', 'formacao', 'bibliografica', 'redes', 'revisao'] as const;
type StepId = typeof STEP_IDS[number];

const SECTION_IDS: LattesSectionId[] = ['formacao', 'atuacao', 'pesquisa', 'projetos', 'bibliografica', 'tecnica', 'patentes', 'eventos', 'orientacoes', 'bancas', 'premios', 'inovacao', 'extensao', 'idiomas'];

interface SectionMeta { id: LattesSectionId; label: string; description: string }
interface EntryLabels {
  add: string;
  titleField: string;
  institutionField: string;
  startField: string;
  startPlaceholder: string;
  endField: string;
  endPlaceholder: string;
  identifierField: string;
  authorsField: string;
  descriptionField: string;
  remove: string;
  addFirst: string;
  addFirstHint: string;
}
interface PreviewLabels {
  eyebrowPrefix: string;
  namePlaceholder: string;
  summaryPlaceholder: string;
  dateRange: (start: string, end: string) => string;
}

const copy = {
  'pt-BR': {
    authTitle: 'Currículo Lattes Inteligente',
    authDescription: 'Crie sua conta gratuita para salvar e gerar seu currículo acadêmico.',
    headerTitle: 'Lattes Inteligente',
    headerBadge: 'Acadêmico',
    headerSubtitle: 'Organize sua trajetória com rigor acadêmico, revisão inteligente e versões prontas para cada oportunidade.',
    seeExampleBtn: 'Ver exemplo',
    generatePdfBtn: 'Gerar PDF premium',
    profileCompletionLabel: 'Completude do perfil',
    savingLabel: 'Salvando alterações',
    savedLabel: 'Salvo automaticamente',
    steps: {
      geral: { label: 'Identidade', hint: 'Dados gerais e resumo' },
      formacao: { label: 'Trajetória', hint: 'Formação e atuação' },
      bibliografica: { label: 'Produções', hint: 'Pesquisa e resultados' },
      redes: { label: 'Impacto', hint: 'Redes e indicadores' },
      revisao: { label: 'Revisão', hint: 'Validar e gerar' }
    } as Record<StepId, { label: string; hint: string }>,
    sections: {
      formacao: { label: 'Formação acadêmica', description: 'Graduação, especialização, mestrado, doutorado e pós-doutorado' },
      atuacao: { label: 'Atuação profissional', description: 'Vínculos, cargos, docência e pesquisa' },
      pesquisa: { label: 'Áreas e linhas de pesquisa', description: 'Áreas CNPq, subáreas, especialidades e palavras-chave' },
      projetos: { label: 'Projetos', description: 'Pesquisa, desenvolvimento, inovação e extensão' },
      bibliografica: { label: 'Produção bibliográfica', description: 'Artigos, livros, capítulos, trabalhos e resumos' },
      tecnica: { label: 'Produção técnica', description: 'Software, relatórios, consultorias, cursos e material didático' },
      patentes: { label: 'Patentes e registros', description: 'Depósitos, concessões e licenciamentos' },
      eventos: { label: 'Eventos', description: 'Participação, organização, palestras e mesas' },
      orientacoes: { label: 'Orientações', description: 'IC, TCC, mestrado, doutorado e pós-doutorado' },
      bancas: { label: 'Bancas', description: 'Qualificações, defesas e concursos' },
      premios: { label: 'Prêmios e títulos', description: 'Honrarias, menções e distinções' },
      inovacao: { label: 'Inovação', description: 'Produtos, startups, spin-offs e tecnologias' },
      extensao: { label: 'Extensão', description: 'Ações, projetos, cursos e eventos comunitários' },
      idiomas: { label: 'Idiomas', description: 'Compreensão, fala, leitura e escrita' }
    } as Record<LattesSectionId, { label: string; description: string }>,
    assistantTitle: 'Conte sua trajetória',
    assistantSubtitle: 'Ex.: “Concluí mestrado em Educação na UFF em 2021” ou “Publiquei um artigo em 2024”.',
    assistantPlaceholder: 'Escreva naturalmente…',
    assistantBtn: 'Interpretar',
    assistantStatus: (label: string) => `Registro sugerido em “${label}”. Revise os dados.`,
    assistantAutoDescription: 'Registro criado pelo assistente. Revise os campos antes da exportação.',
    identidadeTitle: 'Identidade acadêmica',
    identidadeSubtitle: 'Use dados fiéis aos documentos e identificadores acadêmicos.',
    fullNameLabel: 'Nome completo *',
    fullNamePlaceholder: 'Nome civil completo',
    citationNameLabel: 'Nome em citações',
    citationNamePlaceholder: 'SOBRENOME, N. N.',
    nationalityLabel: 'Nacionalidade',
    cityLabel: 'Cidade / UF',
    cityPlaceholder: 'Cidade, UF',
    emailLabel: 'E-mail acadêmico',
    orcidLabel: 'ORCID',
    orcidPlaceholder: '0000-0000-0000-0000',
    summaryLabel: 'Resumo acadêmico',
    summaryPlaceholder: 'Síntese da formação, atuação, temas de pesquisa e contribuições…',
    keywordsLabel: 'Palavras-chave',
    keywordsPlaceholder: 'Educação, Políticas públicas, Ciência de dados',
    entryLabels: {
      add: 'Adicionar',
      titleField: 'Título / atividade',
      institutionField: 'Instituição / veículo',
      startField: 'Início / ano',
      startPlaceholder: '2024',
      endField: 'Fim / situação',
      endPlaceholder: 'Atual',
      identifierField: 'DOI / ISBN / ISSN',
      authorsField: 'Autores',
      descriptionField: 'Descrição',
      remove: 'Remover registro',
      addFirst: 'Adicionar primeiro registro',
      addFirstHint: 'Você também pode usar o assistente acima.'
    } as EntryLabels,
    redesTitle: 'Redes e impacto',
    redesSubtitle: 'Consolide identificadores e métricas, sempre informando a fonte e data de consulta.',
    indicatorLabels: { articles: 'Artigos', citations: 'Citações', hIndex: 'Índice h', i10: 'Índice i10' },
    networkLabel: 'Rede acadêmica',
    networkPlaceholder: 'Cole uma URL de ORCID, Scholar, Scopus…',
    networkAddBtn: 'Adicionar',
    networkDefaultName: 'Perfil acadêmico',
    noNetworksText: 'Nenhuma rede adicionada.',
    revisaoTitle: 'Revisão final',
    revisaoPending: (n: number) => `${n} ponto(s) merecem atenção antes da geração.`,
    revisaoDone: 'Tudo pronto para gerar.',
    outputAcademico: 'Acadêmico premium',
    outputEdital: 'Versão para edital',
    outputConcurso: 'Versão para concurso',
    outputInternacional: 'Academic CV (English)',
    consistentTitle: 'Currículo consistente',
    consistentText: 'Nenhum problema foi identificado.',
    prevBtn: 'Anterior',
    stepLabel: (current: number, total: number) => `Etapa ${current} de ${total}`,
    continueBtn: 'Continuar',
    downloadPdfBtn: 'Baixar PDF',
    importTitle: 'Importar produção',
    importHint: 'Consulte DOI via Crossref ou vincule um ORCID. Dados importados sempre exigem revisão.',
    importPlaceholder: 'DOI ou ORCID',
    importBtn: 'Consultar',
    importErrorText: 'Não foi possível consultar agora. Verifique o DOI/ORCID ou preencha manualmente.',
    uploadTitle: 'Diplomas, certificados e artigos',
    uploadHint: 'PDF ou imagem · múltiplos arquivos',
    uploadDescription: (fileName: string) => `Documento “${fileName}” anexado para conferência. Extração assistida disponível quando o serviço de OCR for conectado.`,
    transparencyTitle: 'Transparência',
    transparencyText: 'Este módulo organiza dados compatíveis com o ecossistema acadêmico brasileiro, mas não possui integração oficial nem envia informações à Plataforma Lattes.',
    pdfErrorText: 'Não foi possível gerar o PDF. Tente novamente.',
    importedPublicationFallback: 'Publicação importada',
    crossrefDescription: 'Metadados obtidos via Crossref. Confirme antes de usar.',
    preview: {
      eyebrowPrefix: 'Currículo acadêmico',
      namePlaceholder: 'Seu nome completo',
      summaryPlaceholder: 'Seu resumo acadêmico aparecerá aqui.',
      dateRange: (start: string, end: string) => `${start}${end ? ` a ${end}` : ''}`
    } as PreviewLabels
  },
  en: {
    authTitle: 'Smart Academic CV (Lattes)',
    authDescription: 'Create your free account to save and generate your academic CV.',
    headerTitle: 'Smart Lattes',
    headerBadge: 'Academic',
    headerSubtitle: 'Organize your academic trajectory with rigor, smart review and versions ready for every opportunity, based on the Lattes CV format used across Brazilian academia.',
    seeExampleBtn: 'See example',
    generatePdfBtn: 'Generate premium PDF',
    profileCompletionLabel: 'Profile completeness',
    savingLabel: 'Saving changes',
    savedLabel: 'Saved automatically',
    steps: {
      geral: { label: 'Identity', hint: 'General data and summary' },
      formacao: { label: 'Trajectory', hint: 'Education and experience' },
      bibliografica: { label: 'Output', hint: 'Research and results' },
      redes: { label: 'Impact', hint: 'Networks and metrics' },
      revisao: { label: 'Review', hint: 'Validate and generate' }
    } as Record<StepId, { label: string; hint: string }>,
    sections: {
      formacao: { label: 'Academic education', description: 'Undergraduate, specialization, master, doctorate and postdoctoral studies' },
      atuacao: { label: 'Professional experience', description: 'Positions, roles, teaching and research' },
      pesquisa: { label: 'Research areas and lines', description: 'CNPq areas, subareas, specialties and keywords' },
      projetos: { label: 'Projects', description: 'Research, development, innovation and outreach' },
      bibliografica: { label: 'Bibliographic output', description: 'Articles, books, chapters, papers and abstracts' },
      tecnica: { label: 'Technical output', description: 'Software, reports, consulting, courses and teaching materials' },
      patentes: { label: 'Patents and registrations', description: 'Filings, grants and licensing' },
      eventos: { label: 'Events', description: 'Participation, organization, talks and panels' },
      orientacoes: { label: 'Advising', description: 'Undergraduate research, thesis, master and doctoral advising' },
      bancas: { label: 'Committees', description: 'Qualifying exams, defenses and academic panels' },
      premios: { label: 'Awards and honors', description: 'Honors, mentions and distinctions' },
      inovacao: { label: 'Innovation', description: 'Products, startups, spin-offs and technologies' },
      extensao: { label: 'Outreach', description: 'Community actions, projects, courses and events' },
      idiomas: { label: 'Languages', description: 'Understanding, speaking, reading and writing' }
    } as Record<LattesSectionId, { label: string; description: string }>,
    assistantTitle: 'Tell us about your trajectory',
    assistantSubtitle: 'Ex.: "I completed a master in Education at UFF in 2021" or "I published an article in 2024".',
    assistantPlaceholder: 'Write it naturally...',
    assistantBtn: 'Interpret',
    assistantStatus: (label: string) => `Entry suggested under "${label}". Review the data.`,
    assistantAutoDescription: 'Entry created by the assistant. Review the fields before exporting.',
    identidadeTitle: 'Academic identity',
    identidadeSubtitle: 'Use data that matches your documents and academic identifiers.',
    fullNameLabel: 'Full name *',
    fullNamePlaceholder: 'Full legal name',
    citationNameLabel: 'Citation name',
    citationNamePlaceholder: 'LAST NAME, F. M.',
    nationalityLabel: 'Nationality',
    cityLabel: 'City / State',
    cityPlaceholder: 'City, State',
    emailLabel: 'Academic email',
    orcidLabel: 'ORCID',
    orcidPlaceholder: '0000-0000-0000-0000',
    summaryLabel: 'Academic summary',
    summaryPlaceholder: 'Summary of education, experience, research topics and contributions...',
    keywordsLabel: 'Keywords',
    keywordsPlaceholder: 'Education, Public policy, Data science',
    entryLabels: {
      add: 'Add',
      titleField: 'Title / activity',
      institutionField: 'Institution / outlet',
      startField: 'Start / year',
      startPlaceholder: '2024',
      endField: 'End / status',
      endPlaceholder: 'Current',
      identifierField: 'DOI / ISBN / ISSN',
      authorsField: 'Authors',
      descriptionField: 'Description',
      remove: 'Remove entry',
      addFirst: 'Add first entry',
      addFirstHint: 'You can also use the assistant above.'
    } as EntryLabels,
    redesTitle: 'Networks and impact',
    redesSubtitle: 'Consolidate identifiers and metrics, always noting the source and consultation date.',
    indicatorLabels: { articles: 'Articles', citations: 'Citations', hIndex: 'H-index', i10: 'i10-index' },
    networkLabel: 'Academic network',
    networkPlaceholder: 'Paste an ORCID, Scholar or Scopus URL...',
    networkAddBtn: 'Add',
    networkDefaultName: 'Academic profile',
    noNetworksText: 'No network added yet.',
    revisaoTitle: 'Final review',
    revisaoPending: (n: number) => `${n} point(s) need attention before generating.`,
    revisaoDone: 'Everything is ready to generate.',
    outputAcademico: 'Premium academic',
    outputEdital: 'Version for public notices',
    outputConcurso: 'Version for public exams',
    outputInternacional: 'Academic CV (English)',
    consistentTitle: 'Consistent CV',
    consistentText: 'No issues were identified.',
    prevBtn: 'Previous',
    stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
    continueBtn: 'Continue',
    downloadPdfBtn: 'Download PDF',
    importTitle: 'Import output',
    importHint: 'Look up a DOI via Crossref or link an ORCID. Imported data always needs review.',
    importPlaceholder: 'DOI or ORCID',
    importBtn: 'Look up',
    importErrorText: 'Could not look it up right now. Check the DOI/ORCID or fill it in manually.',
    uploadTitle: 'Diplomas, certificates and papers',
    uploadHint: 'PDF or image · multiple files',
    uploadDescription: (fileName: string) => `Document "${fileName}" attached for review. Assisted extraction will be available once the OCR service is connected.`,
    transparencyTitle: 'Transparency',
    transparencyText: 'This module organizes data compatible with the Brazilian academic ecosystem (Lattes), but has no official integration and does not send information to the Lattes Platform.',
    pdfErrorText: 'Could not generate the PDF. Try again.',
    importedPublicationFallback: 'Imported publication',
    crossrefDescription: 'Metadata from Crossref. Confirm before using.',
    preview: {
      eyebrowPrefix: 'Academic CV',
      namePlaceholder: 'Your full name',
      summaryPlaceholder: 'Your academic summary will appear here.',
      dateRange: (start: string, end: string) => `${start}${end ? ` to ${end}` : ''}`
    } as PreviewLabels
  },
  es: {
    authTitle: 'Currículum Lattes Inteligente',
    authDescription: 'Crea tu cuenta gratuita para guardar y generar tu currículum académico.',
    headerTitle: 'Lattes Inteligente',
    headerBadge: 'Académico',
    headerSubtitle: 'Organiza tu trayectoria con rigor académico, revisión inteligente y versiones listas para cada oportunidad, basado en el formato de currículum Lattes usado en las plataformas académicas brasileñas.',
    seeExampleBtn: 'Ver ejemplo',
    generatePdfBtn: 'Generar PDF premium',
    profileCompletionLabel: 'Completitud del perfil',
    savingLabel: 'Guardando cambios',
    savedLabel: 'Guardado automáticamente',
    steps: {
      geral: { label: 'Identidad', hint: 'Datos generales y resumen' },
      formacao: { label: 'Trayectoria', hint: 'Formación y experiencia' },
      bibliografica: { label: 'Producción', hint: 'Investigación y resultados' },
      redes: { label: 'Impacto', hint: 'Redes e indicadores' },
      revisao: { label: 'Revisión', hint: 'Validar y generar' }
    } as Record<StepId, { label: string; hint: string }>,
    sections: {
      formacao: { label: 'Formación académica', description: 'Grado, especialización, maestría, doctorado y posdoctorado' },
      atuacao: { label: 'Experiencia profesional', description: 'Vínculos, cargos, docencia e investigación' },
      pesquisa: { label: 'Áreas y líneas de investigación', description: 'Áreas CNPq, subáreas, especialidades y palabras clave' },
      projetos: { label: 'Proyectos', description: 'Investigación, desarrollo, innovación y extensión' },
      bibliografica: { label: 'Producción bibliográfica', description: 'Artículos, libros, capítulos, trabajos y resúmenes' },
      tecnica: { label: 'Producción técnica', description: 'Software, informes, consultorías, cursos y material didáctico' },
      patentes: { label: 'Patentes y registros', description: 'Depósitos, concesiones y licencias' },
      eventos: { label: 'Eventos', description: 'Participación, organización, ponencias y mesas' },
      orientacoes: { label: 'Direcciones académicas', description: 'Trabajos de grado, tesis de maestría, doctorado y posdoctorado' },
      bancas: { label: 'Tribunales', description: 'Calificaciones, defensas y concursos' },
      premios: { label: 'Premios y distinciones', description: 'Honores, menciones y distinciones' },
      inovacao: { label: 'Innovación', description: 'Productos, startups, spin-offs y tecnologías' },
      extensao: { label: 'Extensión', description: 'Acciones, proyectos, cursos y eventos comunitarios' },
      idiomas: { label: 'Idiomas', description: 'Comprensión, habla, lectura y escritura' }
    } as Record<LattesSectionId, { label: string; description: string }>,
    assistantTitle: 'Cuéntanos tu trayectoria',
    assistantSubtitle: 'Ej.: "Terminé una maestría en Educación en la UFF en 2021" o "Publiqué un artículo en 2024".',
    assistantPlaceholder: 'Escribe de forma natural...',
    assistantBtn: 'Interpretar',
    assistantStatus: (label: string) => `Registro sugerido en "${label}". Revisa los datos.`,
    assistantAutoDescription: 'Registro creado por el asistente. Revisa los campos antes de exportar.',
    identidadeTitle: 'Identidad académica',
    identidadeSubtitle: 'Usa datos fieles a tus documentos e identificadores académicos.',
    fullNameLabel: 'Nombre completo *',
    fullNamePlaceholder: 'Nombre civil completo',
    citationNameLabel: 'Nombre en citas',
    citationNamePlaceholder: 'APELLIDO, N. N.',
    nationalityLabel: 'Nacionalidad',
    cityLabel: 'Ciudad / Estado',
    cityPlaceholder: 'Ciudad, Estado',
    emailLabel: 'Correo académico',
    orcidLabel: 'ORCID',
    orcidPlaceholder: '0000-0000-0000-0000',
    summaryLabel: 'Resumen académico',
    summaryPlaceholder: 'Síntesis de la formación, experiencia, temas de investigación y contribuciones...',
    keywordsLabel: 'Palabras clave',
    keywordsPlaceholder: 'Educación, Políticas públicas, Ciencia de datos',
    entryLabels: {
      add: 'Agregar',
      titleField: 'Título / actividad',
      institutionField: 'Institución / medio',
      startField: 'Inicio / año',
      startPlaceholder: '2024',
      endField: 'Fin / situación',
      endPlaceholder: 'Actual',
      identifierField: 'DOI / ISBN / ISSN',
      authorsField: 'Autores',
      descriptionField: 'Descripción',
      remove: 'Eliminar registro',
      addFirst: 'Agregar primer registro',
      addFirstHint: 'También puedes usar el asistente de arriba.'
    } as EntryLabels,
    redesTitle: 'Redes e impacto',
    redesSubtitle: 'Consolida identificadores y métricas, siempre indicando la fuente y la fecha de consulta.',
    indicatorLabels: { articles: 'Artículos', citations: 'Citas', hIndex: 'Índice h', i10: 'Índice i10' },
    networkLabel: 'Red académica',
    networkPlaceholder: 'Pega una URL de ORCID, Scholar o Scopus...',
    networkAddBtn: 'Agregar',
    networkDefaultName: 'Perfil académico',
    noNetworksText: 'Todavía no se agregó ninguna red.',
    revisaoTitle: 'Revisión final',
    revisaoPending: (n: number) => `${n} punto(s) requieren atención antes de generar.`,
    revisaoDone: 'Todo listo para generar.',
    outputAcademico: 'Académico premium',
    outputEdital: 'Versión para convocatoria',
    outputConcurso: 'Versión para concurso público',
    outputInternacional: 'Academic CV (English)',
    consistentTitle: 'Currículum consistente',
    consistentText: 'No se identificó ningún problema.',
    prevBtn: 'Anterior',
    stepLabel: (current: number, total: number) => `Paso ${current} de ${total}`,
    continueBtn: 'Continuar',
    downloadPdfBtn: 'Descargar PDF',
    importTitle: 'Importar producción',
    importHint: 'Consulta un DOI vía Crossref o vincula un ORCID. Los datos importados siempre requieren revisión.',
    importPlaceholder: 'DOI u ORCID',
    importBtn: 'Consultar',
    importErrorText: 'No fue posible consultar ahora. Verifica el DOI/ORCID o complétalo manualmente.',
    uploadTitle: 'Diplomas, certificados y artículos',
    uploadHint: 'PDF o imagen · varios archivos',
    uploadDescription: (fileName: string) => `Documento "${fileName}" adjuntado para revisión. La extracción asistida estará disponible cuando se conecte el servicio de OCR.`,
    transparencyTitle: 'Transparencia',
    transparencyText: 'Este módulo organiza datos compatibles con el ecosistema académico brasileño (Lattes), pero no tiene integración oficial ni envía información a la Plataforma Lattes.',
    pdfErrorText: 'No fue posible generar el PDF. Intenta de nuevo.',
    importedPublicationFallback: 'Publicación importada',
    crossrefDescription: 'Metadatos obtenidos vía Crossref. Confirma antes de usar.',
    preview: {
      eyebrowPrefix: 'Currículum académico',
      namePlaceholder: 'Tu nombre completo',
      summaryPlaceholder: 'Tu resumen académico aparecerá aquí.',
      dateRange: (start: string, end: string) => `${start}${end ? ` a ${end}` : ''}`
    } as PreviewLabels
  }
} as const satisfies Record<Locale, Record<string, unknown>>;

function buildSample(locale: Locale): LattesProfile {
  if (locale === 'en') {
    return {
      ...createLattesProfile(),
      title: 'Academic CV of Marina Costa',
      general: {
        fullName: 'Marina Alves Costa',
        citationName: 'COSTA, M. A.',
        nationality: 'Brazilian',
        city: 'Belo Horizonte, MG',
        email: 'marina.costa@universidade.br',
        orcid: '0000-0002-1825-0097',
        summary:
          'PhD in Computer Science, working on responsible artificial intelligence, data science and digital public policy.'
      },
      keywords: ['Artificial intelligence', 'Data science', 'Technology ethics'],
      entries: [
        createEntry('formacao', {
          title: 'PhD in Computer Science',
          institution: 'Federal University of Minas Gerais',
          startYear: '2018',
          endYear: '2022',
          description: 'Thesis on explainability in automated decision systems.'
        }),
        createEntry('atuacao', {
          title: 'Assistant Professor',
          institution: 'Federal University of Minas Gerais',
          startYear: '2023',
          endYear: 'Present',
          description: 'Teaching, research and advising in the Computing Department.'
        }),
        createEntry('bibliografica', {
          title: 'Responsible AI in public decision systems',
          institution: 'Journal of AI Research',
          startYear: '2024',
          identifier: '10.5555/example.2024.01',
          authors: 'Costa, M. A.; Silva, R. P.',
          description: 'Full paper published in a journal.'
        }),
        createEntry('projetos', {
          title: 'Responsible AI for public services',
          institution: 'CNPq / UFMG',
          startYear: '2023',
          endYear: '2026',
          status: 'In progress',
          description: 'Research and development project.'
        })
      ],
      academicNetworks: [
        { name: 'ORCID', url: 'https://orcid.org/0000-0002-1825-0097' },
        { name: 'Google Scholar', url: 'https://scholar.google.com/' }
      ],
      indicators: { articles: '18', citations: '342', hIndex: '9', i10: '8' }
    };
  }
  if (locale === 'es') {
    return {
      ...createLattesProfile(),
      title: 'Currículum académico de Marina Costa',
      general: {
        fullName: 'Marina Alves Costa',
        citationName: 'COSTA, M. A.',
        nationality: 'Brasileña',
        city: 'Belo Horizonte, MG',
        email: 'marina.costa@universidade.br',
        orcid: '0000-0002-1825-0097',
        summary:
          'Doctora en Ciencias de la Computación, con trabajo en inteligencia artificial responsable, ciencia de datos y políticas públicas digitales.'
      },
      keywords: ['Inteligencia artificial', 'Ciencia de datos', 'Ética en tecnología'],
      entries: [
        createEntry('formacao', {
          title: 'Doctorado en Ciencias de la Computación',
          institution: 'Universidade Federal de Minas Gerais',
          startYear: '2018',
          endYear: '2022',
          description: 'Tesis sobre explicabilidad en sistemas de decisión automatizada.'
        }),
        createEntry('atuacao', {
          title: 'Profesora Adjunta',
          institution: 'Universidade Federal de Minas Gerais',
          startYear: '2023',
          endYear: 'Actual',
          description: 'Docencia, investigación y orientación en el Departamento de Computación.'
        }),
        createEntry('bibliografica', {
          title: 'Responsible AI in public decision systems',
          institution: 'Journal of AI Research',
          startYear: '2024',
          identifier: '10.5555/example.2024.01',
          authors: 'Costa, M. A.; Silva, R. P.',
          description: 'Artículo completo publicado en revista.'
        }),
        createEntry('projetos', {
          title: 'IA responsable para servicios públicos',
          institution: 'CNPq / UFMG',
          startYear: '2023',
          endYear: '2026',
          status: 'En curso',
          description: 'Proyecto de investigación y desarrollo.'
        })
      ],
      academicNetworks: [
        { name: 'ORCID', url: 'https://orcid.org/0000-0002-1825-0097' },
        { name: 'Google Scholar', url: 'https://scholar.google.com/' }
      ],
      indicators: { articles: '18', citations: '342', hIndex: '9', i10: '8' }
    };
  }
  return {
    ...createLattesProfile(),
    title: 'Currículo acadêmico de Marina Costa',
    general: {
      fullName: 'Marina Alves Costa',
      citationName: 'COSTA, M. A.',
      nationality: 'Brasileira',
      city: 'Belo Horizonte, MG',
      email: 'marina.costa@universidade.br',
      orcid: '0000-0002-1825-0097',
      summary:
        'Doutora em Ciência da Computação, com atuação em inteligência artificial responsável, ciência de dados e políticas públicas digitais.'
    },
    keywords: ['Inteligência artificial', 'Ciência de dados', 'Ética em tecnologia'],
    entries: [
      createEntry('formacao', {
        title: 'Doutorado em Ciência da Computação',
        institution: 'Universidade Federal de Minas Gerais',
        startYear: '2018',
        endYear: '2022',
        description: 'Tese sobre explicabilidade em sistemas de decisão automatizada.'
      }),
      createEntry('atuacao', {
        title: 'Professora Adjunta',
        institution: 'Universidade Federal de Minas Gerais',
        startYear: '2023',
        endYear: 'Atual',
        description: 'Docência, pesquisa e orientação no Departamento de Computação.'
      }),
      createEntry('bibliografica', {
        title: 'Responsible AI in public decision systems',
        institution: 'Journal of AI Research',
        startYear: '2024',
        identifier: '10.5555/example.2024.01',
        authors: 'Costa, M. A.; Silva, R. P.',
        description: 'Artigo completo publicado em periódico.'
      }),
      createEntry('projetos', {
        title: 'IA responsável para serviços públicos',
        institution: 'CNPq / UFMG',
        startYear: '2023',
        endYear: '2026',
        status: 'Em andamento',
        description: 'Projeto de pesquisa e desenvolvimento.'
      })
    ],
    academicNetworks: [
      { name: 'ORCID', url: 'https://orcid.org/0000-0002-1825-0097' },
      { name: 'Google Scholar', url: 'https://scholar.google.com/' }
    ],
    indicators: { articles: '18', citations: '342', hIndex: '9', i10: '8' }
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>; }

export function LattesApp({ locale = 'pt-BR' }: { locale?: Locale } = {}) {
  const t = copy[locale];
  const steps = STEP_IDS.map((id) => ({ id, ...t.steps[id] }));
  const sections: SectionMeta[] = SECTION_IDS.map((id) => ({ id, ...t.sections[id] }));
  const { usage } = useAuth();
  const brandDocuments = useDocumentBranding();
  const previewRef = useRef<HTMLDivElement>(null); const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<LattesProfile>(createLattesProfile); const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved'); const [assistant, setAssistant] = useState('');
  const [assistantStatus, setAssistantStatus] = useState(''); const [importValue, setImportValue] = useState('');
  const [importing, setImporting] = useState(false); const [uploading, setUploading] = useState(false); const [error, setError] = useState('');
  const issues = useMemo(() => validateProfile(profile), [profile]); const score = useMemo(() => completion(profile), [profile]);
  const step = profile.currentStep; const active = steps[step];

  useEffect(() => { try { const raw = localStorage.getItem(LATTES_STORAGE_KEY); if (raw) setProfile({ ...createLattesProfile(), ...JSON.parse(raw) }); } catch {} setHydrated(true); }, []);
  useEffect(() => { if (!hydrated) return; setSaveState('saving'); const timer = setTimeout(() => { localStorage.setItem(LATTES_STORAGE_KEY, JSON.stringify({ ...profile, updatedAt: new Date().toISOString() })); setSaveState('saved'); }, 650); return () => clearTimeout(timer); }, [profile, hydrated]);
  const patch = (next: Partial<LattesProfile>) => setProfile((value) => ({ ...value, ...next }));
  const patchGeneral = (key: keyof LattesProfile['general'], value: string) => patch({ general: { ...profile.general, [key]: value } });
  const entriesFor = (id: LattesSectionId) => profile.entries.filter((entry) => entry.section === id);
  const updateEntry = (id: string, changes: Partial<AcademicEntry>) => patch({ entries: profile.entries.map((item) => item.id === id ? { ...item, ...changes } : item) });
  const removeEntry = (id: string) => patch({ entries: profile.entries.filter((item) => item.id !== id) });

  function runAssistantInterpret() {
    const text = assistant.trim(); if (!text) return; const year = text.match(/(?:19|20)\d{2}/)?.[0] || '';
    let section: LattesSectionId = /artigo|doi|public|livro|capítulo|article|paper|book/i.test(text) ? 'bibliografica' : /professor|trabalh|cargo|vínculo|teacher|job|position/i.test(text) ? 'atuacao' : /projeto|pesquisa|project|research/i.test(text) ? 'projetos' : 'formacao';
    patch({ entries: [...profile.entries, createEntry(section, { title: text.replace(/^(eu |sou |publiquei |concluí |fiz |i |i'm )/i, '').slice(0, 110), startYear: year, description: t.assistantAutoDescription })] });
    setAssistant(''); setAssistantStatus(t.assistantStatus(t.sections[section].label)); setTimeout(() => setAssistantStatus(''), 4000);
  }

  async function importAcademic() {
    const value = importValue.trim(); if (!value) return; setImporting(true); setError('');
    try {
      if (/^10\.\d{4,9}\//i.test(value)) { const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(value)}`); if (!response.ok) throw new Error(); const data = (await response.json()).message; patch({ entries: [...profile.entries, createEntry('bibliografica', { title: data.title?.[0] || t.importedPublicationFallback, institution: data['container-title']?.[0] || '', startYear: String(data.published?.['date-parts']?.[0]?.[0] || ''), identifier: value, authors: (data.author || []).map((a: { family?: string; given?: string }) => `${a.family || ''}, ${a.given || ''}`).join('; '), description: t.crossrefDescription })] }); setImportValue(''); }
      else if (/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i.test(value)) { patchGeneral('orcid', value); patch({ academicNetworks: [...profile.academicNetworks.filter((n) => n.name !== 'ORCID'), { name: 'ORCID', url: `https://orcid.org/${value}` }] }); setImportValue(''); }
      else throw new Error();
    } catch { setError(t.importErrorText); } finally { setImporting(false); }
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) { const files = Array.from(event.target.files || []); if (!files.length) return; setUploading(true); setTimeout(() => { patch({ entries: [...profile.entries, ...files.map((file) => createEntry(/artigo|paper/i.test(file.name) ? 'bibliografica' : 'formacao', { title: file.name.replace(/\.[^.]+$/, ''), description: t.uploadDescription(file.name) }))] }); setUploading(false); if (fileRef.current) fileRef.current.value = ''; }, 800); }
  async function exportPdf() { if (!previewRef.current) return; setError(''); try { await exportElementToPdf(previewRef.current, `${(profile.general.fullName || 'curriculo-academico').replace(/\s+/g, '_')}.pdf`, { branded: brandDocuments }); } catch { setError(t.pdfErrorText); } }

  if (!hydrated) return <div className="grid min-h-[420px] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-teal-700" /></div>;
  return <AuthGate title={t.authTitle} description={t.authDescription}>
    <div className="space-y-5 pb-10">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-white to-teal-50 p-5 shadow-sm sm:p-7"><ToolsWatermark />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><div className="flex gap-4"><span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-900/10"><GraduationCap className="h-6 w-6" /></span><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">{t.headerTitle}</h1><span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal-800">{t.headerBadge}</span></div><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{t.headerSubtitle}</p></div></div>
          <div className="flex flex-wrap items-center gap-2">
            <ToolsBackButton size="default" />
            <Button variant="outline" onClick={() => setProfile(buildSample(locale))}><Sparkles className="h-4 w-4" />{t.seeExampleBtn}</Button>
            <Button onClick={exportPdf}><Download className="h-4 w-4" />{t.generatePdfBtn}</Button>
          </div></div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="mb-2 flex justify-between text-xs font-semibold text-slate-600"><span>{t.profileCompletionLabel}</span><span>{score}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-cyan-500 transition-all" style={{ width: `${score}%` }} /></div></div><div className="flex items-center gap-2 text-xs font-medium text-slate-500">{saveState === 'saving' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 text-emerald-600" />}{saveState === 'saving' ? t.savingLabel : t.savedLabel}</div></div>
      </section>

      <section className="grid gap-2 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-5">{steps.map((item, index) => <button key={item.id} onClick={() => patch({ currentStep: index })} className={cn('flex items-center gap-3 rounded-2xl p-3 text-left transition', index === step ? 'bg-slate-950 text-white shadow-md' : index < step ? 'bg-teal-50 text-teal-900' : 'text-slate-500 hover:bg-slate-50')}><span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold', index === step ? 'bg-teal-400 text-slate-950' : index < step ? 'bg-teal-600 text-white' : 'bg-slate-100')}>{index < step ? <Check className="h-4 w-4" /> : index + 1}</span><span><b className="block text-xs">{item.label}</b><small className="hidden text-[10px] opacity-70 lg:block">{item.hint}</small></span></button>)}</section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
        <main className="space-y-5">
          <section className="rounded-[28px] border border-teal-200 bg-teal-950 p-5 text-white shadow-sm"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-400 text-teal-950"><Bot className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 className="font-bold">{t.assistantTitle}</h2><p className="mt-0.5 text-xs leading-5 text-teal-100">{t.assistantSubtitle}</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input value={assistant} onChange={(e) => setAssistant(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runAssistantInterpret()} placeholder={t.assistantPlaceholder} className="border-white/20 bg-white/10 text-white placeholder:text-teal-200" /><Button onClick={runAssistantInterpret} className="bg-teal-400 text-teal-950 hover:bg-teal-300"><Wand2 className="h-4 w-4" />{t.assistantBtn}</Button></div>{assistantStatus && <p className="mt-2 text-xs font-medium text-teal-200">{assistantStatus}</p>}</div></div></section>

          {active.id === 'geral' && <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><h2 className="text-xl font-bold text-slate-950">{t.identidadeTitle}</h2><p className="mt-1 text-sm text-slate-500">{t.identidadeSubtitle}</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label={t.fullNameLabel}><Input value={profile.general.fullName} onChange={(e) => patchGeneral('fullName', e.target.value)} placeholder={t.fullNamePlaceholder} /></Field><Field label={t.citationNameLabel}><Input value={profile.general.citationName} onChange={(e) => patchGeneral('citationName', e.target.value)} placeholder={t.citationNamePlaceholder} /></Field><Field label={t.nationalityLabel}><Input value={profile.general.nationality} onChange={(e) => patchGeneral('nationality', e.target.value)} /></Field><Field label={t.cityLabel}><Input value={profile.general.city} onChange={(e) => patchGeneral('city', e.target.value)} placeholder={t.cityPlaceholder} /></Field><Field label={t.emailLabel}><Input type="email" value={profile.general.email} onChange={(e) => patchGeneral('email', e.target.value)} /></Field><Field label={t.orcidLabel}><Input value={profile.general.orcid} onChange={(e) => patchGeneral('orcid', e.target.value)} placeholder={t.orcidPlaceholder} /></Field><div className="sm:col-span-2"><Field label={t.summaryLabel}><Textarea rows={6} value={profile.general.summary} onChange={(e) => patchGeneral('summary', e.target.value)} placeholder={t.summaryPlaceholder} /></Field></div><div className="sm:col-span-2"><Field label={t.keywordsLabel}><Input value={profile.keywords.join(', ')} onChange={(e) => patch({ keywords: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} placeholder={t.keywordsPlaceholder} /></Field></div></div></section>}

          {(active.id === 'formacao' || active.id === 'bibliografica') && <div className="space-y-4">{sections.filter((section) => active.id === 'formacao' ? ['formacao','atuacao','pesquisa','projetos'].includes(section.id) : !['formacao','atuacao','pesquisa','projetos','idiomas'].includes(section.id)).map((section) => <SectionEditor key={section.id} section={section} entries={entriesFor(section.id)} labels={t.entryLabels} onAdd={() => patch({ entries: [...profile.entries, createEntry(section.id)] })} onUpdate={updateEntry} onRemove={removeEntry} />)}</div>}

          {active.id === 'redes' && <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold">{t.redesTitle}</h2><p className="mt-1 text-sm text-slate-500">{t.redesSubtitle}</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{(['articles','citations','hIndex','i10'] as const).map((key) => <Field key={key} label={t.indicatorLabels[key]}><Input inputMode="numeric" value={profile.indicators[key]} onChange={(e) => patch({ indicators: { ...profile.indicators, [key]: e.target.value } })} /></Field>)}</div><div className="mt-6"><Field label={t.networkLabel}><div className="flex gap-2"><Input placeholder={t.networkPlaceholder} onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value) { patch({ academicNetworks: [...profile.academicNetworks, { name: t.networkDefaultName, url: e.currentTarget.value }] }); e.currentTarget.value=''; } }} /><Button variant="outline">{t.networkAddBtn}</Button></div></Field>{profile.academicNetworks.length ? <div className="mt-3 flex flex-wrap gap-2">{profile.academicNetworks.map((network, index) => <span key={`${network.url}-${index}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">{network.name}</span>)}</div> : <p className="mt-3 text-sm text-slate-400">{t.noNetworksText}</p>}</div><SectionEditor section={sections.find((s) => s.id === 'idiomas')!} entries={entriesFor('idiomas')} labels={t.entryLabels} onAdd={() => patch({ entries: [...profile.entries, createEntry('idiomas')] })} onUpdate={updateEntry} onRemove={removeEntry} compact /></section>}

          {active.id === 'revisao' && <section className="space-y-5"><div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">{t.revisaoTitle}</h2><p className="mt-1 text-sm text-slate-500">{issues.length ? t.revisaoPending(issues.length) : t.revisaoDone}</p></div><Select value={profile.outputMode} onChange={(e) => patch({ outputMode: e.target.value as LattesProfile['outputMode'] })} className="sm:w-56"><option value="academico">{t.outputAcademico}</option><option value="edital">{t.outputEdital}</option><option value="concurso">{t.outputConcurso}</option><option value="internacional">{t.outputInternacional}</option></Select></div><div className="mt-5 space-y-2">{issues.length ? issues.map((issue) => <div key={issue.id} className={cn('flex gap-3 rounded-2xl border p-3', issue.severity === 'error' ? 'border-rose-200 bg-rose-50' : issue.severity === 'warning' ? 'border-amber-200 bg-amber-50' : 'border-sky-200 bg-sky-50')}><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="text-sm font-bold">{issue.title}</p><p className="text-xs leading-5 opacity-75">{issue.detail}</p></div></div>) : <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-800"><Check className="mb-2 h-6 w-6" /><b>{t.consistentTitle}</b><p className="text-sm">{t.consistentText}</p></div>}</div></div><AcademicPreview ref={previewRef} profile={profile} branded={brandDocuments} sections={sections} labels={t.preview} /></section>}

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3"><Button variant="ghost" disabled={step === 0} onClick={() => patch({ currentStep: Math.max(0, step - 1) })}><ChevronLeft className="h-4 w-4" />{t.prevBtn}</Button><span className="text-xs font-semibold text-slate-400">{t.stepLabel(step + 1, steps.length)}</span>{step < steps.length - 1 ? <Button onClick={() => patch({ currentStep: step + 1 })}>{t.continueBtn}<ChevronRight className="h-4 w-4" /></Button> : <Button onClick={exportPdf}><Download className="h-4 w-4" />{t.downloadPdfBtn}</Button>}</div>
        </main>

        <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start"><section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"><h3 className="flex items-center gap-2 text-sm font-bold"><FileSearch className="h-4 w-4 text-teal-700" />{t.importTitle}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{t.importHint}</p><Input className="mt-3" value={importValue} onChange={(e) => setImportValue(e.target.value)} placeholder={t.importPlaceholder} /><Button className="mt-2 w-full" variant="outline" onClick={importAcademic} disabled={importing}>{importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}{t.importBtn}</Button></section><section className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-4"><input ref={fileRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleUpload} /><button className="w-full text-center" onClick={() => fileRef.current?.click()}><span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-teal-700 shadow-sm">{uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}</span><b className="mt-2 block text-sm">{t.uploadTitle}</b><span className="mt-1 block text-xs leading-5 text-slate-500">{t.uploadHint}</span></button></section><section className="rounded-[24px] bg-slate-950 p-4 text-white"><p className="text-xs font-bold uppercase tracking-widest text-teal-300">{t.transparencyTitle}</p><p className="mt-2 text-xs leading-5 text-slate-300">{t.transparencyText}</p></section>{error && <p className="rounded-2xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}</aside>
      </div>
    </div>
  </AuthGate>;
}

function SectionEditor({ section, entries, labels, onAdd, onUpdate, onRemove, compact = false }: { section: SectionMeta; entries: AcademicEntry[]; labels: EntryLabels; onAdd: () => void; onUpdate: (id: string, changes: Partial<AcademicEntry>) => void; onRemove: (id: string) => void; compact?: boolean }) {
  return <section className={cn('rounded-[28px] border border-slate-200 bg-white shadow-sm', compact ? 'mt-6 p-0 shadow-none' : 'p-5 sm:p-6')}><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold text-slate-950">{section.label}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{section.description}</p></div><Button size="sm" variant="outline" onClick={onAdd}><Plus className="h-4 w-4" />{labels.add}</Button></div>{entries.length ? <div className="mt-4 space-y-3">{entries.map((entry) => <article key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"><div className="grid gap-3 sm:grid-cols-2"><Field label={labels.titleField}><Input value={entry.title} onChange={(e) => onUpdate(entry.id, { title: e.target.value })} /></Field><Field label={labels.institutionField}><Input value={entry.institution} onChange={(e) => onUpdate(entry.id, { institution: e.target.value })} /></Field><Field label={labels.startField}><Input value={entry.startYear} onChange={(e) => onUpdate(entry.id, { startYear: e.target.value })} placeholder={labels.startPlaceholder} /></Field><Field label={labels.endField}><Input value={entry.endYear} onChange={(e) => onUpdate(entry.id, { endYear: e.target.value })} placeholder={labels.endPlaceholder} /></Field>{section.id === 'bibliografica' && <><Field label={labels.identifierField}><Input value={entry.identifier || ''} onChange={(e) => onUpdate(entry.id, { identifier: e.target.value })} /></Field><Field label={labels.authorsField}><Input value={entry.authors || ''} onChange={(e) => onUpdate(entry.id, { authors: e.target.value })} /></Field></>}<div className="sm:col-span-2"><Field label={labels.descriptionField}><Textarea rows={3} value={entry.description} onChange={(e) => onUpdate(entry.id, { description: e.target.value })} /></Field></div></div><button onClick={() => onRemove(entry.id)} className="mt-3 flex items-center gap-1 text-xs font-semibold text-rose-600"><Trash2 className="h-3.5 w-3.5" />{labels.remove}</button></article>)}</div> : <button onClick={onAdd} className="mt-4 flex w-full flex-col items-center rounded-2xl border border-dashed border-slate-300 p-6 text-center hover:border-teal-400 hover:bg-teal-50/40"><Plus className="h-5 w-5 text-teal-700" /><b className="mt-2 text-sm text-slate-700">{labels.addFirst}</b><span className="mt-1 text-xs text-slate-400">{labels.addFirstHint}</span></button>}</section>;
}

const AcademicPreview = forwardRef<HTMLDivElement, { profile: LattesProfile; branded?: boolean; sections: SectionMeta[]; labels: PreviewLabels }>(({ profile, branded = true, sections, labels }, ref) => <div ref={ref} className="mx-auto min-h-[297mm] max-w-[210mm] bg-white p-[16mm] text-slate-900 shadow-xl"><DocumentExportShell branded={branded}><header className="border-b-4 border-teal-700 pb-5"><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal-700">{labels.eyebrowPrefix} · {profile.outputMode}</p><h1 className="mt-3 text-3xl font-bold">{profile.general.fullName || labels.namePlaceholder}</h1><p className="mt-1 text-sm text-slate-500">{profile.general.citationName} {profile.general.orcid && `· ORCID ${profile.general.orcid}`}</p><p className="mt-4 text-sm leading-6">{profile.general.summary || labels.summaryPlaceholder}</p></header><div className="mt-6 space-y-6">{sections.map((section) => { const rows = profile.entries.filter((e) => e.section === section.id && e.title); if (!rows.length) return null; return <section key={section.id}><h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-teal-800">{section.label}</h2><div className="space-y-3">{rows.map((row) => <div key={row.id} className="border-l-2 border-slate-200 pl-3"><div className="flex justify-between gap-4"><b className="text-sm">{row.title}</b><span className="shrink-0 text-[11px] text-slate-500">{labels.dateRange(row.startYear, row.endYear)}</span></div><p className="text-xs font-medium text-slate-600">{row.institution}</p>{row.authors && <p className="mt-1 text-xs">{row.authors}</p>}{row.description && <p className="mt-1 text-xs leading-5 text-slate-600">{row.description}</p>}{row.identifier && <p className="mt-1 text-[10px] text-teal-700">{row.identifier}</p>}</div>)}</div></section>; })}</div></DocumentExportShell></div>);
AcademicPreview.displayName = 'AcademicPreview';
