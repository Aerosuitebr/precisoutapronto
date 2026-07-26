'use client';

import { useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { viralToolShareUrl } from '@/lib/viral-loop';

interface ResultShareCardLine {
  label: string;
  value: string;
}

interface ResultShareCardProps {
  /** Rótulo curto acima do título, ex: "Cálculo de Rescisão". */
  eyebrow: string;
  /** Título principal do card, ex: "Rescisão estimada". */
  title: string;
  /** Rótulo do valor em destaque, ex: "Total bruto estimado". */
  highlightLabel: string;
  /** Valor em destaque já formatado, ex: "R$ 4.320,00". */
  highlightValue: string;
  /** Linhas de detalhe (até ~5 para não estourar o card). */
  lines: ResultShareCardLine[];
  /** Caminho público da ferramenta, ex: "/calculadora-de-rescisao". */
  toolPath: string;
  /** Campanha usada no UTM do link exibido no rodapé do card. */
  utmCampaign: string;
  /** Prefixo do nome do arquivo baixado. */
  fileNameHint: string;
}

/**
 * Gera uma imagem 1080x1350 (formato feed/Stories) com o resultado da
 * calculadora pronta pra compartilhar. Renderiza um card off-screen e
 * rasteriza com html2canvas — mesma técnica já usada em `simple-element-pdf.ts`.
 * Isso transforma cada uso de uma ferramenta gratuita em uma peça de mídia
 * que a pessoa posta no Stories/WhatsApp Status sem precisar de design.
 */
export function ResultShareCard({
  eyebrow,
  title,
  highlightLabel,
  highlightValue,
  lines,
  toolPath,
  utmCampaign,
  fileNameHint
}: ResultShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const shareUrl = viralToolShareUrl(toolPath, utmCampaign);
  const shareHost = shareUrl.replace(/^https?:\/\//, '').split('?')[0];

  async function renderToBlob(): Promise<Blob | null> {
    if (!cardRef.current) return null;
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: '#0f172a',
      useCORS: true
    });
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png', 1));
  }

  async function handleDownload() {
    setGenerating(true);
    try {
      const blob = await renderToBlob();
      if (!blob) throw new Error('sem blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileNameHint}-resolvajato.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('Imagem baixada! Pronta pra postar no Stories ou WhatsApp.');
    } catch {
      toast('Não foi possível gerar a imagem agora.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleShare() {
    setGenerating(true);
    try {
      const blob = await renderToBlob();
      if (!blob) throw new Error('sem blob');
      const file = new File([blob], `${fileNameHint}-resolvajato.png`, { type: 'image/png' });
      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
        share?: (data: { files: File[]; title?: string; text?: string }) => Promise<void>;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title, text: `${title} · Resolva Jato` });
      } else {
        await handleDownload();
      }
    } catch {
      // usuário cancelou o share nativo — não tratar como erro
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none"
          onClick={handleShare}
          icon={Share2}
          disabled={generating}
        >
          {generating ? 'Gerando…' : 'Compartilhar imagem'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 sm:flex-none"
          onClick={handleDownload}
          icon={Download}
          disabled={generating}
        >
          Baixar imagem
        </Button>
      </div>

      {/* Card off-screen usado só pra rasterização — não aparece na tela. */}
      <div className="pointer-events-none fixed left-0 top-0 -z-50 opacity-0" aria-hidden>
        <div
          ref={cardRef}
          style={{
            width: 1080,
            height: 1350,
            background: 'linear-gradient(160deg, #0f172a 0%, #082f49 55%, #0c4a6e 100%)',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: 80,
            display: 'flex',
            flexDirection: 'column',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 800,
                color: '#0f172a'
              }}
            >
              RJ
            </div>
            <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>Resolva Jato</span>
          </div>

          <div style={{ marginTop: 64 }}>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#7dd3fc',
                textTransform: 'uppercase',
                letterSpacing: 1
              }}
            >
              {eyebrow}
            </span>
            <div style={{ fontSize: 54, fontWeight: 800, marginTop: 12, lineHeight: 1.1 }}>{title}</div>
          </div>

          <div
            style={{
              marginTop: 56,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 28,
              padding: '40px 44px',
              flex: 1
            }}
          >
            {lines.slice(0, 5).map((line) => (
              <div
                key={line.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 24,
                  padding: '18px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                  fontSize: 30
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{line.label}</span>
                <span style={{ fontWeight: 800 }}>{line.value}</span>
              </div>
            ))}

            <div
              style={{
                marginTop: 32,
                background: '#0f172a',
                borderRadius: 20,
                padding: '28px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                {highlightLabel}
              </span>
              <span style={{ fontSize: 46, fontWeight: 800, color: '#4ade80' }}>{highlightValue}</span>
            </div>
          </div>

          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>Calcule o seu grátis, sem cadastro</div>
            <div style={{ fontSize: 28, color: '#7dd3fc', fontWeight: 700, marginTop: 8 }}>{shareHost}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
