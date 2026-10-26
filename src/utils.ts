export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove();
    return ok;
  }
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const pad2 = (n: number): string => String(n).padStart(2, '0');
export const telDigits = (tel: string): string => tel.replace(/-/g, '');

type ClassValue = string | false | null | undefined;
/** Join Tailwind class lists, skipping falsy entries. */
export const cx = (...classes: ClassValue[]): string => classes.filter(Boolean).join(' ');
