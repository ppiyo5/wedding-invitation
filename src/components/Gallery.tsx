import { useCallback, useEffect, useRef, useState } from 'react';
import { PHOTOS } from '../data/wedding.ts';
import { Icon } from './Icon.tsx';
import { Overlay } from './Overlay.tsx';
import Section from './Section.tsx';
import { aosBlock, btn, iconBtnBase } from '../styles/ui.ts';
import { cx, prefersReducedMotion } from '../utils.ts';
import { attachLoopCarousel, type LoopCarousel } from '../carousel.ts';

/* With GALLERY_COLLAPSE_AT or more photos, show the first GALLERY_PREVIEW and a 더보기 toggle. */
const GALLERY_COLLAPSE_AT = 9;
const GALLERY_PREVIEW = 6;

const lbBtn = cx(iconBtnBase, 'text-white hover:bg-white/15 focus-visible:outline-white');

/* Lightbox track slides: a clone of the last photo, every photo, a clone of the first —
   the clones let 이전/다음 and swipes loop past either end (see carousel.ts). */
const SLIDES = [
  { photo: PHOTOS[PHOTOS.length - 1], real: -1 },
  ...PHOTOS.map((photo, real) => ({ photo, real })),
  { photo: PHOTOS[0], real: -1 },
];

export default function Gallery() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const collapsible = PHOTOS.length >= GALLERY_COLLAPSE_AT;
  const visible = collapsible && !expanded ? PHOTOS.slice(0, GALLERY_PREVIEW) : PHOTOS;
  const hiddenCount = PHOTOS.length - GALLERY_PREVIEW;

  /* Lightbox = looping horizontal scroll-snap track: touch swipes, mouse drags, trackpad
     swipes and the buttons all glide between photos and wrap around at both ends. */
  const carousel = useRef<LoopCarousel | null>(null);
  const startIdx = useRef(0);

  // attach the carousel when the track mounts (React 19 ref callback with cleanup)
  const setTrack = useCallback((el: HTMLDivElement | null) => {
    if (!el) return undefined;
    carousel.current = attachLoopCarousel(el, PHOTOS.length, startIdx.current, setCurrent, prefersReducedMotion);
    return () => { carousel.current?.destroy(); carousel.current = null; };
  }, []);

  const go = (step: number) => carousel.current?.go(step);

  const openAt = (i: number) => {
    startIdx.current = i;
    setCurrent(i);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  return (
    <Section
      tint
      labelId="t-gallery"
      eyebrow="GALLERY"
      title="우리의 순간"
      after={(
        <Overlay
          open={open}
          onClose={() => setOpen(false)}
          dark
          role="dialog"
          aria-modal="true"
          aria-label="사진 크게 보기"
          className={cx(
            'bg-lightbox text-white',
            'opacity-0 transition-opacity duration-240 ease-out-soft motion-reduce:transition-none',
            'data-[state=open]:opacity-100 data-[state=closing]:duration-160 data-[state=closing]:ease-in-soft',
          )}
        >
          {/* Photos fill the whole screen; the counter/close bar and the arrows float over them
              on soft dark fades so they stay readable on any photo. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-linear-to-b from-black/55 to-transparent pt-[var(--phone-safe-top)] pr-2 pb-8 pl-6 *:pointer-events-auto">
            <span className="text-sm whitespace-nowrap tabular-nums [text-shadow:0_1px_2px_rgb(0_0_0/.5)]" aria-live="polite">{current + 1} / {PHOTOS.length}</span>
            <button className={cx(lbBtn, 'border-0')} type="button" onClick={() => setOpen(false)} aria-label="닫기"><Icon name="close" /></button>
          </div>
          <div
            ref={setTrack}
            className={cx(
              'absolute inset-0 flex cursor-grab touch-pan-x snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain select-none',
              '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            )}
          >
            {SLIDES.map(({ photo: p, real }, k) => (
              <div
                key={k}
                className="relative h-full w-full shrink-0 snap-center snap-always overflow-hidden"
                {...(real < 0
                  ? { 'aria-hidden': true }
                  : { role: 'group', 'aria-roledescription': '슬라이드', 'aria-label': `${real + 1} / ${PHOTOS.length}`, 'aria-hidden': real !== current || undefined })}
              >
                {/* soft blurred copy of the same photo fills any space the ratio leaves free */}
                <img
                  className="pointer-events-none absolute inset-0 block size-full scale-110 object-cover opacity-45 blur-2xl"
                  src={p.src}
                  width={p.w}
                  height={p.h}
                  alt=""
                  aria-hidden="true"
                  loading={real < 0 || Math.abs(real - current) > 1 ? 'lazy' : 'eager'}
                  draggable={false}
                />
                <img
                  /* whole photo, original ratio, scaled up or down to fill the device screen
                     as far as its ratio allows — never cropped */
                  className="pointer-events-none absolute inset-0 block size-full object-contain"
                  src={p.src}
                  width={p.w}
                  height={p.h}
                  alt={real < 0 ? '' : p.alt}
                  loading={real < 0 || Math.abs(real - current) > 1 ? 'lazy' : 'eager'}
                  draggable={false}
                />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center gap-8 bg-linear-to-t from-black/55 to-transparent pt-12 pb-[calc(var(--phone-safe-bottom)+16px)] *:pointer-events-auto">
            <button className={cx(lbBtn, 'border border-white/40 bg-black/25')} type="button" onClick={() => go(-1)} aria-label="이전 사진"><Icon name="chevron-left" /></button>
            <button className={cx(lbBtn, 'border border-white/40 bg-black/25')} type="button" onClick={() => go(1)} aria-label="다음 사진"><Icon name="chevron-right" /></button>
          </div>
        </Overlay>
      )}
    >
      <div {...aosBlock('od-grid [--od-cols:3] [--od-gap:4px]')} id="gallery-grid">
        {visible.map((p, i) => (
          <button
            type="button"
            key={p.src}
            onClick={() => openAt(i)}
            aria-label={`사진 ${i + 1} 크게 보기: ${p.alt}`}
            className="group/ph block cursor-zoom-in overflow-hidden rounded-[4px] border-0 bg-line p-0"
          >
            <img
              className="od-media od-media-cover transition-transform duration-240 ease-out-soft [--od-ratio:1] group-hover/ph:scale-[1.03] motion-reduce:transition-none"
              src={p.src}
              width={p.w}
              height={p.h}
              alt=""
              loading="lazy"
            />
          </button>
        ))}
      </div>
      {collapsible && (
        <button
          {...aosBlock(cx(btn({ size: 'sm', block: true }), 'mt-3 [--od-icon-size:18px]'))}
          type="button"
          aria-expanded={expanded}
          aria-controls="gallery-grid"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? '접기' : <>더보기 <span className="text-muted">+{hiddenCount}</span></>}
          <Icon name="chevron-down" className={cx('transition-transform duration-240 ease-out-soft motion-reduce:transition-none', expanded && 'rotate-180')} />
        </button>
      )}
      <p {...aosBlock('mt-3 text-center text-xs text-muted')}>사진을 누르면 크게 볼 수 있어요</p>
    </Section>
  );
}
