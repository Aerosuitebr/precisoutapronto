export type PdfTask = 'merge' | 'split';
export type PdfTaskLocale = 'pt-BR' | 'en' | 'es';

export type PdfTaskLanding = {
  task: string;
  locale: PdfTaskLocale;
  path: string;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  eyebrow?: string;
  steps: string[];
  faqs: Array<{ q: string; a: string }>;
};

const COPY: Record<PdfTask, Record<PdfTaskLocale, PdfTaskLanding>> = {
  merge: {
    'pt-BR': {
      task: 'merge', locale: 'pt-BR', path: '/juntar-pdf-online',
      title: 'Juntar PDF online grátis com ordem personalizada',
      description: 'Junte vários arquivos PDF online, reorganize as páginas e baixe um único documento. Processamento local no navegador, sem enviar arquivos ao servidor.',
      h1: 'Juntar PDF online grátis',
      subtitle: 'Combine vários PDFs, ajuste a ordem das páginas e baixe um único arquivo. Seus documentos permanecem no navegador.',
      steps: ['Selecione dois ou mais arquivos PDF.', 'Arraste as páginas para definir a ordem final.', 'Revise páginas, orientação e tamanho.', 'Baixe o PDF unificado.'],
      faqs: [
        { q: 'Os PDFs são enviados para um servidor?', a: 'Não. A união acontece localmente no navegador.' },
        { q: 'Posso reorganizar as páginas?', a: 'Sim. Você pode misturar páginas de diferentes arquivos e definir a ordem final.' },
        { q: 'O conteúdo perde qualidade?', a: 'Não ao apenas juntar e reorganizar. As páginas originais são copiadas para o novo documento.' }
      ]
    },
    en: {
      task: 'merge', locale: 'en', path: '/en/tools/merge-pdf',
      title: 'Merge PDF files online for free in any order',
      description: 'Merge multiple PDF files online, reorder their pages and download one document. Local browser processing with no server upload.',
      h1: 'Merge PDF files online for free',
      subtitle: 'Combine PDFs, arrange every page and download one document. Your files stay in your browser.',
      steps: ['Select two or more PDF files.', 'Drag pages into the final order.', 'Review page orientation and size.', 'Download the merged PDF.'],
      faqs: [
        { q: 'Are my PDFs uploaded?', a: 'No. Merging happens locally in your browser.' },
        { q: 'Can I reorder individual pages?', a: 'Yes. Mix pages from different files and choose the final order.' },
        { q: 'Does merging reduce quality?', a: 'No. Unchanged source pages are copied into the resulting document.' }
      ]
    },
    es: {
      task: 'merge', locale: 'es', path: '/es/tools/merge-pdf',
      title: 'Unir PDF online gratis y ordenar las páginas',
      description: 'Une varios archivos PDF online, ordena sus páginas y descarga un solo documento. Procesamiento local sin subir archivos al servidor.',
      h1: 'Unir archivos PDF online gratis',
      subtitle: 'Combina varios PDF, organiza cada página y descarga un único documento. Tus archivos permanecen en el navegador.',
      steps: ['Selecciona dos o más archivos PDF.', 'Arrastra las páginas hasta el orden final.', 'Revisa orientación y tamaño.', 'Descarga el PDF unido.'],
      faqs: [
        { q: '¿Mis PDF se suben a un servidor?', a: 'No. La unión ocurre localmente en el navegador.' },
        { q: '¿Puedo ordenar páginas individuales?', a: 'Sí. Puedes mezclar páginas de distintos archivos y elegir el orden final.' },
        { q: '¿Se pierde calidad al unir?', a: 'No. Las páginas sin cambios se copian al documento resultante.' }
      ]
    }
  },
  split: {
    'pt-BR': {
      task: 'split', locale: 'pt-BR', path: '/dividir-pdf-online',
      title: 'Dividir PDF online grátis e extrair páginas',
      description: 'Divida PDF online, remova páginas e extraia somente o que precisa. Processamento local no navegador, sem enviar o documento ao servidor.',
      h1: 'Dividir PDF e extrair páginas online',
      subtitle: 'Escolha as páginas que deseja manter, reorganize o resultado e baixe um novo PDF sem expor o arquivo.',
      steps: ['Selecione o arquivo PDF.', 'Remova as páginas que não deseja manter.', 'Reorganize ou gire as páginas restantes.', 'Baixe o novo PDF com a seleção.'],
      faqs: [
        { q: 'Consigo extrair apenas uma página?', a: 'Sim. Mantenha somente a página desejada e gere um novo PDF.' },
        { q: 'O arquivo original é alterado?', a: 'Não. A ferramenta cria um novo arquivo e preserva o original.' },
        { q: 'O documento sai do meu dispositivo?', a: 'Não. O processamento acontece localmente no navegador.' }
      ]
    },
    en: {
      task: 'split', locale: 'en', path: '/en/tools/split-pdf',
      title: 'Split PDF online and extract pages for free',
      description: 'Split a PDF online, remove pages and extract only what you need. Local browser processing with no document upload.',
      h1: 'Split PDF and extract pages online',
      subtitle: 'Keep the pages you need, arrange the result and download a new PDF without exposing your file.',
      steps: ['Select a PDF file.', 'Remove pages you do not need.', 'Reorder or rotate the remaining pages.', 'Download a new PDF with your selection.'],
      faqs: [
        { q: 'Can I extract a single page?', a: 'Yes. Keep one page and generate a new PDF.' },
        { q: 'Is my original file changed?', a: 'No. The tool creates a new file and preserves the original.' },
        { q: 'Does my document leave my device?', a: 'No. Processing happens locally in the browser.' }
      ]
    },
    es: {
      task: 'split', locale: 'es', path: '/es/tools/split-pdf',
      title: 'Dividir PDF online y extraer páginas gratis',
      description: 'Divide un PDF online, elimina páginas y extrae solo lo necesario. Procesamiento local sin subir el documento.',
      h1: 'Dividir PDF y extraer páginas online',
      subtitle: 'Conserva las páginas necesarias, organiza el resultado y descarga un nuevo PDF sin exponer tu archivo.',
      steps: ['Selecciona un archivo PDF.', 'Elimina las páginas que no necesitas.', 'Ordena o gira las páginas restantes.', 'Descarga un nuevo PDF con tu selección.'],
      faqs: [
        { q: '¿Puedo extraer una sola página?', a: 'Sí. Conserva una página y genera un nuevo PDF.' },
        { q: '¿Se modifica el archivo original?', a: 'No. La herramienta crea un archivo nuevo y conserva el original.' },
        { q: '¿El documento sale de mi dispositivo?', a: 'No. El procesamiento ocurre localmente en el navegador.' }
      ]
    }
  }
};

export function getPdfTaskLanding(task: PdfTask, locale: PdfTaskLocale) {
  return COPY[task][locale];
}
