'use client';

import { trackEvent } from '@/lib/analytics';
import { normalizeProfileMemory, type ProfileMemory } from '@/lib/profile-memory';

export async function loadProfileMemory(): Promise<ProfileMemory | null> {
  try {
    const response = await fetch('/api/profile', { cache: 'no-store' });
    if (!response.ok) return null;
    const payload = (await response.json()) as { profile?: unknown };
    return normalizeProfileMemory(payload.profile);
  } catch {
    return null;
  }
}

export function trackProfileMemoryApplied(toolId: string, applied: string[]) {
  if (!applied.length) return;
  trackEvent('profile_memory_applied', {
    tool_id: toolId,
    field_count: applied.length
  });
}
