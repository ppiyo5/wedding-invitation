/* Shared helpers for the invitation-link admin. */
export type Side = '신랑측' | '신부측';
export interface Guest { id: string; name: string; side: Side; sent: boolean; createdAt: string }

export const GUESTS_KEY = 'inv-admin-guests';
export const BASE_KEY = 'inv-admin-base';
export const SIDES: readonly Side[] = ['신랑측', '신부측'];
export const NAME_MAX = 20;

export const cleanName = (raw: string): string => Array.from(String(raw).replace(/\s+/g, ' ').trim()).slice(0, NAME_MAX).join('');

export function buildLink(base: string, name: string): string {
  const b = base.trim();
  if (!b) return `?to=${encodeURIComponent(name)}`;
  const [noHash, hash] = b.split('#');
  const sep = noHash.includes('?') ? (/[?&]$/.test(noHash) ? '' : '&') : '?';
  return `${noHash}${sep}to=${encodeURIComponent(name)}${hash ? `#${hash}` : ''}`;
}

/* The invitation lives next to the admin page: http(s) → the folder URL, file:// → its index.html. */
export function defaultBase(): string {
  const dir = window.location.href.split(/[?#]/)[0].replace(/[^/]*$/, '');
  return window.location.protocol === 'file:' ? `${dir}index.html` : dir;
}

const csvCell = (v: string): string => `"${String(v).replace(/"/g, '""')}"`;
export function toCsv(rows: Guest[], base: string): string {
  const head = ['이름', '구분', '초대 링크', '보냄'];
  const lines = rows.map((g) => [g.name, g.side, buildLink(base, g.name), g.sent ? 'O' : ''].map(csvCell).join(','));
  return `﻿${[head.map(csvCell).join(','), ...lines].join('\r\n')}`;
}

export function downloadText(filename: string, text: string, type = 'text/csv;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function loadGuests(): Guest[] {
  try {
    const s: unknown = JSON.parse(localStorage.getItem(GUESTS_KEY) ?? 'null');
    if (Array.isArray(s)) return s as Guest[];
  } catch { /* ignore */ }
  return [];
}
export function saveGuests(list: Guest[]): void {
  try { localStorage.setItem(GUESTS_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}
export const newId = (): string => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
