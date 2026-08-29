'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Scene = {
  id: string;
  src: string;
  alt: string;
  place: string;
  title: string;
  line: string;
  duration: number;
  origin: string;
  zoomFrom: number;
  zoomTo: number;
  panFrom: [number, number];
  panTo: [number, number];
};

const SCENES: Scene[] = [
  {
    id: 'rua',
    src: '/images/cinema/07-movimento.jpg',
    alt: 'Mulher caminha na Avenida Paulista ao entardecer, casaco em movimento, cidade molhada ao fundo.',
    place: 'Avenida Paulista · 18h41',
    title: 'A cidade não espera.',
    line: 'Quem resolve agora, cobra agora.',
    duration: 7800,
    origin: '48% 42%',
    zoomFrom: 1.08,
    zoomTo: 1.22,
    panFrom: [1.4, 0.6],
    panTo: [-1.8, -1.2]
  },
  {
    id: 'orcamento',
    src: '/images/cinema/01-eletricista.jpg',
    alt: 'Prestador de serviço concentra o olhar no celular, luz dourada de fim de tarde.',
    place: 'Apartamento · Pinheiros',
    title: 'Ele monta o orçamento no celular.',
    line: 'Sem planilha. Sem voltar para o escritório.',
    duration: 7200,
    origin: '50% 12%',
    zoomFrom: 1.28,
    zoomTo: 1.42,
    panFrom: [0.4, 0],
    panTo: [-1.1, 0.8]
  },
  {
    id: 'envio',
    src: '/images/cinema/06-whatsapp.jpg',
    alt: 'Mãos seguram o celular na cozinha à noite, tela acesa em verde suave.',
    place: 'Cozinha · 21h17',
    title: 'O cliente recebe um link. Não um arquivo perdido.',
    line: 'Abre no WhatsApp. Lê. Decide.',
    duration: 6800,
    origin: '58% 46%',
    zoomFrom: 1.12,
    zoomTo: 1.28,
    panFrom: [-0.8, 0.4],
    panTo: [1.4, -0.6]
  },
  {
    id: 'aprovacao',
    src: '/images/cinema/02-cliente.jpg',
    alt: 'Mulher no sofá, à noite, olha o celular com um sorriso contido.',
    place: 'Sala · azul da noite',
    title: 'Ela confere e aprova.',
    line: 'Três segundos. Um toque. O trabalho pode começar.',
    duration: 7600,
    origin: '62% 38%',
    zoomFrom: 1.1,
    zoomTo: 1.26,
    panFrom: [1.2, 0.3],
    panTo: [-0.6, -1.4]
  },
  {
    id: 'pix',
    src: '/images/cinema/03-pix.jpg',
    alt: 'Rosto iluminado pela tela do celular no instante da confirmação.',
    place: 'Close · o instante',
    title: 'O Pix cai no mesmo segundo.',
    line: 'O rosto acende. A conta fecha.',
    duration: 6400,
    origin: '46% 42%',
    zoomFrom: 1.16,
    zoomTo: 1.34,
    panFrom: [-0.4, 0.2],
    panTo: [0.8, -0.8]
  },
  {
    id: 'oficio',
    src: '/images/cinema/05-oficina.jpg',
    alt: 'Oficina de marcenaria ao entardecer, mestre e aprendiz em movimento.',
    place: 'Oficina · fim de tarde',
    title: 'Quem faz, cobra. Quem cobra, recebe.',
    line: 'O ofício continua. O dinheiro também.',
    duration: 7400,
    origin: '42% 48%',
    zoomFrom: 1.06,
    zoomTo: 1.18,
    panFrom: [1.6, 0],
    panTo: [-1.5, 0.5]
  },
  {
    id: 'curriculo',
    src: '/images/cinema/04-curriculo.jpg',
    alt: 'Jovem em um café de São Paulo, luz dourada, laptop aberto.',
    place: 'Café · Vila Madalena',
    title: 'Outra vida, o mesmo impulso.',
    line: 'O currículo sai hoje. A entrevista pode ser amanhã.',
    duration: 7200,
    origin: '55% 40%',
    zoomFrom: 1.08,
    zoomTo: 1.2,
    panFrom: [-1, 0.4],
    panTo: [1.2, -0.7]
  }
];

const TITLE_MS = 3400;
const END_MS = 8200;
const FADE_MS = 1100;
const FILM_MS = SCENES.reduce((sum, scene) => sum + scene.duration, 0);
const TOTAL_MS = FILM_MS + END_MS;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function sceneAt(ms: number) {
  if (ms >= FILM_MS) {
    return { index: SCENES.length - 1, local: 1, inEnd: true, fade: 0 };
  }
  let cursor = 0;
  for (let i = 0; i < SCENES.length; i += 1) {
    const next = cursor + SCENES[i].duration;
    if (ms < next) {
      const localMs = ms - cursor;
      const fade = i < SCENES.length - 1 ? clamp((localMs - (SCENES[i].duration - FADE_MS)) / FADE_MS, 0, 1) : 0;
      return { index: i, local: localMs / SCENES[i].duration, inEnd: false, fade };
    }
    cursor = next;
  }
  return { index: SCENES.length - 1, local: 1, inEnd: true, fade: 0 };
}

export function CinematicSample() {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const playheadRef = useRef(0);
  const playingRef = useRef(true);
  const rateRef = useRef(1);
  const lastTsRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const cameraRef = useRef({ x: 0, y: 0 });
  const holdTimerRef = useRef<number | null>(null);
  const sceneIndexRef = useRef(0);
  const seekRef = useRef<number | null>(null);
  const lastProgressPaintRef = useRef(0);
  const flareRef = useRef<HTMLDivElement>(null);
  const viewfinderRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(true);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [inEnd, setInEnd] = useState(false);
  const [progress, setProgress] = useState(0);
  const [intro, setIntro] = useState(true);
  const [hint, setHint] = useState(true);
  const [reduced, setReduced] = useState(false);

  const applyFrame = useCallback(() => {
    const { index, local, inEnd: ended, fade } = sceneAt(playheadRef.current);
    const cam = cameraRef.current;

    SCENES.forEach((scene, i) => {
      const layer = layerRefs.current[i];
      if (!layer) return;

      let opacity = 0;
      if (!ended && i === index) opacity = 1 - fade;
      if (!ended && i === index + 1) opacity = fade;
      if (ended && i === SCENES.length - 1) opacity = 0.22;

      const t = i === index ? easeInOut(local) : i === index + 1 ? 0 : 1;
      const zoom = lerp(scene.zoomFrom, scene.zoomTo, t);
      const panX = lerp(scene.panFrom[0], scene.panTo[0], t) + cam.x * 2.4;
      const panY = lerp(scene.panFrom[1], scene.panTo[1], t) + cam.y * 1.7;

      layer.style.opacity = String(opacity);
      layer.style.transform = `translate3d(${panX}%, ${panY}%, 0) scale(${zoom})`;
    });

    if (flareRef.current) {
      flareRef.current.style.transform = `translate3d(${cam.x * 12}%, ${cam.y * 6}%, 0)`;
    }
    if (viewfinderRef.current) {
      viewfinderRef.current.style.transform = `translate3d(${(cam.x + 1) * 50}vw, ${(cam.y + 1) * 50}vh, 0) translate(-50%, -50%)`;
    }

    return { index, ended, introOn: playheadRef.current < TITLE_MS };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyReduced = () => {
      setReduced(media.matches);
      if (media.matches) {
        playingRef.current = false;
        setPlaying(false);
      }
    };
    applyReduced();
    media.addEventListener('change', applyReduced);

    let raf = 0;
    const tick = (now: number) => {
      const last = lastTsRef.current ?? now;
      const dt = Math.min(48, now - last);
      lastTsRef.current = now;

      cameraRef.current.x += (pointerRef.current.x - cameraRef.current.x) * 0.06;
      cameraRef.current.y += (pointerRef.current.y - cameraRef.current.y) * 0.06;

      if (seekRef.current != null) {
        playheadRef.current = seekRef.current;
        seekRef.current = null;
      } else if (playingRef.current && !media.matches) {
        playheadRef.current = (playheadRef.current + dt * rateRef.current) % TOTAL_MS;
      }

      const frame = applyFrame();
      sceneIndexRef.current = frame.index;
      setSceneIndex((prev) => (prev === frame.index ? prev : frame.index));
      setInEnd((prev) => (prev === frame.ended ? prev : frame.ended));
      setIntro((prev) => (prev === frame.introOn ? prev : frame.introOn));
      if (now - lastProgressPaintRef.current > 80) {
        lastProgressPaintRef.current = now;
        setProgress(playheadRef.current / TOTAL_MS);
      }

      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    const hideHint = window.setTimeout(() => setHint(false), 5200);

    return () => {
      media.removeEventListener('change', applyReduced);
      window.cancelAnimationFrame(raf);
      window.clearTimeout(hideHint);
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    };
  }, [applyFrame]);

  function jumpTo(index: number) {
    const start = SCENES.slice(0, index).reduce((sum, scene) => sum + scene.duration, 0);
    const next = start + 80;
    playheadRef.current = next;
    seekRef.current = next;
    setInEnd(false);
    setSceneIndex(index);
    setProgress(next / TOTAL_MS);
    setHint(false);
  }

  function togglePlay() {
    if (reduced) return;
    playingRef.current = !playingRef.current;
    setPlaying(playingRef.current);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((event.clientY - rect.top) / rect.height) * 2 - 1
    };
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('[data-cinema-ui]')) return;
    holdTimerRef.current = window.setTimeout(() => {
      rateRef.current = 0.22;
    }, 220);
  }

  function onPointerUp() {
    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
    rateRef.current = 1;
  }

  function onTimeline(event: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value) * TOTAL_MS;
    playheadRef.current = next;
    seekRef.current = next;
    setHint(false);
  }

  function onStageClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('[data-cinema-ui]')) return;
    togglePlay();
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.code === 'Space') {
        event.preventDefault();
        if (reduced) return;
        playingRef.current = !playingRef.current;
        setPlaying(playingRef.current);
      }
      if (event.code === 'ArrowRight') jumpTo(Math.min(SCENES.length - 1, sceneIndexRef.current + 1));
      if (event.code === 'ArrowLeft') jumpTo(Math.max(0, sceneIndexRef.current - 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reduced]);

  const scene = SCENES[sceneIndex];
  const sceneLabel = String(sceneIndex + 1).padStart(2, '0');

  return (
    <div
      ref={rootRef}
      className="relative h-[100dvh] w-full overflow-hidden bg-black text-white"
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onClick={onStageClick}
    >
      <style>{`
        @keyframes cinema-grain {
          0% { transform: translate(0,0) scale(1.08); }
          20% { transform: translate(-1.4%, 0.8%) scale(1.1); }
          40% { transform: translate(1.1%, -1.2%) scale(1.07); }
          60% { transform: translate(-0.6%, 1.4%) scale(1.12); }
          80% { transform: translate(1.6%, 0.4%) scale(1.09); }
          100% { transform: translate(0,0) scale(1.08); }
        }
        @keyframes cinema-pulse {
          0%, 100% { opacity: .35; }
          50% { opacity: .7; }
        }
        .cinema-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
          animation: cinema-grain .42s steps(4) infinite;
        }
        .cinema-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 11px;
          height: 11px;
          border-radius: 999px;
          background: #c8ff73;
          border: 0;
        }
      `}</style>

      <div className="absolute inset-0">
        {SCENES.map((item, i) => (
          <div
            key={item.id}
            ref={(node) => {
              layerRefs.current[i] = node;
            }}
            className="absolute inset-[-12%] will-change-transform"
            style={{ opacity: i === 0 ? 1 : 0, transform: `scale(${item.zoomFrom})` }}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: item.origin }}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,.55)_100%)]" />
      <div className="cinema-grain pointer-events-none absolute inset-[-20%] opacity-[0.16] mix-blend-overlay" />
      <div
        ref={flareRef}
        className="pointer-events-none absolute left-0 right-0 top-[38%] h-px bg-gradient-to-r from-transparent via-[#c8ff73]/30 to-transparent"
      />
      <div
        ref={viewfinderRef}
        className="pointer-events-none absolute left-0 top-0 z-[2] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 mix-blend-overlay"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[9vh] bg-black" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[11vh] bg-black" />

      <header data-cinema-ui className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/70 sm:px-8">
        <p>Precisou, Tá Pronto · amostra</p>
        <p className="hidden sm:block">Cena {sceneLabel} / 07 · 2.39:1</p>
        <Link href="/" className="pointer-events-auto text-[#c8ff73] transition hover:text-white">
          Sair
        </Link>
      </header>

      {intro && !inEnd ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-black/25">
          <div className="max-w-3xl px-6 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-[#c8ff73]">Filme interativo</p>
            <h1
              className="mt-5 text-4xl font-medium italic leading-[0.95] sm:text-7xl"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Pessoas. Movimento. Decisão.
            </h1>
            <p className="mt-5 text-sm font-semibold tracking-wide text-white/75 sm:text-base">
              Mova o cursor. A câmera segue você. Segure o clique para câmera lenta.
            </p>
          </div>
        </div>
      ) : null}

      {!intro && !inEnd ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[16vh] z-10 px-5 sm:px-10 lg:px-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#c8ff73]">{scene.place}</p>
          <h2
            className="mt-3 max-w-4xl text-3xl font-medium italic leading-[1.05] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {scene.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/80 sm:text-base">{scene.line}</p>
        </div>
      ) : null}

      {inEnd ? (
        <div data-cinema-ui className="absolute inset-0 z-10 grid place-items-center bg-black/55 px-6 text-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-[#c8ff73]">Precisou, Tá Pronto</p>
            <h2
              className="mt-5 text-4xl font-medium italic leading-[0.95] sm:text-7xl"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Orçamento no WhatsApp.
              <br />
              Aprovado. Pix recebido.
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/orcamento-com-pix#montar"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#83d600] px-7 text-sm font-black text-[#031f4b] transition hover:bg-[#c8ff73]"
              >
                Criar meu orçamento grátis
              </Link>
              <button
                type="button"
                onClick={() => jumpTo(0)}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-7 text-sm font-black text-white transition hover:bg-white/10"
              >
                Ver de novo
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {hint && !inEnd ? (
        <p className="pointer-events-none absolute left-1/2 top-[14vh] z-10 -translate-x-1/2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
          Câmera viva · siga com o mouse
        </p>
      ) : null}

      <div data-cinema-ui className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 sm:px-6 sm:pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label={playing ? 'Pausar' : 'Reproduzir'}
          >
            {playing ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="ml-0.5 h-4 w-4" fill="currentColor" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={onTimeline}
            aria-label="Linha do tempo do filme"
            className="cinema-range h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[#c8ff73]"
          />
          <span className="hidden w-16 text-right text-[10px] font-bold tabular-nums tracking-wider text-white/60 sm:block">
            {Math.floor((progress * TOTAL_MS) / 1000)}s
          </span>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {SCENES.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => jumpTo(i)}
              className={cn(
                'relative h-14 w-[4.6rem] shrink-0 overflow-hidden rounded-md ring-1 transition sm:h-16 sm:w-24',
                i === sceneIndex && !inEnd ? 'ring-[#c8ff73]' : 'ring-white/15 hover:ring-white/50'
              )}
              aria-label={`Ir para a cena ${item.place}`}
            >
              <Image src={item.src} alt="" fill sizes="96px" className="object-cover" style={{ objectPosition: item.origin }} />
              <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                {String(i + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
