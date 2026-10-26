/* Recipient name from the invitation link: …/?to=홍길동 (or ?name=홍길동).
   Trimmed, whitespace collapsed, capped at 20 characters; rendered as text only. */
let cached: string | undefined;

export function getGuestName(): string {
  if (cached !== undefined) return cached;
  try {
    const p = new URLSearchParams(window.location.search);
    const raw = (p.get('to') || p.get('name') || '').replace(/\s+/g, ' ').trim();
    cached = raw ? Array.from(raw).slice(0, 20).join('') : '';
  } catch {
    cached = '';
  }
  return cached;
}

export const useGuestName = (): string => getGuestName();
