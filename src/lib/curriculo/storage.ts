import type { ResumeData } from './types';
import { normalizeResume } from './defaults';
import { getSession } from '@/lib/auth';
import { deleteRemoteDocument, listRemoteDocuments, saveRemoteDocument } from '@/lib/documents/remote-storage';

const STORAGE_PREFIX = 'precisoutapronto-resumes';

function storageKey() {
  const email = getSession()?.user.email ?? 'guest';
  return `${STORAGE_PREFIX}:${email}`;
}

export function listResumes(): ResumeData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeResume(item as Partial<ResumeData> & Record<string, unknown>))
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  } catch {
    return [];
  }
}

export function saveResume(resume: ResumeData) {
  if (typeof window === 'undefined') return resume;
  const resumes = listResumes();
  const next = normalizeResume({ ...resume, updatedAt: new Date().toISOString() });
  const index = resumes.findIndex((item) => item.id === next.id);
  const updated = index >= 0 ? resumes.map((item, i) => (i === index ? next : item)) : [next, ...resumes];
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  void saveRemoteDocument('curriculo', next).catch(() => undefined);
  return next;
}

export function deleteResume(resumeId: string) {
  if (typeof window === 'undefined') return;
  const updated = listResumes().filter((item) => item.id !== resumeId);
  localStorage.setItem(storageKey(), JSON.stringify(updated));
  void deleteRemoteDocument('curriculo', resumeId).catch(() => undefined);
}

export async function loadResumes(): Promise<ResumeData[]> {
  const remote = (await listRemoteDocuments<ResumeData>('curriculo')).map((item) =>
    normalizeResume(item as Partial<ResumeData> & Record<string, unknown>)
  );
  if (remote.length > 0) return remote.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const legacy = listResumes();
  if (legacy.length) await Promise.all(legacy.map((item) => saveRemoteDocument('curriculo', item)));
  return legacy;
}

export async function persistResume(resume: ResumeData): Promise<ResumeData> {
  const next = normalizeResume({ ...resume, updatedAt: new Date().toISOString() });
  return normalizeResume(await saveRemoteDocument('curriculo', next) as ResumeData & Record<string, unknown>);
}

export async function removeResume(resumeId: string) {
  await deleteRemoteDocument('curriculo', resumeId);
}

export function getResume(resumeId: string) {
  return listResumes().find((item) => item.id === resumeId) ?? null;
}
