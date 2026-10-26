import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useShell } from './shellContext.ts';
import { Icon } from './Icon.tsx';
import { cx, prefersReducedMotion } from '../utils.ts';
import { iconBtn } from '../styles/ui.ts';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select,[tabindex]:not([tabindex="-1"])';
const visibleFocusables = (el: HTMLElement) =>
  [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null);

type Phase = 'closed' | 'enter' | 'open' | 'closing';

interface OverlayProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  open: boolean;
  onClose: () => void;
  dark?: boolean;
  children: ReactNode;
}

/* Shared overlay: mounts inside the phone screen, animates in/out (children style themselves
   from the `group` + data-state), traps focus, closes on Esc, locks the page behind it and
   returns focus to the opener. */
export function Overlay({ open, onClose, className, dark = false, children, ...rest }: OverlayProps) {
  const { screenEl, lock } = useShell();
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<Phase>(open ? 'open' : 'closed');
  const ref = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) {
      opener.current = document.activeElement as HTMLElement | null;
      setMounted(true);
      setPhase('enter');
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')));
      return () => cancelAnimationFrame(raf);
    }
    if (!mounted) return undefined;
    setPhase('closing');
    const t = window.setTimeout(() => { setMounted(false); setPhase('closed'); }, prefersReducedMotion() ? 0 : 240);
    // The page behind stays inert until the lock release re-renders; restore focus after that.
    const target = opener.current;
    const raf = requestAnimationFrame(() => target?.focus({ preventScroll: true }));
    return () => { window.clearTimeout(t); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const release = lock(dark);
    const t = window.setTimeout(() => {
      const el = ref.current;
      if (el) (visibleFocusables(el)[0] ?? el).focus();
    }, prefersReducedMotion() ? 0 : 60);
    const onKey = (e: KeyboardEvent) => {
      const el = ref.current;
      if (!el) return;
      if (e.key === 'Escape') { e.preventDefault(); onCloseRef.current(); return; }
      if (e.key === 'Tab') {
        const f = visibleFocusables(el);
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(t); document.removeEventListener('keydown', onKey); release(); };
  }, [open, dark, lock]);

  if (!mounted || !screenEl) return null;
  return createPortal(
    <div
      ref={ref}
      tabIndex={-1}
      data-state={phase}
      className={cx('group absolute inset-0 z-40 font-body [word-break:keep-all] focus:outline-none', className)}
      {...rest}
    >
      {children}
    </div>,
    screenEl,
  );
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  titleId: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, titleId, footer, children }: SheetProps) {
  return (
    <Overlay open={open} onClose={onClose} className="text-ink">
      <div
        className={cx(
          'absolute inset-0 bg-scrim opacity-0 transition-opacity duration-240 ease-out-soft motion-reduce:transition-none',
          'group-data-[state=open]:opacity-100 group-data-[state=closing]:duration-160 group-data-[state=closing]:ease-in-soft',
        )}
        onClick={onClose}
      />
      <div
        className={cx(
          'absolute inset-x-0 bottom-0 grid max-h-[calc(100%-var(--phone-safe-top)-24px)] grid-rows-[auto_minmax(0,1fr)_auto]',
          'rounded-t-lg bg-surface shadow-[0_-8px_32px_rgb(0_0_0/.12)]',
          'translate-y-full transition-transform duration-360 ease-out-soft motion-reduce:transition-none',
          'group-data-[state=open]:translate-y-0 group-data-[state=closing]:duration-240 group-data-[state=closing]:ease-in-soft',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="relative flex items-center justify-between gap-3 pt-3 pr-3 pb-2 pl-6 before:absolute before:top-2 before:left-1/2 before:h-1 before:w-9 before:-translate-x-1/2 before:rounded-full before:bg-line before:content-['']">
          <h2 className="mt-2 font-display text-lg font-bold" id={titleId}>{title}</h2>
          <button className={cx(iconBtn, 'text-ink')} type="button" onClick={onClose} aria-label="닫기" data-sheet-close><Icon name="close" /></button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-6 pt-2 pb-6">{children}</div>
        {footer && <div className="border-t border-line bg-surface px-6 pt-3 pb-[calc(var(--phone-safe-bottom)+8px)]">{footer}</div>}
      </div>
    </Overlay>
  );
}
