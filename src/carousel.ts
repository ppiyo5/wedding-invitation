/* Looping photo carousel on a horizontal scroll-snap track.
   The track holds `count + 2` slides: a clone of the last photo, every photo, then a clone
   of the first. Going past either end glides onto a clone and, once the scroll settles,
   silently jumps to the real photo — so 이전/다음 never stop at the first or last photo.

   Gestures:
   - touch: native swipe with momentum + snap (touch-action: pan-x on the track)
   - mouse / pen: drag the photo sideways (a 40px drag turns the page)
   - trackpad / wheel: horizontal two-finger swipe scrolls natively; a vertical wheel or
     swipe turns one page per gesture */
export interface LoopCarousel {
  go: (step: number) => void;
  destroy: () => void;
}

const DRAG_THRESHOLD = 40;
const WHEEL_COOLDOWN = 450;
const SETTLE_MS = 140;

export function attachLoopCarousel(
  track: HTMLElement,
  count: number,
  startIndex: number,
  onIndex: (realIndex: number) => void,
  reduceMotion: () => boolean,
): LoopCarousel {
  const width = () => track.clientWidth || 1;
  const pos = () => Math.round(track.scrollLeft / width());
  const realOf = (p: number) => (((p - 1) % count) + count) % count;
  const jump = (p: number) => track.scrollTo({ left: p * width(), behavior: 'auto' });
  const glide = (p: number) => {
    track.scrollTo({ left: p * width(), behavior: reduceMotion() ? 'auto' : 'smooth' });
    onIndex(realOf(p));
  };

  // open on the tapped photo without animation
  jump(startIndex + 1);
  onIndex(startIndex);

  let target: number | null = null; // page a button/drag/wheel is heading to
  let drag: { id: number; x: number; left: number; page: number } | null = null;
  const go = (step: number) => {
    const from = target ?? pos();
    target = Math.max(0, Math.min(count + 1, from + step));
    glide(target);
  };

  /* settle: leave a clone for its real twin */
  let settleTimer = 0;
  const settle = () => {
    window.clearTimeout(settleTimer);
    if (drag) return; // still holding the photo
    target = null;
    const p = pos();
    if (p <= 0) jump(count);
    else if (p >= count + 1) jump(1);
    onIndex(realOf(pos()));
  };
  let raf = 0;
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (target === null) onIndex(realOf(pos())); });
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settle, SETTLE_MS);
  };
  track.addEventListener('scroll', onScroll, { passive: true });
  track.addEventListener('scrollend', settle);

  /* mouse / pen drag (touch keeps the native swipe) */
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, left: track.scrollLeft, page: pos() };
    track.setPointerCapture(e.pointerId);
    track.style.scrollSnapType = 'none';
    track.style.cursor = 'grabbing';
  };
  const onMove = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    track.scrollLeft = drag.left - (e.clientX - drag.x);
  };
  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const page = drag.page + (dx < -DRAG_THRESHOLD ? 1 : dx > DRAG_THRESHOLD ? -1 : 0);
    drag = null;
    track.style.scrollSnapType = '';
    track.style.cursor = '';
    target = Math.max(0, Math.min(count + 1, page));
    glide(target);
  };
  track.addEventListener('pointerdown', onDown);
  track.addEventListener('pointermove', onMove);
  track.addEventListener('pointerup', onUp);
  track.addEventListener('pointercancel', onUp);

  /* vertical wheel / trackpad swipe → one page per gesture */
  let wheelLock = 0;
  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // horizontal: native scroll + snap
    e.preventDefault();
    const now = performance.now();
    if (now < wheelLock) return;
    wheelLock = now + WHEEL_COOLDOWN;
    go(e.deltaY > 0 ? 1 : -1);
  };
  track.addEventListener('wheel', onWheel, { passive: false });

  return {
    go,
    destroy() {
      window.clearTimeout(settleTimer);
      cancelAnimationFrame(raf);
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('scrollend', settle);
      track.removeEventListener('pointerdown', onDown);
      track.removeEventListener('pointermove', onMove);
      track.removeEventListener('pointerup', onUp);
      track.removeEventListener('pointercancel', onUp);
      track.removeEventListener('wheel', onWheel);
    },
  };
}
