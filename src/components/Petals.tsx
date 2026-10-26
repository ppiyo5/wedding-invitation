import { useEffect, useRef } from 'react';

interface Petal {
  x: number; y: number; z: number; size: number; alpha: number; vy: number;
  swayAmp: number; sway: number; swaySpeed: number;
  rot: number; vr: number; flip: number; vf: number;
  sprite: HTMLCanvasElement;
}

/* Falling cherry-blossom petals on one pointer-transparent canvas over the phone screen.
   Petals are pre-rendered sprites (gradient body, notched tip, soft vein, pale rim),
   drawn at three depths with gentle wind gusts. Pauses when hidden or switched off. */

const COUNT = 22;
const SPRITE = 64; // px, sprite resolution
// [base tint near the stem, rim tint] — kept very pale
const TINTS: ReadonlyArray<readonly [string, string]> = [
  ['#f8dbe2', '#fff7f9'],
  ['#fbe6eb', '#fffafb'],
  ['#f6d6de', '#fff5f7'],
  ['#fdeef1', '#ffffff'],
];

function petalPath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // unit petal: stem at bottom centre, two rounded lobes with a cleft at the top
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.98);
  ctx.bezierCurveTo(w * 0.2, h * 0.86, w * 0.02, h * 0.62, w * 0.06, h * 0.36);
  ctx.bezierCurveTo(w * 0.09, h * 0.14, w * 0.26, h * 0.03, w * 0.4, h * 0.06);
  ctx.quadraticCurveTo(w * 0.47, h * 0.08, w * 0.5, h * 0.17);
  ctx.quadraticCurveTo(w * 0.53, h * 0.08, w * 0.6, h * 0.06);
  ctx.bezierCurveTo(w * 0.74, h * 0.03, w * 0.91, h * 0.14, w * 0.94, h * 0.36);
  ctx.bezierCurveTo(w * 0.98, h * 0.62, w * 0.8, h * 0.86, w * 0.5, h * 0.98);
  ctx.closePath();
}

function makeSprite([base, rim]: readonly [string, string]): HTMLCanvasElement {
  const c = document.createElement('canvas');
  const w = SPRITE;
  const h = Math.round(SPRITE * 1.15);
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;

  petalPath(ctx, w, h);
  const g = ctx.createRadialGradient(w * 0.5, h * 0.92, 1, w * 0.5, h * 0.5, h * 0.62);
  g.addColorStop(0, base);
  g.addColorStop(0.55, rim);
  g.addColorStop(1, 'rgba(255,255,255,0.85)');
  ctx.fillStyle = g;
  ctx.fill();

  // soft veins from the stem
  ctx.save();
  petalPath(ctx, w, h);
  ctx.clip();
  ctx.strokeStyle = 'rgba(226, 168, 184, 0.28)';
  ctx.lineWidth = 0.9;
  [[0.5, 0.2], [0.3, 0.26], [0.7, 0.26]].forEach(([tx, ty]) => {
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.95);
    ctx.quadraticCurveTo(w * (0.5 + (tx - 0.5) * 0.4), h * 0.6, w * tx, h * ty);
    ctx.stroke();
  });
  ctx.restore();

  // pale translucent rim
  petalPath(ctx, w, h);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  return c;
}

function makePetal(w: number, h: number, scatter: boolean, sprites: HTMLCanvasElement[]): Petal {
  const z = 0.35 + Math.random() * 0.65; // depth: small, faint and slow far away
  const size = 9 + z * 11;
  return {
    x: Math.random() * w,
    y: scatter ? Math.random() * h : -size * 2,
    z,
    size,
    alpha: 0.35 + z * 0.5,
    vy: 0.25 + z * 0.55,
    swayAmp: 0.3 + Math.random() * 0.7,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.008 + Math.random() * 0.012,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.025,
    flip: Math.random() * Math.PI * 2,
    vf: 0.015 + Math.random() * 0.03,
    sprite: sprites[Math.floor(Math.random() * sprites.length)],
  };
}

export default function Petals({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const sprites = TINTS.map(makeSprite);
    let w = 0;
    let h = 0;
    let petals: Petal[] = [];
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!petals.length && w && h) {
        petals = Array.from({ length: COUNT }, () => makePetal(w, h, true, sprites)).sort((a, b) => a.z - b.z);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const frame = (t: number) => {
      // occasional gusts: mostly calm, now and then a soft push to the right
      const gust = Math.pow(Math.max(0, Math.sin(t * 0.00045)), 6) * 1.4;
      const wind = 0.12 + gust;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < petals.length; i++) {
        let p = petals[i];
        p.sway += p.swaySpeed;
        p.x += Math.sin(p.sway) * p.swayAmp * p.z + wind * p.z;
        p.y += p.vy * (1 + gust * 0.3);
        p.rot += p.vr + gust * 0.004;
        p.flip += p.vf;
        if (p.y - p.size > h || p.x < -60 || p.x > w + 60) {
          p = makePetal(w, h, false, sprites);
          p.x = Math.random() * (w + 60) - 60;
          petals[i] = p;
        }
        const pw = p.size;
        const ph = p.size * 1.15;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(Math.max(0.2, Math.abs(Math.cos(p.flip))), 0.85 + 0.15 * Math.abs(Math.sin(p.flip)));
        ctx.drawImage(p.sprite, -pw / 2, -ph / 2, pw, ph);
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && enabled && !document.hidden) raf = requestAnimationFrame(frame); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onVis = () => (document.hidden ? stop() : start());

    if (enabled) start();
    else ctx.clearRect(0, 0, w, h);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [enabled]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 z-25 size-full" aria-hidden="true" hidden={!enabled} />;
}
