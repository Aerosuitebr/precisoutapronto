declare module "@vertowell/ui/styles.css";

interface Window {
  vertowell?: {
    platform?: string;
    version?: string;
    ai?: {
      check(input: { id: string; baseUrl: string; model: string; transcriptionModel?: string; apiKey?: string; requiresApiKey: boolean }): Promise<{ ok: boolean; message: string; latencyMs?: number }>;
      disconnect(): Promise<void>;
      suggest(input: { requestId: string; question: string; language: string; context: string; task?: "interview" | "translate"; evidence: Array<{ type: string; fileName: string; excerpt: string }> }): Promise<{ ok: boolean; text?: string; message?: string; latencyMs?: number; basis?: "evidence" | "general-knowledge"; evidenceCount?: number }>;
      cancelSuggestion(requestId: string): Promise<void>;
      transcribe(input: { bytes: Uint8Array; mimeType: string; language: string }): Promise<{ ok: boolean; text?: string; message?: string }>;
    };
  };
}
