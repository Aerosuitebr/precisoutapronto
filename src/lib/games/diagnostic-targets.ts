import type { GameEntry } from '@/lib/games/games';

type DiagnosticTarget = {
  cpuTarget: number;
  gpuTarget: number;
  ramMinimumGb: number;
  storageMinimumGb: number;
};

const TARGETS: Record<string, DiagnosticTarget> = {
  'counter-strike-2': { cpuTarget: 58, gpuTarget: 54, ramMinimumGb: 8, storageMinimumGb: 85 },
  'league-of-legends': { cpuTarget: 44, gpuTarget: 38, ramMinimumGb: 8, storageMinimumGb: 20 },
  valorant: { cpuTarget: 52, gpuTarget: 48, ramMinimumGb: 8, storageMinimumGb: 40 },
  'grand-theft-auto-v': { cpuTarget: 55, gpuTarget: 56, ramMinimumGb: 8, storageMinimumGb: 100 },
  minecraft: { cpuTarget: 48, gpuTarget: 42, ramMinimumGb: 4, storageMinimumGb: 2 },
  fortnite: { cpuTarget: 60, gpuTarget: 58, ramMinimumGb: 8, storageMinimumGb: 30 },
  'elden-ring': { cpuTarget: 68, gpuTarget: 70, ramMinimumGb: 12, storageMinimumGb: 60 },
  'free-fire': { cpuTarget: 38, gpuTarget: 34, ramMinimumGb: 4, storageMinimumGb: 2 },
  roblox: { cpuTarget: 40, gpuTarget: 38, ramMinimumGb: 4, storageMinimumGb: 2 },
  'ea-sports-fc': { cpuTarget: 63, gpuTarget: 60, ramMinimumGb: 8, storageMinimumGb: 100 }
};

export function getDiagnosticTarget(game: GameEntry): DiagnosticTarget {
  return TARGETS[game.slug] ?? {
    cpuTarget: 55,
    gpuTarget: 55,
    ramMinimumGb: Number.parseFloat(game.setupMin.ram) || 8,
    storageMinimumGb: Number.parseFloat(game.setupMin.storage.replace(/[^\d.]/g, '')) || 20
  };
}
