import { createContext, useContext, type RefObject } from 'react';

export interface Shell {
  /** .phone-screen — sheets, lightbox, toast, petals and floating controls portal here */
  screenEl: HTMLElement | null;
  /** .phone-content — the scrolling page */
  scrollerRef: RefObject<HTMLElement | null>;
  /** lock the page behind an overlay; returns the release function */
  lock: (dark?: boolean) => () => void;
  locked: boolean;
}

export const ShellContext = createContext<Shell | null>(null);

export function useShell(): Shell {
  const shell = useContext(ShellContext);
  if (!shell) throw new Error('useShell must be used inside <PhoneShell>');
  return shell;
}
