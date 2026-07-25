export interface AssinaturaEmailData {
  nome: string;
  cargo: string;
  empresa: string;
  telefone: string;
  email: string;
  site: string;
  whatsapp: string;
  linkedin: string;
  instagram: string;
  corDestaque: string;
  logoDataUrl: string;
  layout: 'moderno' | 'classico';
}

function linkify(url: string) {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
}

/** Gera HTML inline (compatível com clientes de e-mail) para a assinatura. */
export function buildAssinaturaHtml(data: AssinaturaEmailData): string {
  const cor = data.corDestaque || '#0369a1';
  const linhas: string[] = [];

  if (data.cargo) linhas.push(`<span style="color:#475569;">${escapeHtml(data.cargo)}</span>`);
  if (data.empresa) linhas.push(`<span style="color:#475569;font-weight:600;">${escapeHtml(data.empresa)}</span>`);

  const contatos: string[] = [];
  if (data.telefone) contatos.push(escapeHtml(data.telefone));
  if (data.email) contatos.push(`<a href="mailto:${escapeHtml(data.email)}" style="color:${cor};text-decoration:none;">${escapeHtml(data.email)}</a>`);
  if (data.site) contatos.push(`<a href="${linkify(data.site)}" style="color:${cor};text-decoration:none;">${escapeHtml(data.site.replace(/^https?:\/\//, ''))}</a>`);

  const redes: string[] = [];
  if (data.whatsapp) redes.push(`<a href="https://wa.me/${data.whatsapp.replace(/\D/g, '')}" style="color:${cor};text-decoration:none;">WhatsApp</a>`);
  if (data.linkedin) redes.push(`<a href="${linkify(data.linkedin)}" style="color:${cor};text-decoration:none;">LinkedIn</a>`);
  if (data.instagram) redes.push(`<a href="${linkify(data.instagram)}" style="color:${cor};text-decoration:none;">Instagram</a>`);

  const logoCell = data.logoDataUrl
    ? `<td style="padding-right:16px;vertical-align:top;"><img src="${data.logoDataUrl}" alt="${escapeHtml(data.empresa || data.nome)}" width="72" style="display:block;border-radius:8px;" /></td>`
    : '';

  const borderSide = data.layout === 'classico' ? '' : `border-left:3px solid ${cor};padding-left:16px;`;

  return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#0f172a;">
  <tr>
    ${logoCell}
    <td style="${borderSide}vertical-align:top;">
      <div style="font-size:15px;font-weight:700;color:#0f172a;">${escapeHtml(data.nome || 'Seu nome')}</div>
      ${linhas.map((l) => `<div>${l}</div>`).join('\n      ')}
      ${contatos.length ? `<div style="margin-top:6px;">${contatos.join(' &nbsp;|&nbsp; ')}</div>` : ''}
      ${redes.length ? `<div style="margin-top:4px;">${redes.join(' &nbsp;|&nbsp; ')}</div>` : ''}
    </td>
  </tr>
</table>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
