import type { GameEntry } from '@/lib/games/games';

type DiagnosticTarget = {
  cpuTarget: number;
  gpuTarget: number;
  ramMinimumGb: number;
  storageMinimumGb: number;
  requirementsSourceUrl: string;
  requirementsVerifiedAt: string;
  editorialVersion: string;
  qualityNotes: string;
  supportsIntegratedGpu: boolean;
  nativeWindowsSupport: boolean;
};

const VERIFIED_AT = '2026-07-30T00:00:00.000Z';
const VERSION = '2026.07';
const target = (
  cpuTarget: number,
  gpuTarget: number,
  ramMinimumGb: number,
  storageMinimumGb: number,
  requirementsSourceUrl: string,
  supportsIntegratedGpu = false,
  nativeWindowsSupport = true
): DiagnosticTarget => ({
  cpuTarget,
  gpuTarget,
  ramMinimumGb,
  storageMinimumGb,
  requirementsSourceUrl,
  requirementsVerifiedAt: VERIFIED_AT,
  editorialVersion: VERSION,
  qualityNotes: 'Comparação orientativa; FPS varia com resolução, preset, drivers, temperatura e processos em segundo plano.',
  supportsIntegratedGpu,
  nativeWindowsSupport
});

const TARGETS: Record<string, DiagnosticTarget> = {
  'counter-strike-2': target(58, 54, 8, 85, 'https://store.steampowered.com/app/730/CounterStrike_2/'),
  'league-of-legends': target(44, 38, 8, 20, 'https://support-leagueoflegends.riotgames.com/hc/pt-br/articles/201752654', true),
  valorant: target(52, 48, 8, 40, 'https://support-valorant.riotgames.com/hc/pt-br/articles/360044136134', true),
  'grand-theft-auto-v': target(55, 56, 8, 100, 'https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/'),
  minecraft: target(48, 42, 4, 2, 'https://www.minecraft.net/store/minecraft-java-bedrock-edition-pc', true),
  fortnite: target(60, 58, 8, 30, 'https://www.epicgames.com/help/fortnite-c5719335176219/technical-support-c5719372265755/what-are-the-system-requirements-for-fortnite-on-pc-a5720377106075'),
  'elden-ring': target(68, 70, 12, 60, 'https://store.steampowered.com/app/1245620/ELDEN_RING/'),
  'free-fire': target(38, 34, 4, 2, 'https://ffsupport.garena.com/hc/en-us', true, false),
  roblox: target(40, 38, 4, 2, 'https://en.help.roblox.com/hc/en-us/articles/203312800', true),
  'ea-sports-fc': target(63, 60, 8, 100, 'https://www.ea.com/games/ea-sports-fc')
};

export function getDiagnosticTarget(game: GameEntry): DiagnosticTarget {
  return TARGETS[game.slug] ?? {
    cpuTarget: 55,
    gpuTarget: 55,
    ramMinimumGb: Number.parseFloat(game.setupMin.ram) || 8,
    storageMinimumGb: Number.parseFloat(game.setupMin.storage.replace(/[^\d.]/g, '')) || 20,
    requirementsSourceUrl: `https://precisoutapronto.com.br/games/jogos/${game.slug}`,
    requirementsVerifiedAt: VERIFIED_AT,
    editorialVersion: VERSION,
    qualityNotes: 'Perfil editorial pendente de fonte oficial específica; não prevê FPS.',
    supportsIntegratedGpu: false,
    nativeWindowsSupport: game.platforms.includes('PC')
  };
}
