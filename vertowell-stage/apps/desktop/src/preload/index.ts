import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("vertowell", {
  platform: process.platform,
  version: "0.0.0",
  ai: {
    check: (input: { id: string; baseUrl: string; model: string; transcriptionModel?: string; apiKey?: string; requiresApiKey: boolean }) => ipcRenderer.invoke("vertowell:ai:check", input),
    disconnect: () => ipcRenderer.invoke("vertowell:ai:disconnect"),
    suggest: (input: { requestId: string; question: string; language: string; context: string; task?: "interview" | "translate"; evidence: Array<{ type: string; fileName: string; excerpt: string }> }): Promise<{ ok: boolean; text?: string; message?: string; latencyMs?: number; basis?: "evidence" | "general-knowledge"; evidenceCount?: number }> => ipcRenderer.invoke("vertowell:ai:suggest", input),
    cancelSuggestion: (requestId: string): Promise<void> => ipcRenderer.invoke("vertowell:ai:suggest:cancel", requestId),
    transcribe: (input: { bytes: Uint8Array; mimeType: string; language: string }) => ipcRenderer.invoke("vertowell:ai:transcribe", input)
  }
});
