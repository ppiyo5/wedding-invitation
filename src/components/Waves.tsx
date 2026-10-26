import { cx } from '../utils.ts';

/* Original soft wave edge (our own geometry — not taken from any third-party snippet).
   Three sine-like layers drawn as smooth quadratic curves, each a little wider than the
   frame by exactly one wavelength, so sliding it sideways by one wavelength loops
   seamlessly. Layers drift at different speeds and directions for a slow, calm motion.
   Filled with the page background so the photo edge melts into the page. Decorative:
   hidden from assistive tech, frozen under reduced motion. */

const VIEW_W = 1200;
const VIEW_H = 40;

/** `animate` also carries --wave-shift = −wavelength so each layer loops seamlessly. */
interface Layer { wavelength: number; amp: number; baseline: number; opacity: string; animate: string }

const LAYERS: Layer[] = [
  { wavelength: 400, amp: 6, baseline: 16, opacity: 'opacity-35', animate: 'animate-wave-drift-a [--wave-shift:-400px]' },
  { wavelength: 300, amp: 5, baseline: 23, opacity: 'opacity-60', animate: 'animate-wave-drift-b [--wave-shift:-300px]' },
  { wavelength: 500, amp: 4, baseline: 30, opacity: '', animate: 'animate-wave-drift-c [--wave-shift:-500px]' },
];

/** Closed path: a sine-like crest line from x = -wavelength to VIEW_W + wavelength, filled down to the bottom. */
export function wavePath({ wavelength, amp, baseline }: Pick<Layer, 'wavelength' | 'amp' | 'baseline'>): string {
  const half = wavelength / 2;
  let d = `M${-wavelength} ${baseline} Q${-wavelength + half / 2} ${baseline - amp} ${-half} ${baseline}`;
  for (let x = 0; x <= VIEW_W + wavelength; x += half) d += ` T${x} ${baseline}`;
  return `${d} V${VIEW_H} H${-wavelength} Z`;
}

const PATHS = LAYERS.map((l) => ({ ...l, d: wavePath(l) }));

export default function Waves({ position }: { position: 'top' | 'bottom' }) {
  return (
    <div
      aria-hidden="true"
      className={cx('pointer-events-none absolute inset-x-0 leading-[0]', position === 'top' ? 'top-0 -scale-y-100' : 'bottom-0')}
    >
      <svg className="block h-7 w-full overflow-hidden" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none">
        {PATHS.map((l) => (
          <path
            key={l.wavelength}
            d={l.d}
            className={cx('fill-bg motion-reduce:animate-none', l.opacity, l.animate)}
          />
        ))}
      </svg>
    </div>
  );
}
