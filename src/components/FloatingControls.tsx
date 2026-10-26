import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { BGM } from '../data/wedding.ts';
import { Icon } from './Icon.tsx';
import { useToast } from './Toast.tsx';
import { floatBtn } from '../styles/ui.ts';
import { cx, prefersReducedMotion } from '../utils.ts';

const PETALS_KEY = 'inv-petals';
const HINT_KEY = 'inv-bgm-hint-seen';
const HINT_MS = 6000;
const FADE_MS = 1200;

function fadeVolume(audio: HTMLAudioElement, to: number, ms: number, done?: () => void): () => void {
  const from = audio.volume;
  const t0 = performance.now();
  let raf = 0;
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / ms);
    audio.volume = from + (to - from) * k;
    if (k < 1) raf = requestAnimationFrame(step);
    else done?.();
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

export function usePetalsPreference(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [on, setOn] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem(PETALS_KEY);
      if (saved !== null) return saved === '1';
    } catch { /* ignore */ }
    return !prefersReducedMotion();
  });
  useEffect(() => {
    try { sessionStorage.setItem(PETALS_KEY, on ? '1' : '0'); } catch { /* ignore */ }
  }, [on]);
  return [on, setOn];
}

function hintSeen(): boolean {
  try { return localStorage.getItem(HINT_KEY) === '1'; } catch { return false; }
}

type HintState = 'off' | 'in' | 'out';

/* "음악 켜기" bubble beside the music button — shown once per browser, after the intro. */
function useMusicHint(ready: boolean, playing: boolean): [HintState, () => void] {
  const [state, setState] = useState<HintState>('off');
  useEffect(() => {
    if (!ready || playing || hintSeen()) return undefined;
    // mark as seen only once it actually appears (StrictMode re-runs this effect in dev)
    const t0 = window.setTimeout(() => {
      try { localStorage.setItem(HINT_KEY, '1'); } catch { /* ignore */ }
      setState('in');
    }, 400);
    const t1 = window.setTimeout(() => setState((s) => (s === 'in' ? 'out' : s)), 400 + HINT_MS);
    return () => { window.clearTimeout(t0); window.clearTimeout(t1); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  useEffect(() => {
    if (state !== 'out') return undefined;
    const t = window.setTimeout(() => setState('off'), prefersReducedMotion() ? 0 : 160);
    return () => window.clearTimeout(t);
  }, [state]);
  const dismiss = () => setState((s) => (s === 'off' ? s : 'out'));
  return [state, dismiss];
}

const hintBtnFocus = 'focus-visible:rounded-full focus-visible:outline-white focus-visible:-outline-offset-4';

interface FloatingControlsProps {
  petalsOn: boolean;
  onTogglePetals: () => void;
  hintReady: boolean;
}

export default function FloatingControls({ petalsOn, onTogglePetals, hintReady }: FloatingControlsProps) {
  const toast = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const wantPlay = useRef(false);
  const cancelFade = useRef<() => void>(() => {});
  const pausedByHide = useRef(false);
  const [hint, dismissHint] = useMusicHint(hintReady, playing);

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelFade.current();
    audio.volume = 0;
    setBusy(true);
    try {
      await audio.play();
      setPlaying(true);
      cancelFade.current = fadeVolume(audio, BGM.volume, FADE_MS);
    } catch {
      wantPlay.current = false;
      toast('음악을 재생하지 못했어요. 잠시 후 다시 눌러 주세요');
    } finally {
      setBusy(false);
    }
  };
  const pause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelFade.current();
    setPlaying(false);
    cancelFade.current = fadeVolume(audio, 0, 400, () => audio.pause());
  };
  const toggleMusic = () => {
    dismissHint();
    wantPlay.current = !playing;
    if (playing) pause();
    else void play();
  };

  useEffect(() => {
    const onVis = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden && !audio.paused) {
        pausedByHide.current = true;
        cancelFade.current();
        audio.pause();
      } else if (!document.hidden && pausedByHide.current && wantPlay.current) {
        pausedByHide.current = false;
        audio.play().catch(() => setPlaying(false));
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => { document.removeEventListener('visibilitychange', onVis); cancelFade.current(); };
  }, []);

  return (
    <div className="absolute top-[calc(var(--phone-safe-top)+8px)] right-3 z-30 flex flex-col gap-2">
      <audio ref={audioRef} src={BGM.src} loop preload="none" />
      <div className="relative">
        {hint !== 'off' && (
          <div
            role="status"
            className={cx(
              'absolute top-0 right-[calc(100%+12px)] flex items-center rounded-full bg-ink font-body whitespace-nowrap text-white shadow-[0_6px_16px_rgb(18_22_20/.18)]',
              // tail pointing at the music button
              "after:absolute after:top-1/2 after:-right-1 after:-mt-[5px] after:size-2.5 after:rotate-45 after:rounded-[2px] after:bg-ink after:content-['']",
              'motion-reduce:transition-none',
              hint === 'in'
                ? 'translate-x-0 opacity-100 transition-[opacity,translate] duration-240 ease-out-soft'
                : 'translate-x-2 opacity-0 transition-[opacity,translate] duration-160 ease-in-soft',
            )}
          >
            <button
              type="button"
              className={cx('flex min-h-11 cursor-pointer items-center gap-2 border-0 bg-transparent pr-1 pl-4 text-sm font-semibold text-inherit [--od-icon-size:16px]', hintBtnFocus)}
              onClick={toggleMusic}
            >
              <Icon name="music" />
              음악 켜기
            </button>
            <button
              type="button"
              className={cx('relative z-1 grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-white/80 [--od-icon-size:14px] hover:text-white', hintBtnFocus)}
              onClick={dismissHint}
              aria-label="안내 닫기"
            >
              <Icon name="close" />
            </button>
          </div>
        )}
        <button
          type="button"
          className={floatBtn}
          aria-pressed={playing}
          aria-busy={busy}
          aria-label="배경음악"
          title={playing ? '배경음악 끄기' : '배경음악 켜기'}
          onClick={toggleMusic}
          disabled={busy}
        >
          {playing
            ? (
              <span className="flex h-3.5 items-end gap-0.5" aria-hidden="true">
                {['', '[animation-delay:-300ms]', '[animation-delay:-600ms]'].map((d, i) => (
                  <span key={i} className={cx('block h-full w-[3px] origin-bottom animate-eq rounded-[1px] bg-current motion-reduce:animate-none', d)} />
                ))}
              </span>
            )
            : <Icon name="music-off" />}
        </button>
      </div>
      <button
        type="button"
        className={floatBtn}
        aria-pressed={petalsOn}
        aria-label="꽃잎 효과"
        title={petalsOn ? '꽃잎 효과 끄기' : '꽃잎 효과 켜기'}
        onClick={onTogglePetals}
      >
        <Icon name={petalsOn ? 'petal' : 'petal-off'} />
      </button>
    </div>
  );
}
