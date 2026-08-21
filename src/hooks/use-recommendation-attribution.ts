'use client';

import { useEffect } from 'react';

const QUERY_KEY = 'rj_rec';

function storageKey(toolKey: string) {
  return `rj_recommendation:${toolKey}`;
}

export function useRecommendationAttribution(toolKey: string) {
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get(QUERY_KEY);
    if (!token || token.length > 2048) return;
    sessionStorage.setItem(storageKey(toolKey), token);
    url.searchParams.delete(QUERY_KEY);
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }, [toolKey]);
}

export async function completeRecommendationAttribution(toolKey: string) {
  const key = storageKey(toolKey);
  const trackingToken = sessionStorage.getItem(key);
  if (!trackingToken) return false;
  try {
    const response = await fetch('/api/v1/recommendations/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingToken, interaction: 'completed', currentToolKey: toolKey }),
      keepalive: true
    });
    const result = await response.json().catch(() => null);
    if (result?.accepted === true) sessionStorage.removeItem(key);
    return result?.accepted === true;
  } catch {
    return false;
  }
}
