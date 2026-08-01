import type { GameEntry } from '@/lib/games/games';

export type GameStoreLink = {
  label: string;
  href: string;
  external?: boolean;
};

/** Temas visuais do hero (sem arte oficial copyrighted). */
export function gameHeroTheme(slug: string) {
  const themes: Record<
    string,
    { from: string; via: string; to: string; glow: string; label: string }
  > = {
    'counter-strike-2': {
      from: 'from-orange-600',
      via: 'via-amber-500',
      to: 'to-slate-900',
      glow: 'bg-orange-400/40',
      label: 'Tático'
    },
    'league-of-legends': {
      from: 'from-sky-600',
      via: 'via-indigo-500',
      to: 'to-slate-900',
      glow: 'bg-sky-400/40',
      label: 'MOBA'
    },
    valorant: {
      from: 'from-rose-600',
      via: 'via-red-500',
      to: 'to-slate-950',
      glow: 'bg-rose-400/40',
      label: 'FPS'
    },
    'grand-theft-auto-v': {
      from: 'from-violet-600',
      via: 'via-fuchsia-500',
      to: 'to-slate-900',
      glow: 'bg-violet-400/40',
      label: 'Mundo aberto'
    },
    minecraft: {
      from: 'from-emerald-600',
      via: 'via-lime-500',
      to: 'to-slate-900',
      glow: 'bg-emerald-400/40',
      label: 'Sandbox'
    },
    fortnite: {
      from: 'from-blue-600',
      via: 'via-violet-500',
      to: 'to-slate-900',
      glow: 'bg-blue-400/40',
      label: 'Battle royale'
    },
    'elden-ring': {
      from: 'from-yellow-700',
      via: 'via-amber-600',
      to: 'to-stone-950',
      glow: 'bg-amber-400/35',
      label: 'Souls'
    },
    'free-fire': {
      from: 'from-orange-500',
      via: 'via-yellow-500',
      to: 'to-slate-900',
      glow: 'bg-yellow-400/40',
      label: 'Mobile'
    },
    roblox: {
      from: 'from-red-600',
      via: 'via-blue-500',
      to: 'to-slate-900',
      glow: 'bg-red-400/35',
      label: 'UGC'
    },
    'ea-sports-fc': {
      from: 'from-green-600',
      via: 'via-emerald-500',
      to: 'to-slate-900',
      glow: 'bg-emerald-400/40',
      label: 'Futebol'
    }
  };

  return (
    themes[slug] ?? {
      from: 'from-teal-600',
      via: 'via-cyan-500',
      to: 'to-slate-900',
      glow: 'bg-teal-400/40',
      label: 'Jogo'
    }
  );
}

export function getGameStoreLinks(game: GameEntry): GameStoreLink[] {
  const bySlug: Record<string, GameStoreLink[]> = {
    'counter-strike-2': [
      {
        label: 'Abrir Counter-Strike 2 na Steam',
        href: 'https://store.steampowered.com/app/730/',
        external: true
      }
    ],
    'league-of-legends': [
      {
        label: 'Baixar League of Legends',
        href: 'https://www.leagueoflegends.com/pt-br/',
        external: true
      }
    ],
    valorant: [
      {
        label: 'Baixar Valorant',
        href: 'https://playvalorant.com/pt-br/',
        external: true
      }
    ],
    'grand-theft-auto-v': [
      {
        label: 'Ver GTA V na Steam',
        href: 'https://store.steampowered.com/app/271590/',
        external: true
      }
    ],
    minecraft: [
      {
        label: 'Ir para o site oficial do Minecraft',
        href: 'https://www.minecraft.net/pt-br',
        external: true
      }
    ],
    fortnite: [
      {
        label: 'Abrir Fortnite',
        href: 'https://www.fortnite.com/pt-BR',
        external: true
      }
    ],
    'elden-ring': [
      {
        label: 'Ver Elden Ring na Steam',
        href: 'https://store.steampowered.com/app/1245620/',
        external: true
      }
    ],
    'free-fire': [
      {
        label: 'Free Fire na Google Play',
        href: 'https://play.google.com/store/apps/details?id=com.dts.freefireth',
        external: true
      }
    ],
    roblox: [
      {
        label: 'Abrir Roblox',
        href: 'https://www.roblox.com/',
        external: true
      }
    ],
    'ea-sports-fc': [
      {
        label: 'Ver EA Sports FC na EA',
        href: 'https://www.ea.com/pt-br/games/ea-sports-fc',
        external: true
      }
    ]
  };

  return bySlug[game.slug] ?? [];
}
