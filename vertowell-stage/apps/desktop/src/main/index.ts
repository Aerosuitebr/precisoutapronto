import { app, BrowserWindow, desktopCapturer, ipcMain, session } from "electron";
import { join } from "node:path";

interface AiConnectionInput { id: string; baseUrl: string; model: string; transcriptionModel?: string; apiKey?: string; requiresApiKey: boolean; }
interface ActiveAiConnection extends Omit<AiConnectionInput, "apiKey"> { apiKey?: string; }
interface AiSuggestionInput { requestId: string; question: string; language: string; context: string; task?: "interview" | "translate"; evidence: Array<{ type: string; fileName: string; excerpt: string }>; }

let activeAiConnection: ActiveAiConnection | undefined;
const suggestionControllers = new Map<string, AbortController>();

function checkedBaseUrl(value: string): URL {
  const url = new URL(value);
  const loopback = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) throw new Error("Use HTTPS ou um endpoint local.");
  return url;
}

ipcMain.handle("vertowell:ai:check", async (_event, input: AiConnectionInput) => {
  const startedAt = performance.now();
  try {
    const baseUrl = checkedBaseUrl(input.baseUrl);
    if (!input.model.trim()) throw new Error("Informe o modelo da IA.");
    if (input.requiresApiKey && !input.apiKey?.trim()) throw new Error("A chave de API é obrigatória.");
    const response = await fetch(new URL("v1/models", `${baseUrl.toString().replace(/\/$/, "")}/`), {
      headers: input.apiKey ? { authorization: `Bearer ${input.apiKey}` } : {},
      signal: AbortSignal.timeout(8_000)
    });
    if (!response.ok) return { ok: false, message: response.status === 401 ? "Chave de API inválida ou sem acesso." : `Falha de conexão (HTTP ${response.status}).` };
    activeAiConnection = { id: input.id, baseUrl: baseUrl.toString(), model: input.model.trim(), transcriptionModel: input.transcriptionModel?.trim(), requiresApiKey: input.requiresApiKey, apiKey: input.apiKey };
    return { ok: true, message: "Conexão validada no processo seguro do desktop.", latencyMs: Math.round(performance.now() - startedAt) };
  } catch (error) {
    activeAiConnection = undefined;
    return { ok: false, message: error instanceof Error ? error.message : "Não foi possível validar a conexão." };
  }
});

ipcMain.handle("vertowell:ai:disconnect", () => { activeAiConnection = undefined; });
ipcMain.handle("vertowell:ai:suggest:cancel", (_event, requestId: string) => {
  suggestionControllers.get(requestId)?.abort();
  suggestionControllers.delete(requestId);
});

ipcMain.handle("vertowell:ai:suggest", async (_event, input: AiSuggestionInput) => {
  const connection = activeAiConnection;
  if (!connection) return { ok: false, message: "Conecte e valide a IA antes de solicitar uma resposta." };
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  suggestionControllers.set(input.requestId, controller);
  try {
    const evidence = input.evidence.map((item, index) => `[${index + 1}] ${item.type} (${item.fileName}): ${item.excerpt}`).join("\n");
    const response = await fetch(new URL("v1/chat/completions", `${connection.baseUrl.replace(/\/$/, "")}/`), {
      method: "POST",
      headers: { "content-type": "application/json", ...(connection.apiKey ? { authorization: `Bearer ${connection.apiKey}` } : {}) },
      body: JSON.stringify({ model: connection.model, temperature: 0.2, stream: false, messages: [
        { role: "system", content: input.task === "translate" ? "Traduza fielmente a fala para o idioma solicitado. Preserve intenção, tom, nomes e termos técnicos. Retorne somente a tradução, sem comentários." : "Você é um copiloto de entrevista. Responda de forma natural e concisa no idioma pedido. Use os fatos fornecidos, nunca atribua ao candidato experiência que não esteja nas evidências. Quando não houver experiência comprovada, explique o conceito corretamente e apresente qualquer exemplo apenas como cenário hipotético." },
        { role: "user", content: `Idioma: ${input.language}\nContexto: ${input.context || "Não informado"}\nPergunta: ${input.question}\nEvidências:\n${evidence || "Nenhuma evidência localizada."}` }
      ] }),
      signal: controller.signal
    });
    if (!response.ok) return { ok: false, message: `A IA respondeu com HTTP ${response.status}.` };
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) return { ok: false, message: "A IA retornou uma resposta vazia." };
    return { ok: true, text, latencyMs: Math.round(performance.now() - startedAt), basis: input.evidence.length ? "evidence" : "general-knowledge", evidenceCount: input.evidence.length };
  } catch (error) { return { ok: false, message: controller.signal.aborted ? "Solicitação substituída por uma fala mais recente." : error instanceof Error ? error.message : "Falha ao gerar resposta." }; }
  finally { clearTimeout(timeout); if (suggestionControllers.get(input.requestId) === controller) suggestionControllers.delete(input.requestId); }
});

ipcMain.handle("vertowell:ai:transcribe", async (_event, input: { bytes: Uint8Array; mimeType: string; language: string }) => {
  const connection = activeAiConnection;
  if (!connection) return { ok: false, message: "Conecte e valide a IA antes de transcrever." };
  if (!connection.transcriptionModel) return { ok: false, message: "Informe um modelo de transcrição na configuração da IA." };
  try {
    const extension = input.mimeType.includes("ogg") ? "ogg" : input.mimeType.includes("mp4") ? "m4a" : "webm";
    const form = new FormData();
    form.set("model", connection.transcriptionModel);
    form.set("language", input.language.split("-")[0] ?? input.language);
    const audio = Uint8Array.from(input.bytes);
    form.set("file", new Blob([audio.buffer], { type: input.mimeType }), `turn.${extension}`);
    const response = await fetch(new URL("v1/audio/transcriptions", `${connection.baseUrl.replace(/\/$/, "")}/`), { method: "POST", headers: connection.apiKey ? { authorization: `Bearer ${connection.apiKey}` } : {}, body: form, signal: AbortSignal.timeout(15_000) });
    if (!response.ok) return { ok: false, message: `A transcrição respondeu com HTTP ${response.status}.` };
    const payload = await response.json() as { text?: string };
    return payload.text?.trim() ? { ok: true, text: payload.text.trim() } : { ok: false, message: "A transcrição retornou texto vazio." };
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : "Falha na transcrição." }; }
});

function createWindow() {
  const window = new BrowserWindow({
    width: 1120,
    height: 820,
    minWidth: 760,
    minHeight: 640,
    backgroundColor: "#07111f",
    title: "Vertowell",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) window.loadURL(process.env.ELECTRON_RENDERER_URL);
  else window.loadFile(join(__dirname, "../renderer/index.html"));
}

app.whenReady().then(() => {
  session.defaultSession.setDisplayMediaRequestHandler((_request, callback) => {
    void desktopCapturer.getSources({ types: ["screen"], thumbnailSize: { width: 0, height: 0 } }).then((sources) => {
      const screen = sources[0];
      if (!screen) return callback({});
      callback({ video: screen, ...(process.platform === "win32" ? { audio: "loopback" as const } : {}) });
    }).catch(() => callback({}));
  });
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(permission === "media" || permission === "display-capture");
  });
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
