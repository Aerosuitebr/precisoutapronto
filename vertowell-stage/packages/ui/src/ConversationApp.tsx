import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { buildAnswerOutline, conversationReducer, initialConversationState } from "@vertowell/core";
import type { AnswerEvidence, ConversationContext, RecordedAnswerContext } from "@vertowell/contracts";
import { extractCv, retrieveGroundingSources, type ExtractedCv, type GroundingDocument } from "@vertowell/cv";
import { AiProviderSetup } from "./AiProviderSetup";
import type { AiSuggest } from "./AiProviderSetup";
import { remainingTurnSilence, REMOTE_AUDIO_CHUNK_MS, TURN_SILENCE_MS } from "./realtimeTiming";
import { readSessionPreferences, writeSessionPreferences } from "./sessionPreferences";
import { useLiveTranscription } from "./useLiveTranscription";

const languages = [
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "en-US", label: "English (US)" },
  { code: "es-ES", label: "Español" },
  { code: "fr-FR", label: "Français" }
];

export function ConversationApp() {
  const [savedPreferences] = useState(() => readSessionPreferences(window.localStorage));
  const [state, dispatch] = useReducer(conversationReducer, {
    ...initialConversationState,
    ...(savedPreferences ? { mode: savedPreferences.mode, sourceLanguage: savedPreferences.sourceLanguage, targetLanguage: savedPreferences.targetLanguage, context: savedPreferences.context, recordedAnswer: savedPreferences.recordedAnswer } : {})
  });
  const [level, setLevel] = useState(0);
  const [showContext, setShowContext] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState<string>();
  const [cv, setCv] = useState<ExtractedCv>();
  const [cvStatus, setCvStatus] = useState<"idle" | "reading" | "ready" | "error">("idle");
  const [cvError, setCvError] = useState<string>();
  const [jobDescription, setJobDescription] = useState(savedPreferences?.jobDescription ?? "");
  const [candidateContext, setCandidateContext] = useState(savedPreferences?.candidateContext ?? "");
  const [aiReady, setAiReady] = useState(false);
  const [aiSuggest, setAiSuggest] = useState<AiSuggest>();
  const [heardQuestion, setHeardQuestion] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState<"idle" | "loading" | "error">("idle");
  const [suggestionMeta, setSuggestionMeta] = useState("");
  const [suggestionBasis, setSuggestionBasis] = useState<"evidence" | "general-knowledge">();
  const [automaticSuggestions, setAutomaticSuggestions] = useState(savedPreferences?.automaticSuggestions ?? true);
  const [audioSource, setAudioSource] = useState<"microphone" | "system">(savedPreferences?.audioSource ?? "microphone");
  const [conversationHistory, setConversationHistory] = useState<Array<{ question: string; answer: string }>>([]);
  const [automaticSpeech, setAutomaticSpeech] = useState(savedPreferences?.automaticSpeech ?? true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [translationHistory, setTranslationHistory] = useState<Array<{ source: string; translated: string; from: string; to: string }>>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);
  const timeoutRef = useRef<number>(0);
  const recordingUrlRef = useRef<string | undefined>(undefined);
  const frameRef = useRef<number>(0);
  const remoteRecorderRef = useRef<MediaRecorder | null>(null);
  const remoteTimerRef = useRef<number>(0);
  const remoteWantedRef = useRef(false);
  const remoteQueueRef = useRef<Promise<void>>(Promise.resolve());
  const transcriptRef = useRef("");
  const lastVoiceAtRef = useRef(0);
  const turnTimerRef = useRef<number>(0);
  const suggestionRequestRef = useRef(0);
  const suggestionAbortRef = useRef<AbortController>();
  const conversationActiveRef = useRef(false);

  useEffect(() => () => {
    cancelAnimationFrame(frameRef.current);
    window.clearInterval(timerRef.current);
    window.clearTimeout(timeoutRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    void contextRef.current?.close();
    if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    remoteWantedRef.current = false;
    suggestionAbortRef.current?.abort();
    window.clearTimeout(turnTimerRef.current);
    if (remoteRecorderRef.current?.state === "recording") remoteRecorderRef.current.stop();
  }, []);

  useEffect(() => {
    writeSessionPreferences(window.localStorage, {
      version: 1,
      mode: state.mode,
      sourceLanguage: state.sourceLanguage,
      targetLanguage: state.targetLanguage,
      audioSource,
      automaticSpeech,
      automaticSuggestions,
      jobDescription,
      candidateContext,
      context: state.context,
      recordedAnswer: state.recordedAnswer
    });
  }, [audioSource, automaticSpeech, automaticSuggestions, candidateContext, jobDescription, state.context, state.mode, state.recordedAnswer, state.sourceLanguage, state.targetLanguage]);

  function scheduleTurnCompletion() {
    window.clearTimeout(turnTimerRef.current);
    const check = () => {
      const remainingSilence = remainingTurnSilence(lastVoiceAtRef.current);
      if (remainingSilence > 0) { turnTimerRef.current = window.setTimeout(check, remainingSilence); return; }
      const completedTurn = transcriptRef.current.trim();
      if (!completedTurn) return;
      transcriptRef.current = "";
      if (state.mode === "translate") void generateSuggestion(completedTurn, "translate");
      else if (automaticSuggestions) void generateSuggestion(completedTurn);
    };
    turnTimerRef.current = window.setTimeout(check, TURN_SILENCE_MS);
  }

  function startRemoteTranscription(stream: MediaStream) {
    const transcribe = window.vertowell?.ai?.transcribe;
    if (!transcribe || !remoteWantedRef.current || stream.getAudioTracks().every((track) => track.readyState === "ended")) return;
    const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"].find((type) => MediaRecorder.isTypeSupported(type));
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    remoteRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = () => {
      window.clearTimeout(remoteTimerRef.current);
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      if (remoteWantedRef.current) startRemoteTranscription(stream);
      if (!remoteWantedRef.current || !blob.size) return;
      remoteQueueRef.current = remoteQueueRef.current.then(async () => {
        const result = await transcribe({ bytes: new Uint8Array(await blob.arrayBuffer()), mimeType: blob.type, language: state.sourceLanguage });
        if (!result.ok || !result.text) return;
        transcriptRef.current = `${transcriptRef.current} ${result.text}`.trim();
        setHeardQuestion(transcriptRef.current);
        scheduleTurnCompletion();
      });
    };
    recorder.start();
    remoteTimerRef.current = window.setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, REMOTE_AUDIO_CHUNK_MS);
  }

  async function start() {
    dispatch({ type: "permission-requested" });
    try {
      const captured = audioSource === "system"
        ? await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
        : await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      if (audioSource === "system") captured.getVideoTracks().forEach((track) => track.stop());
      if (captured.getAudioTracks().length === 0) { captured.getTracks().forEach((track) => track.stop()); throw new Error("Nenhuma faixa de áudio foi disponibilizada."); }
      const stream = new MediaStream(captured.getAudioTracks());
      streamRef.current = stream;
      const context = new AudioContext();
      contextRef.current = context;
      const analyser = context.createAnalyser();
      context.createMediaStreamSource(stream).connect(analyser);
      const samples = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        analyser.getByteTimeDomainData(samples);
        const peak = samples.reduce((max, value) => Math.max(max, Math.abs(value - 128)), 0);
        if (peak > 5) lastVoiceAtRef.current = Date.now();
        setLevel(Math.min(100, peak * 2.5));
        frameRef.current = requestAnimationFrame(draw);
      };
      draw();
      if (isRecordedAnswer) {
        const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"].find((type) => MediaRecorder.isTypeSupported(type));
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recorderRef.current = recorder;
        chunksRef.current = [];
        if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
        recordingUrlRef.current = undefined;
        setRecordingUrl(undefined);
        setElapsedSeconds(0);
        recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          const url = URL.createObjectURL(blob);
          recordingUrlRef.current = url;
          setRecordingUrl(url);
        };
        recorder.start(250);
        timerRef.current = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
        timeoutRef.current = window.setTimeout(stop, state.recordedAnswer.timeLimitSeconds * 1000);
      }
      if ((isCopilot || state.mode === "translate") && audioSource === "microphone") transcription.start();
      if ((isCopilot || state.mode === "translate") && audioSource === "system") { remoteWantedRef.current = true; transcriptRef.current = heardQuestion; startRemoteTranscription(stream); }
      conversationActiveRef.current = true;
      dispatch({ type: "started" });
    } catch { dispatch({ type: "failed", message: "Não foi possível acessar o microfone." }); }
  }

  function stop() {
    transcription.stop();
    suggestionRequestRef.current += 1;
    suggestionAbortRef.current?.abort();
    suggestionAbortRef.current = undefined;
    conversationActiveRef.current = false;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    remoteWantedRef.current = false;
    window.clearTimeout(turnTimerRef.current);
    window.clearTimeout(remoteTimerRef.current);
    if (remoteRecorderRef.current?.state === "recording") remoteRecorderRef.current.stop();
    cancelAnimationFrame(frameRef.current);
    window.clearInterval(timerRef.current);
    window.clearTimeout(timeoutRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void contextRef.current?.close();
    contextRef.current = null;
    setLevel(0);
    dispatch({ type: "stopped" });
  }

  function updateContext(field: keyof ConversationContext, value: string) {
    dispatch({ type: "context-changed", context: { ...state.context, [field]: value } as ConversationContext });
  }

  function swapTranslationLanguages() {
    suggestionRequestRef.current += 1;
    suggestionAbortRef.current?.abort();
    suggestionAbortRef.current = undefined;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setHeardQuestion("");
    setSuggestion("");
    setSuggestionMeta("");
    setSuggestionStatus("idle");
    transcriptRef.current = "";
    dispatch({ type: "languages-changed", source: state.targetLanguage, target: state.sourceLanguage });
  }

  function updateRecordedAnswer(field: keyof RecordedAnswerContext, value: string | number) {
    dispatch({ type: "recorded-answer-changed", context: { ...state.recordedAnswer, [field]: value } });
  }

  function updateEvidence(field: keyof AnswerEvidence, value: string) {
    dispatch({ type: "recorded-answer-changed", context: { ...state.recordedAnswer, evidence: { ...state.recordedAnswer.evidence, [field]: value } } });
  }

  async function importCv(file?: File) {
    if (!file) return;
    setCvStatus("reading");
    setCvError(undefined);
    try {
      const extracted = await extractCv(file);
      setCv(extracted);
      setCvStatus("ready");
    } catch (error) {
      setCv(undefined);
      setCvStatus("error");
      setCvError(error instanceof Error ? error.message : "Não foi possível ler o currículo.");
    }
  }

  async function generateSuggestion(question: string, task: "interview" | "translate" = "interview") {
    if (!aiSuggest || !question.trim()) return;
    suggestionAbortRef.current?.abort();
    const controller = new AbortController();
    suggestionAbortRef.current = controller;
    const requestId = ++suggestionRequestRef.current;
    setSuggestionStatus("loading"); setSuggestion(""); setSuggestionMeta(""); setSuggestionBasis(undefined);
    const result = await aiSuggest({
      question: question.trim(), language: task === "translate" ? state.targetLanguage : state.sourceLanguage, task,
      context: task === "translate" ? `Idioma de destino: ${state.targetLanguage}` : [state.context.objective, state.context.audience, state.context.tone, state.context.instructions, state.recordedAnswer.role, state.recordedAnswer.company, jobDescription, candidateContext, ...conversationHistory.slice(-4).map((turn) => `Pergunta anterior: ${turn.question}\nResposta anterior: ${turn.answer}`)].filter(Boolean).join("\n"),
      evidence: task === "translate" ? [] : groundingSources.map(({ type, fileName, excerpt }) => ({ type, fileName, excerpt }))
    }, controller.signal);
    if (requestId !== suggestionRequestRef.current) return;
    suggestionAbortRef.current = undefined;
    if (result.ok && result.text) { setSuggestion(result.text); setSuggestionStatus("idle"); setSuggestionBasis(task === "translate" ? undefined : result.basis); setSuggestionMeta(task === "translate" ? (result.latencyMs === undefined ? "Tradução concluída" : `Traduzido em ${result.latencyMs} ms`) : `${result.latencyMs === undefined ? "Resposta gerada" : `Gerada em ${result.latencyMs} ms`} · ${result.evidenceCount ?? 0} evidência(s)`); if (task === "translate") { setTranslationHistory((history) => [...history, { source: question.trim(), translated: result.text!, from: state.sourceLanguage, to: state.targetLanguage }].slice(-12)); if (automaticSpeech) speakTranslation(result.text); } if (isCopilot) setConversationHistory((history) => [...history, { question: question.trim(), answer: result.text! }].slice(-6)); }
    else { setSuggestionStatus("error"); setSuggestionMeta(result.message || "Não foi possível gerar a resposta."); }
  }

  function speakTranslation(text: string) {
    if (!("speechSynthesis" in window) || !text.trim()) return;
    window.speechSynthesis.cancel();
    transcription.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.targetLanguage;
    const language = state.targetLanguage.toLowerCase();
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase() === language) ?? window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith(language.split("-")[0] ?? language));
    if (voice) utterance.voice = voice;
    utterance.rate = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = utterance.onerror = () => { setIsSpeaking(false); window.setTimeout(() => { if (conversationActiveRef.current && state.mode === "translate" && audioSource === "microphone") transcription.start(); }, 250); };
    window.speechSynthesis.speak(utterance);
  }

  const isCopilot = state.mode === "copilot";
  const isRecordedAnswer = state.mode === "recorded-answer";
  const usesSameLanguage = isCopilot || isRecordedAnswer;
  const candidateContextReady = Boolean(cv && jobDescription.trim());
  const interviewReady = aiReady && candidateContextReady && (!isRecordedAnswer || Boolean(state.recordedAnswer.question.trim()));
  const isActive = state.status === "listening";
  const remainingSeconds = Math.max(0, state.recordedAnswer.timeLimitSeconds - elapsedSeconds);
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const outline = useMemo(() => buildAnswerOutline(state.recordedAnswer), [state.recordedAnswer]);
  const groundingSources = useMemo(() => {
    const documents: GroundingDocument[] = [];
    if (cv) documents.push({ type: "cv", name: cv.fileName, text: cv.text });
    if (jobDescription.trim()) documents.push({ type: "job-description", name: "Descrição da vaga", text: jobDescription });
    if (candidateContext.trim()) documents.push({ type: "candidate-context", name: "Subsídios do candidato", text: candidateContext });
    return retrieveGroundingSources(isCopilot ? heardQuestion : state.recordedAnswer.question, documents, 4);
  }, [candidateContext, cv, heardQuestion, isCopilot, jobDescription, state.recordedAnswer.question]);
  const transcription = useLiveTranscription(
    state.sourceLanguage,
    (text) => setHeardQuestion(text),
    (text) => { setHeardQuestion(text); if (state.mode === "translate") void generateSuggestion(text, "translate"); else if (automaticSuggestions) void generateSuggestion(text); }
  );

  useEffect(() => {
    if (!isActive || state.mode !== "translate") return;
    transcriptRef.current = "";
    if (audioSource === "microphone") {
      transcription.stop();
      transcription.start();
      return;
    }
    remoteWantedRef.current = false;
    window.clearTimeout(remoteTimerRef.current);
    if (remoteRecorderRef.current?.state === "recording") remoteRecorderRef.current.stop();
    const restartTimer = window.setTimeout(() => {
      const stream = streamRef.current;
      if (!stream || !conversationActiveRef.current) return;
      remoteWantedRef.current = true;
      startRemoteTranscription(stream);
    }, 0);
    return () => window.clearTimeout(restartTimer);
  }, [state.sourceLanguage]);

  return (
    <main className="shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">V</span><span>Vertowell</span></div><span className="privacy">Áudio privado · não armazenado</span></header>

      <section className="hero compact">
        <p className="eyebrow">INTELIGÊNCIA PARA CONVERSAS EM TEMPO REAL</p>
        <h1>{isRecordedAnswer ? <>Organize suas ideias.<br /><span>Responda com clareza.</span></> : isCopilot ? <>Ouça melhor.<br /><span>Responda melhor.</span></> : <>Fale naturalmente.<br /><span>Seja compreendido.</span></>}</h1>
        <p className="lead">{isRecordedAnswer ? "Prepare e ensaie uma resposta autêntica antes de gravar." : isCopilot ? "Sugestões relevantes, no seu idioma e dentro do seu contexto." : "Uma conversa fluida, mesmo quando vocês falam idiomas diferentes."}</p>
      </section>

      <section className="conversation-card">
        <div className="mode-switch" role="tablist" aria-label="Modo da conversa">
          <button role="tab" aria-selected={state.mode === "translate"} className={state.mode === "translate" ? "selected" : ""} onClick={() => dispatch({ type: "mode-changed", mode: "translate" })}>Traduzir</button>
          <button role="tab" aria-selected={isCopilot} className={isCopilot ? "selected" : ""} onClick={() => dispatch({ type: "mode-changed", mode: "copilot" })}>Copiloto</button>
          <button role="tab" aria-selected={isRecordedAnswer} className={isRecordedAnswer ? "selected" : ""} onClick={() => dispatch({ type: "mode-changed", mode: "recorded-answer" })}>Resposta gravada</button>
        </div>

        {usesSameLanguage ? (
          <div className="copilot-settings">
            <label>Idioma da conversa<select value={state.sourceLanguage} onChange={(event) => dispatch({ type: "languages-changed", source: event.target.value, target: event.target.value })}>{languages.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}</select></label>
            {!isRecordedAnswer && <button className="context-toggle" onClick={() => setShowContext((open) => !open)}>{showContext ? "Ocultar contexto" : state.context.objective ? "Editar contexto" : "Definir contexto"}</button>}
          </div>
        ) : (
          <div className="language-grid">
            <label>Eu falo<select value={state.sourceLanguage} onChange={(event) => dispatch({ type: "languages-changed", source: event.target.value, target: state.targetLanguage })}>{languages.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}</select></label>
            <button className="swap" aria-label="Inverter idiomas" onClick={swapTranslationLanguages}>⇄</button>
            <label>Meu interlocutor ouve<select value={state.targetLanguage} onChange={(event) => dispatch({ type: "languages-changed", source: state.sourceLanguage, target: event.target.value })}>{languages.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}</select></label>
          </div>
        )}

        {(isCopilot || state.mode === "translate") && <div className="audio-source"><label>Fonte {state.mode === "translate" ? "da fala" : "da pergunta"}<select value={audioSource} disabled={isActive} onChange={(event) => setAudioSource(event.target.value as "microphone" | "system")}><option value="microphone">Microfone</option><option value="system">Áudio do interlocutor (desktop)</option></select></label><p>{audioSource === "system" ? "Captura o som reproduzido pelo computador. No Windows, usa loopback nativo do Electron." : "Captura sua voz ou a fala que chega pelo ambiente."}</p></div>}

        {isCopilot && <details className="copilot-grounding" open={!cv}><summary>Base da entrevista <span>{cv ? `✓ ${cv.fileName}` : "CV recomendado"}</span></summary><div className="grounding-grid"><section className="cv-import"><div><strong>Currículo do candidato</strong><p>Experiências e resultados usados como fonte de verdade.</p></div><label className="cv-button">{cvStatus === "reading" ? "Lendo…" : cv ? "Trocar CV" : "Importar CV"}<input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" disabled={cvStatus === "reading" || isActive} onChange={(event) => void importCv(event.target.files?.[0])} /></label>{cv && <p className="cv-ready"><span>✓</span> {cv.text.length.toLocaleString()} caracteres extraídos localmente</p>}{cvError && <p className="cv-error">{cvError}</p>}</section><label className="source-field">Descrição da vaga<textarea disabled={isActive} value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Cole responsabilidades e requisitos" /></label><label className="source-field">Subsídios adicionais<textarea disabled={isActive} value={candidateContext} onChange={(event) => setCandidateContext(event.target.value)} placeholder="Projetos, resultados e fatos adicionais" /></label></div></details>}

        <AiProviderSetup onReadyChange={(ready, suggest) => { setAiReady(ready); setAiSuggest(() => suggest); if (!ready) { setSuggestion(""); setSuggestionMeta(""); } }} />

        {usesSameLanguage && <section className="readiness"><header><span>PRONTIDÃO DA ENTREVISTA</span><strong>{interviewReady ? "Pronto" : "Configuração pendente"}</strong></header><ul><li className={cv ? "done" : ""}><i>{cv ? "✓" : "1"}</i><span>Currículo importado</span></li><li className={jobDescription.trim() ? "done" : ""}><i>{jobDescription.trim() ? "✓" : "2"}</i><span>Descrição da vaga informada</span></li><li className={aiReady ? "done" : ""}><i>{aiReady ? "✓" : "3"}</i><span>IA conectada e validada</span></li>{isRecordedAnswer && <li className={state.recordedAnswer.question.trim() ? "done" : ""}><i>{state.recordedAnswer.question.trim() ? "✓" : "4"}</i><span>Pergunta da entrevista informada</span></li>}</ul></section>}

        {isCopilot && aiReady && <section className="on-demand"><header><span>TRANSCRIÇÃO DA PERGUNTA</span><label className="auto-toggle"><input type="checkbox" checked={automaticSuggestions} onChange={(event) => setAutomaticSuggestions(event.target.checked)} />Gerar ao concluir a fala</label></header><label>Pergunta ouvida<textarea value={heardQuestion} onChange={(event) => setHeardQuestion(event.target.value)} placeholder="A transcrição ao vivo aparecerá aqui; você também pode colar a pergunta" /></label><div className="transcription-health"><i className={audioSource === "system" && isActive ? "listening" : transcription.status} />{audioSource === "system" ? isActive ? "Capturando áudio do computador; transcrição remota será conectada na próxima camada" : "A captura de áudio do computador iniciará com o copiloto" : isActive ? transcription.status === "listening" ? "Transcrevendo em tempo real" : transcription.error || "Aguardando transcrição" : transcription.supported ? "A transcrição iniciará com o copiloto" : "Motor nativo indisponível; use o campo manual"}</div><button type="button" onClick={() => void generateSuggestion(heardQuestion)} disabled={!heardQuestion.trim() || suggestionStatus === "loading"}>{suggestionStatus === "loading" ? "Preparando resposta…" : "Gerar sugestão agora"}</button></section>}

        {state.mode === "translate" && aiReady && <section className="on-demand translation-input"><header><span>FALA PARA TRADUZIR</span><label className="auto-toggle"><input type="checkbox" checked={automaticSpeech} onChange={(event) => setAutomaticSpeech(event.target.checked)} />Reproduzir tradução</label></header><small>{state.sourceLanguage} → {state.targetLanguage}</small><div className="transcription-health">{audioSource === "system" ? (isActive ? "Capturando e transcrevendo o áudio do interlocutor" : "O áudio do computador será capturado ao iniciar") : (isActive && transcription.status === "listening" ? "Transcrevendo o microfone em tempo real" : transcription.error || "O microfone será transcrito ao iniciar")}</div><label>Transcrição<textarea value={heardQuestion} onChange={(event) => setHeardQuestion(event.target.value)} placeholder="Fale ou cole uma frase para traduzir" /></label><button type="button" onClick={() => void generateSuggestion(heardQuestion, "translate")} disabled={!heardQuestion.trim() || suggestionStatus === "loading"}>{suggestionStatus === "loading" ? "Traduzindo…" : "Traduzir agora"}</button></section>}

        {isRecordedAnswer && aiReady && state.recordedAnswer.question.trim() && <button className="generate-answer" type="button" onClick={() => void generateSuggestion(state.recordedAnswer.question)} disabled={suggestionStatus === "loading"}>{suggestionStatus === "loading" ? "Preparando resposta…" : "Sugerir resposta com a IA"}</button>}

        {(suggestion || suggestionMeta) && <section className={`generated-suggestion ${suggestionStatus}`}><header><span>{state.mode === "translate" ? "TRADUÇÃO" : "RESPOSTA SUGERIDA"}</span><small>{suggestionMeta}</small></header>{suggestionBasis && <div className={`basis-badge ${suggestionBasis}`}>{suggestionBasis === "evidence" ? "Baseada no contexto fornecido" : "Conhecimento geral · não atribuir como experiência pessoal"}</div>}{suggestion && <p>{suggestion}</p>}{state.mode === "translate" && suggestion && <button className="speak-again" type="button" onClick={() => isSpeaking ? window.speechSynthesis.cancel() : speakTranslation(suggestion)}>{isSpeaking ? "Parar reprodução" : "Ouvir novamente"}</button>}</section>}

        {state.mode === "translate" && translationHistory.length > 0 && <details className="translation-history"><summary>Histórico desta conversa <span>{translationHistory.length} turno(s)</span></summary><ol>{translationHistory.map((turn, index) => <li key={`${index}-${turn.source}`}><small>{turn.from} → {turn.to}</small><p>{turn.source}</p><strong>{turn.translated}</strong></li>)}</ol></details>}

        {isCopilot && heardQuestion.trim() && (cv || jobDescription.trim() || candidateContext.trim()) && <section className="live-evidence"><span>{groundingSources.length} evidência(s) localizada(s) para o turno atual</span>{groundingSources.slice(0, 2).map((source) => <q key={`${source.type}-${source.startOffset}`}>{source.excerpt}</q>)}</section>}

        {isCopilot && conversationHistory.length > 0 && <details className="session-memory"><summary>Memória desta entrevista <span>{conversationHistory.length} turno(s)</span></summary><ol>{conversationHistory.map((turn, index) => <li key={`${index}-${turn.question}`}><b>{turn.question}</b><p>{turn.answer}</p></li>)}</ol></details>}

        {isRecordedAnswer && <div className="interview-panel">
          <section className="cv-import"><div><strong>Currículo do candidato</strong><p>Fonte de verdade para experiências e resultados usados nas respostas.</p></div><label className="cv-button">{cvStatus === "reading" ? "Lendo currículo…" : cv ? "Trocar currículo" : "Importar CV"}<input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" disabled={cvStatus === "reading"} onChange={(event) => void importCv(event.target.files?.[0])} /></label>{cv && <p className="cv-ready"><span>✓</span> {cv.fileName} · {cv.text.length.toLocaleString()} caracteres extraídos localmente</p>}{cvError && <p className="cv-error">{cvError}</p>}</section>
          <label className="source-field">Descrição da vaga<textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Cole responsabilidades, requisitos e competências da vaga" /></label>
          <label className="source-field">Outros subsídios do candidato<textarea value={candidateContext} onChange={(event) => setCandidateContext(event.target.value)} placeholder="Projetos recentes, resultados, motivações e fatos que não estão no currículo" /></label>
          <label className="question-field">Pergunta apresentada<textarea value={state.recordedAnswer.question} onChange={(event) => updateRecordedAnswer("question", event.target.value)} placeholder="Cole ou transcreva a pergunta da plataforma" /></label>
          <label>Cargo<input value={state.recordedAnswer.role} onChange={(event) => updateRecordedAnswer("role", event.target.value)} placeholder="Ex.: Gerente de Produto" /></label>
          <label>Empresa<input value={state.recordedAnswer.company} onChange={(event) => updateRecordedAnswer("company", event.target.value)} placeholder="Opcional" /></label>
          <label>Competência avaliada<input value={state.recordedAnswer.competency} onChange={(event) => updateRecordedAnswer("competency", event.target.value)} placeholder="Ex.: liderança" /></label>
          <label>Limite da resposta<select value={state.recordedAnswer.timeLimitSeconds} onChange={(event) => updateRecordedAnswer("timeLimitSeconds", Number(event.target.value))}><option value="60">1 minuto</option><option value="90">1 minuto e 30</option><option value="120">2 minutos</option><option value="180">3 minutos</option></select></label>
          <fieldset className="evidence-fields"><legend>Experiência real para estruturar em STAR</legend><label>Situação<textarea value={state.recordedAnswer.evidence.situation} onChange={(event) => updateEvidence("situation", event.target.value)} placeholder="Qual era o contexto?" /></label><label>Tarefa<textarea value={state.recordedAnswer.evidence.task} onChange={(event) => updateEvidence("task", event.target.value)} placeholder="Qual era sua responsabilidade?" /></label><label>Ação<textarea value={state.recordedAnswer.evidence.action} onChange={(event) => updateEvidence("action", event.target.value)} placeholder="O que você fez pessoalmente?" /></label><label>Resultado<textarea value={state.recordedAnswer.evidence.result} onChange={(event) => updateEvidence("result", event.target.value)} placeholder="Qual foi o resultado real?" /></label></fieldset>
          <p className="integrity-note">Use apenas quando permitido pela plataforma. A resposta final deve refletir sua experiência real.</p>
        </div>}

        {isRecordedAnswer && outline && <section className="outline-card"><header><span>ROTEIRO STAR</span><strong>≈ {formatTime(outline.estimatedSeconds)}</strong></header><ol><li><b>Abertura</b>{outline.opening}</li><li><b>Situação</b>{outline.situation}</li><li><b>Ação</b>{outline.action}</li><li><b>Resultado</b>{outline.result}</li><li><b>Fechamento</b>{outline.closing}</li></ol>{outline.estimatedSeconds > state.recordedAnswer.timeLimitSeconds && <p className="time-warning">O roteiro estimado ultrapassa o limite escolhido. Reduza o contexto antes de ensaiar.</p>}</section>}

        {isRecordedAnswer && state.recordedAnswer.question.trim() && (cv || jobDescription.trim() || candidateContext.trim()) && <section className="evidence-card"><header><span>EVIDÊNCIAS PARA ESTA PERGUNTA</span><strong>{groundingSources.length}</strong></header>{groundingSources.length > 0 ? <ul>{groundingSources.map((source) => <li key={`${source.type}-${source.startOffset}`}><b>{source.type === "cv" ? "Currículo" : source.type === "job-description" ? "Vaga" : "Contexto"}</b><q>{source.excerpt}</q><small>{source.fileName}</small></li>)}</ul> : <p>Nenhuma fonte fornecida sustenta esta pergunta. Adicione um fato verdadeiro antes de preparar a resposta.</p>}</section>}

        {isCopilot && showContext && <div className="context-panel">
          <label>Objetivo<input value={state.context.objective} onChange={(event) => updateContext("objective", event.target.value)} placeholder="Ex.: negociar um prazo melhor" /></label>
          <label>Com quem você vai falar<input value={state.context.audience} onChange={(event) => updateContext("audience", event.target.value)} placeholder="Ex.: cliente estratégico" /></label>
          <label>Tom<select value={state.context.tone} onChange={(event) => updateContext("tone", event.target.value)}><option value="professional">Profissional</option><option value="friendly">Amigável</option><option value="direct">Direto</option><option value="empathetic">Empático</option></select></label>
          <label>Orientações<textarea value={state.context.instructions} onChange={(event) => updateContext("instructions", event.target.value)} placeholder="Limites, fatos importantes e assuntos a evitar" /></label>
        </div>}

        <div className="stage">
          <div className={`orb ${isActive ? "active" : ""}`} style={{ "--level": `${level}%` } as React.CSSProperties}><span>◉</span></div>
          <strong>{isActive ? (isRecordedAnswer ? "Ensaio em andamento…" : isCopilot ? "Acompanhando a conversa…" : "Ouvindo você…") : state.status === "requesting-permission" ? "Abrindo microfone…" : isRecordedAnswer ? "Pronto para preparar sua resposta" : "Pronto para conversar"}</strong>
          <p>{isActive ? (isRecordedAnswer ? "Fale com suas próprias palavras; mediremos clareza e duração" : isCopilot ? "As sugestões aparecerão sem interromper você" : "Fale em seu ritmo normal") : usesSameLanguage && !candidateContextReady ? "Importe o currículo e informe a descrição da vaga" : usesSameLanguage && !aiReady ? "Conecte e teste a IA fornecedora para continuar" : isRecordedAnswer && !state.recordedAnswer.question ? "Informe a pergunta antes de começar" : isCopilot && !state.context.objective ? "Defina o contexto para receber respostas mais relevantes" : "Use fones de ouvido para a melhor experiência"}</p>
          {state.error && <p className="error">{state.error}</p>}
        </div>

        {isCopilot && isActive && <aside className="suggestion-placeholder"><span>PRÓXIMA RESPOSTA</span><p>Aguardando a fala do interlocutor para preparar sugestões…</p></aside>}
        {isRecordedAnswer && isActive && <div className="recording-status"><span className="recording-dot" />Gravando ensaio local <strong>{formatTime(elapsedSeconds)}</strong><small>Restam {formatTime(remainingSeconds)}</small></div>}
        {isRecordedAnswer && recordingUrl && !isActive && <section className="rehearsal-result"><div><span>ENSAIO CONCLUÍDO</span><strong>{formatTime(elapsedSeconds)} de {formatTime(state.recordedAnswer.timeLimitSeconds)}</strong></div><audio controls src={recordingUrl}>Seu navegador não suporta reprodução de áudio.</audio><p>A gravação está apenas neste dispositivo e será descartada ao fechar a aplicação.</p></section>}
        <button className={`primary ${isActive ? "stop" : ""}`} onClick={isActive ? stop : start} disabled={state.status === "requesting-permission" || (!isActive && ((usesSameLanguage && !interviewReady) || (state.mode === "translate" && !aiReady)))}>{isActive ? (isRecordedAnswer ? "Encerrar ensaio" : "Encerrar conversa") : isRecordedAnswer ? "Preparar e ensaiar resposta" : isCopilot ? "Iniciar copiloto" : "Iniciar conversa"}</button>
      </section>
      <footer><span>Baixa latência</span><span>Contexto sob seu controle</span><span>Desktop + Web</span></footer>
    </main>
  );
}
