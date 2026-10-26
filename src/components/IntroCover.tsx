import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { WEDDING, INTRO } from '../data/wedding.ts';
import { useShell } from './shellContext.ts';
import { btn } from '../styles/ui.ts';
import { cx, prefersReducedMotion } from '../utils.ts';

type Phase = 'typing' | 'signed' | 'leaving';
interface Pos { line: number; char: number }

interface IntroCoverProps {
  guest: string;
  /** `byKeyboard` is true when the visitor dismissed the intro from the keyboard */
  onDone: (byKeyboard: boolean) => void;
}

/* Full-screen cover typed out before the invitation opens.
   Tap anywhere or "건너뛰기" opens the invitation immediately. */
export default function IntroCover({ guest, onDone }: IntroCoverProps) {
  const { lock } = useShell();
  const reduce = useMemo(prefersReducedMotion, []);
  const lines = useMemo(() => {
    const base = [...INTRO.lines];
    if (guest) base.unshift(INTRO.guestLine.replace('{name}', guest));
    return base.map((l) => Array.from(l));
  }, [guest]);
  const fullText = lines.map((l) => l.join('')).join(' ');

  const [pos, setPos] = useState<Pos>(() => (reduce ? { line: lines.length, char: 0 } : { line: 0, char: 0 }));
  const [phase, setPhase] = useState<Phase>(reduce ? 'signed' : 'typing');
  const byKeyboard = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => lock(true), [lock]);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);

  // typing clock
  useEffect(() => {
    if (phase !== 'typing') return undefined;
    if (pos.line >= lines.length) {
      const t = window.setTimeout(() => setPhase('signed'), INTRO.linePauseMs);
      return () => window.clearTimeout(t);
    }
    const atEnd = pos.char >= lines[pos.line].length;
    const t = window.setTimeout(() => {
      setPos((p) => (p.char >= lines[p.line].length ? { line: p.line + 1, char: 0 } : { line: p.line, char: p.char + 1 }));
    }, atEnd ? INTRO.linePauseMs : INTRO.typeMs);
    return () => window.clearTimeout(t);
  }, [phase, pos, lines]);

  // after the signature appears, open automatically (not under reduced motion)
  useEffect(() => {
    if (phase !== 'signed' || reduce) return undefined;
    const t = window.setTimeout(() => setPhase('leaving'), INTRO.holdMs);
    return () => window.clearTimeout(t);
  }, [phase, reduce]);

  useEffect(() => {
    if (phase !== 'leaving') return undefined;
    const t = window.setTimeout(() => doneRef.current(byKeyboard.current), reduce ? 0 : 280);
    return () => window.clearTimeout(t);
  }, [phase, reduce]);

  const leave = (keyboard: boolean) => {
    byKeyboard.current = keyboard;
    setPhase('leaving');
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); leave(true); }
  };
  // a button activated from the keyboard reports click detail 0
  const onButton = (e: MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); leave(e.detail === 0); };

  const caretLine = Math.min(pos.line, lines.length - 1);

  return (
    <div
      ref={ref}
      className={cx(
        'absolute inset-0 z-14 grid cursor-pointer grid-rows-[minmax(0,1fr)_auto] bg-intro-bg font-body text-intro-ink [word-break:keep-all] focus:outline-none',
        'px-8 pt-[calc(var(--phone-safe-top)+32px)] pb-[calc(var(--phone-safe-bottom)+24px)]',
        'transition-opacity duration-280 ease-in-soft motion-reduce:transition-none',
        phase === 'leaving' && 'pointer-events-none opacity-0',
      )}
      role="dialog"
      aria-modal="true"
      aria-label="청첩장 인트로"
      tabIndex={-1}
      onClick={() => leave(false)}
      onKeyDown={onKey}
    >
      <p className="sr-only">{fullText} {WEDDING.groom.short} 그리고 {WEDDING.bride.short}, {WEDDING.dateDots}</p>

      <div className="grid content-center gap-16" aria-hidden="true">
        <div className="grid gap-2">
          {lines.map((chars, i) => {
            if (i > pos.line) return <p className="min-h-[1.6em] font-display text-intro" key={i}>&nbsp;</p>;
            const shown = i < pos.line ? chars.length : pos.char;
            const caret = phase === 'typing' && i === caretLine;
            return (
              <p className="min-h-[1.6em] font-display text-intro" key={i}>
                {chars.slice(0, shown).join('')}
                {caret && <span className="ml-0.5 inline-block h-[1.1em] w-0.5 animate-caret bg-intro-ink align-[-0.15em] motion-reduce:animate-none" />}
              </p>
            );
          })}
        </div>
        <div
          className={cx(
            'grid gap-2 transition-[opacity,translate] duration-400 ease-out-soft motion-reduce:transition-none',
            phase === 'typing' ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100',
          )}
        >
          <p className="font-display text-names font-bold">
            {WEDDING.groom.short} <span className="mx-1 text-md font-normal text-intro-muted">그리고</span> {WEDDING.bride.short}
          </p>
          <p className="text-sm tracking-[.3em] whitespace-nowrap text-intro-muted">{WEDDING.dateDots}</p>
        </div>
      </div>

      <div className="flex justify-center">
        {reduce ? (
          <button type="button" className={cx(btn({ tone: 'primary' }), 'min-w-50 focus-visible:outline-white')} onClick={onButton}>청첩장 열기</button>
        ) : (
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-full border border-white/30 bg-transparent px-6 text-sm text-intro-ink transition-colors duration-160 hover:bg-white/10 focus-visible:outline-white"
            onClick={onButton}
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
