type MessageSection = {
  title: string;
  lines: Array<string | null | undefined | false>;
};

export function buildStructuredWhatsAppMessage(input: {
  title: string;
  subtitle?: string;
  sections: MessageSection[];
  notice?: string;
  actionLabel?: string;
  actionUrl?: string;
}) {
  const blocks = [
    `*${input.title.trim()}*`,
    input.subtitle ? `_${input.subtitle.trim()}_` : '',
    ...input.sections.flatMap((section) => {
      const lines = section.lines.filter(Boolean).map((line) => `• ${String(line).trim()}`);
      return lines.length ? [`*${section.title.trim()}*`, ...lines, ''] : [];
    }),
    input.notice ? `*IMPORTANTE*\n${input.notice.trim()}` : '',
    input.actionUrl
      ? `*${(input.actionLabel || 'SAIBA MAIS').trim()}*\n${input.actionUrl.trim()}`
      : ''
  ];

  return blocks
    .filter(Boolean)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
