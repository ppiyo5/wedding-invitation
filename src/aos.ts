/* Scroll fade-up matching the reference invitation (AOS defaults it ships with):
   each block marked `data-aos` (see `aos` in styles/ui.ts) animates on its own —
   600ms, `ease`, rising 50px — once its top is 120px above the bottom of the scroll
   viewport. Once shown, a block stays in place (no re-animation when scrolling back). */
export const AOS_OFFSET = 120;
const AOS_DONE_MS = 700; // ≥ the 600ms entrance

export function startAos(root: HTMLElement, { reduce = false }: { reduce?: boolean } = {}): () => void {
  const els = [...root.querySelectorAll<HTMLElement>('[data-aos]')];
  if (reduce) {
    els.forEach((el) => { el.dataset.aosIn = ''; el.dataset.aosDone = ''; });
    return () => {};
  }
  let pending = els.filter((el) => !('aosIn' in el.dataset));
  let raf = 0;
  const schedule = () => { if (!raf) raf = requestAnimationFrame(check); };
  const stop = () => {
    root.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  };
  function check() {
    raf = 0;
    const line = root.getBoundingClientRect().bottom - AOS_OFFSET;
    const atEnd = root.scrollTop + root.clientHeight >= root.scrollHeight - 2;
    pending = pending.filter((el) => {
      if (atEnd || el.getBoundingClientRect().top < line) {
        el.dataset.aosIn = '';
        // after the entrance finishes, drop the transition so the block simply stays put
        window.setTimeout(() => { el.dataset.aosDone = ''; }, AOS_DONE_MS);
        return false; // shown once — never hidden or animated again
      }
      return true;
    });
    if (!pending.length) stop();
  }
  root.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  // first paint hidden, then animate what is already in view
  requestAnimationFrame(schedule);
  return () => {
    cancelAnimationFrame(raf);
    stop();
  };
}
