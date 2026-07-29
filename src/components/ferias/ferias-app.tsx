'use client';

import { useMemo, useState } from 'react';
import { Calculator, Copy, MessageCircle, Sun } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { PageHero } from '@/components/shared/page-hero';
import { ResultShareCard } from '@/components/shared/result-share-card';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { WhatsAppSendModal } from '@/components/whatsapp/whatsapp-send-modal';
import { trackEvent } from '@/lib/analytics';
import { formatCurrency, formatCurrencyInput, parseCurrency } from '@/lib/formatters';
import { calcularFerias } from '@/lib/ferias/calc';
import { viralToolShareFooter } from '@/lib/viral-loop';

export function FeriasApp({ publicAccess = false }: { publicAccess?: boolean } = {}) {
  const { toast } = useToast();
  const [salarioInput, setSalarioInput] = useState('');
  const [mediaInput, setMediaInput] = useState('');
  const [diasGozo, setDiasGozo] = useState('30');
  const [diasAbono, setDiasAbono] = useState('0');
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);

  const salario = parseCurrency(salarioInput);
  const mediaVariaveis = parseCurrency(mediaInput);
  const gozo = Number(diasGozo) || 0;
  const abono = Number(diasAbono) || 0;
  const podeCalcular = salario > 0 && gozo > 0;

  const resultado = useMemo(() => {
    if (!podeCalcular) return null;
    return calcularFerias({
      salario,
      diasGozo: gozo,
      diasAbono: abono,
      mediaVariaveis
    });
  }, [podeCalcular, salario, gozo, abono, mediaVariaveis]);

  function resumoTexto() {
    if (!resultado) return '';
    const linhas = resultado.resumoLinhas
      .map((l) => `• ${l.label}: ${formatCurrency(l.value)}${l.info ? ` (${l.info})` : ''}`)
      .join('\n');
    return [
      '*FÉRIAS CLT | ESTIMATIVA*',
      '',
      '*VERBAS*',
      linhas,
      '',
      `*TOTAL BRUTO ESTIMADO*`,
      formatCurrency(resultado.totalBruto),
      '',
      'Estimativa educativa, sem descontos de INSS/IRRF. Confirme com um contador.'
    ].join('\n') + viralToolShareFooter('/calculadora-de-ferias', 'ferias_whatsapp');
  }

  function handleCopy() {
    if (!resultado) return;
    navigator.clipboard.writeText(resumoTexto());
    trackEvent('share_result', {
      method: 'copy',
      tool_path: '/calculadora-de-ferias',
      campaign: 'ferias_whatsapp'
    });
    toast('Resumo copiado!');
  }

  function handleWhatsApp() {
    if (!resultado) return;
    trackEvent('share_result', {
      method: 'whatsapp',
      tool_path: '/calculadora-de-ferias',
      campaign: 'ferias_whatsapp'
    });
    setWhatsAppOpen(true);
  }

  return (
    <AuthGate
      title="Calculadora de Férias"
      description="Cadastre-se gratuitamente para calcular suas férias."
      publicAccess={publicAccess}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <ToolsBackButton href={publicAccess ? '/recursos' : '/ferramentas'} />
        </div>

        <PageHero
          title="Calculadora de Férias CLT"
          subtitle="Estime férias, 1/3 constitucional e abono pecuniário em segundos. Valores aproximados: confirme com um profissional."
          icon={Sun}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <FormField label="Salário bruto mensal" htmlFor="salario-ferias" required>
              <Input
                id="salario-ferias"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={salarioInput}
                onChange={(e) => setSalarioInput(formatCurrencyInput(e.target.value))}
              />
            </FormField>
            <FormField
              label="Média de variáveis (opcional)"
              htmlFor="media-ferias"
              hint="Horas extras, comissões e adicionais habituais."
            >
              <Input
                id="media-ferias"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={mediaInput}
                onChange={(e) => setMediaInput(formatCurrencyInput(e.target.value))}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Dias de férias" htmlFor="dias-gozo" required>
                <Input
                  id="dias-gozo"
                  type="number"
                  min={1}
                  max={30}
                  value={diasGozo}
                  onChange={(e) => setDiasGozo(e.target.value)}
                />
              </FormField>
              <FormField
                label="Dias de abono (vender)"
                htmlFor="dias-abono"
                hint="Até 10 dias (1/3 do período)."
              >
                <Input
                  id="dias-abono"
                  type="number"
                  min={0}
                  max={10}
                  value={diasAbono}
                  onChange={(e) => setDiasAbono(e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                <Calculator className="h-4 w-4" aria-hidden />
              </span>
              <h2 className="rj-display text-base font-bold text-slate-900">Resultado estimado</h2>
            </div>

            {!resultado ? (
              <p className="text-sm leading-6 text-slate-500">
                Informe o salário e os dias de férias para ver o total bruto estimado.
              </p>
            ) : (
              <div className="space-y-3">
                <ul className="divide-y divide-slate-100 text-sm">
                  {resultado.resumoLinhas.map((linha) => (
                    <li key={linha.label} className="flex items-center justify-between gap-3 py-2">
                      <div>
                        <p className="font-semibold text-slate-800">{linha.label}</p>
                        {linha.info ? <p className="text-xs text-slate-500">{linha.info}</p> : null}
                      </div>
                      <span className="shrink-0 font-bold text-slate-900">{formatCurrency(linha.value)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                  <span className="text-sm font-semibold">Total bruto estimado</span>
                  <span className="rj-display text-lg font-bold">{formatCurrency(resultado.totalBruto)}</span>
                </div>
                <p className="text-xs leading-5 text-slate-500">
                  Valores brutos, sem descontos. Estimativa educativa. Não substitui holerite nem orientação contábil.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleCopy}>
                    <Copy className="mr-1.5 h-4 w-4" aria-hidden />
                    Copiar
                  </Button>
                  <Button size="sm" className="flex-1 sm:flex-none" onClick={handleWhatsApp}>
                    <MessageCircle className="mr-1.5 h-4 w-4" aria-hidden />
                    WhatsApp
                  </Button>
                </div>
                <ResultShareCard
                  eyebrow="Cálculo de Férias"
                  title="Férias estimadas"
                  highlightLabel="Total bruto estimado"
                  highlightValue={formatCurrency(resultado.totalBruto)}
                  lines={resultado.resumoLinhas.map((l) => ({
                    label: l.label,
                    value: formatCurrency(l.value)
                  }))}
                  toolPath="/calculadora-de-ferias"
                  utmCampaign="ferias_card"
                  fileNameHint="calculo-ferias"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <WhatsAppSendModal
        open={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        message={resumoTexto()}
        destinationHint="WhatsApp que receberá a estimativa"
      />
    </AuthGate>
  );
}
