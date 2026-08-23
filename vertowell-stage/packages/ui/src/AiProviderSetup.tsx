import { useMemo, useRef, useState } from "react";
import { OpenAiCompatibleUserProvider, providerSetupGuides, type ProviderSetupId, type UserAiConnection } from "@vertowell/realtime-gateway";

declare global {
  interface Window {
    vertowell?: {
      platform?: string;
      version?: string;
      ai?: {
        check(input: { id: string; baseUrl: string; model: string; transcriptionModel?: string; apiKey?: string; requiresApiKey: boolean }): Promise<{ ok: boolean; message: string; latencyMs?: number }>;
        disconnect(): Promise<void>;
        suggest(input: AiSuggestionInput & { requestId: string }): Promise<AiSuggestionResult>;
        cancelSuggestion(requestId: string): Promise<void>;
        transcribe(input: { bytes: Uint8Array; mimeType: string; language: string }): Promise<{ ok: boolean; text?: string; message?: string }>;
      };
    };
  }
}

export interface AiSuggestionInput { question: string; language: string; context: string; task?: "interview" | "translate"; evidence: Array<{ type: string; fileName: string; excerpt: string }>; }
export interface AiSuggestionResult { ok: boolean; text?: string; message?: string; latencyMs?: number; basis?: "evidence" | "general-knowledge"; evidenceCount?: number; }
export type AiSuggest = (input: AiSuggestionInput, signal?: AbortSignal) => Promise<AiSuggestionResult>;
export interface AiProviderSetupProps { onReadyChange(ready: boolean, suggest?: AiSuggest): void; }

export function AiProviderSetup({ onReadyChange }: AiProviderSetupProps) {
  const [providerId, setProviderId] = useState<ProviderSetupId>("openai");
  const guide = providerSetupGuides[providerId];
  const [baseUrl, setBaseUrl] = useState(guide.defaultBaseUrl);
  const [model, setModel] = useState("");
  const [transcriptionModel, setTranscriptionModel] = useState("gpt-transcribe");
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "ready" | "error">("idle");
  const [message, setMessage] = useState("Configure e valide a IA antes de iniciar.");
  const [latencyMs, setLatencyMs] = useState<number>();
  const keyRef = useRef<HTMLInputElement>(null);
  const options = useMemo(() => Object.values(providerSetupGuides), []);

  function resetConnection(nextId?: ProviderSetupId) {
    const next = providerSetupGuides[nextId ?? providerId];
    setStatus("idle"); setMessage("Configuração alterada. Teste novamente."); setLatencyMs(undefined);
    onReadyChange(false, undefined);
    void window.vertowell?.ai?.disconnect();
    if (nextId) { setProviderId(nextId); setBaseUrl(next.defaultBaseUrl); setModel(""); setApiKey(""); }
  }

  async function checkConnection() {
    setStatus("checking"); setMessage("Validando credencial, modelo e latência…"); onReadyChange(false);
    try {
      const connection: UserAiConnection = {
        id: providerId, label: guide.label, baseUrl, model,
        auth: guide.requiresApiKey ? "api-key" : apiKey ? "api-key" : "none",
        source: providerId === "openai" ? "openai" : providerId === "cursor-byok" ? "cursor-byok" : providerId === "local-openai-compatible" ? "local" : "openai-compatible"
      };
      const provider = new OpenAiCompatibleUserProvider(connection, apiKey || undefined);
      const result = window.vertowell?.ai
        ? await window.vertowell.ai.check({ id: connection.id, baseUrl, model, transcriptionModel: transcriptionModel.trim() || undefined, apiKey: apiKey || undefined, requiresApiKey: guide.requiresApiKey })
        : await provider.check();
      const suggest: AiSuggest | undefined = result.ok ? (window.vertowell?.ai
        ? async (input, signal) => {
            const requestId = crypto.randomUUID();
            const cancel = () => { void window.vertowell!.ai!.cancelSuggestion(requestId); };
            if (signal?.aborted) cancel(); else signal?.addEventListener("abort", cancel, { once: true });
            try { return await window.vertowell!.ai!.suggest({ ...input, requestId }); }
            finally { signal?.removeEventListener("abort", cancel); }
          }
        : async (input, signal) => {
            try {
              const response = await provider.suggest({ sessionId: crypto.randomUUID(), turnId: crypto.randomUUID(), question: input.question, language: input.language, context: input.context, task: input.task, evidence: input.evidence.map((item) => ({ ...item, type: item.type as "cv" | "job-description" | "candidate-context", startOffset: 0, endOffset: item.excerpt.length })), deadlineMs: 12_000 }, signal ?? new AbortController().signal);
              return { ok: true, text: response.text, latencyMs: response.latencyMs, basis: response.evidence.length ? "evidence" : "general-knowledge", evidenceCount: response.evidence.length };
            } catch (error) { return { ok: false, message: error instanceof Error ? error.message : "Falha ao gerar resposta." }; }
          }) : undefined;
      setStatus(result.ok ? "ready" : "error"); setMessage(result.message); setLatencyMs(result.latencyMs); onReadyChange(result.ok, suggest);
      if (result.ok && window.vertowell?.ai) setApiKey("");
    } catch (error) {
      setStatus("error"); setMessage(error instanceof Error ? error.message : "Configuração inválida.");
    }
  }

  return <section className={`ai-setup ${status}`}>
    <header><div><span>IA FORNECEDORA</span><strong>{status === "ready" ? "Conectada" : "Configuração obrigatória"}</strong></div><i aria-hidden="true">{status === "ready" ? "✓" : "⚙"}</i></header>
    <div className="ai-fields">
      <label>Provedor<select value={providerId} onChange={(event) => resetConnection(event.target.value as ProviderSetupId)}>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
      <label>Modelo<input value={model} onChange={(event) => { setModel(event.target.value); resetConnection(); }} placeholder="Identificador exato do modelo" /></label>
      <label>Modelo de transcrição<input value={transcriptionModel} onChange={(event) => { setTranscriptionModel(event.target.value); resetConnection(); }} placeholder="Ex.: gpt-transcribe" /></label>
      <label className="wide">URL base<input value={baseUrl} onChange={(event) => { setBaseUrl(event.target.value); resetConnection(); }} placeholder="https://api.provedor.com" /></label>
      {(guide.requiresApiKey || providerId === "local-openai-compatible") && <label className="wide">{guide.credentialLabel}<input ref={keyRef} type="password" autoComplete="off" value={apiKey} onChange={(event) => { setApiKey(event.target.value); resetConnection(); }} placeholder={guide.requiresApiKey ? "Cole a chave secreta" : "Opcional"} /></label>}
    </div>
    <details><summary>Como configurar esta integração</summary><ol>{guide.instructions.map((step) => <li key={step}>{step}</li>)}</ol>{guide.docsUrl && <a href={guide.docsUrl} target="_blank" rel="noreferrer">Abrir página oficial para obter a credencial ↗</a>}{guide.warning && <p className="ai-warning">{guide.warning}</p>}</details>
    <div className="ai-check"><p><b>{message}</b>{latencyMs !== undefined && <small>Latência do teste: {latencyMs} ms</small>}</p><button type="button" onClick={() => void checkConnection()} disabled={status === "checking" || !baseUrl.trim() || !model.trim() || (guide.requiresApiKey && !apiKey.trim())}>{status === "checking" ? "Testando…" : "Testar conexão"}</button></div>
    <p className="secret-note">{window.vertowell?.ai ? "No desktop, a chave sai do formulário após a validação e permanece somente no processo principal isolado." : "Na versão web, a chave permanece somente na memória desta sessão."} Ela não entra no currículo, logs ou estado persistente.</p>
  </section>;
}
