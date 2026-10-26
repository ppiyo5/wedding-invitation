import { WEDDING, COVER } from '../data/wedding.ts';
import { aos, aosProps } from '../styles/ui.ts';
import { cx } from '../utils.ts';
import Waves from './Waves.tsx';

export default function Cover() {
  const { groom, bride, venue } = WEDDING;
  return (
    <header className="px-6 pt-8 pb-16 text-center" aria-label="청첩장 표지">
      <p {...aosProps} className={cx(aos, 'text-xs font-semibold tracking-[.32em] text-muted')}>{WEDDING.weekdayEn}</p>
      <p {...aosProps} className={cx(aos, 'font-display text-lg tracking-[.12em]')}>{WEDDING.dateDots}</p>
      {/* full-bleed photo so the waves can melt its top and bottom edges into the page */}
      <figure {...aosProps} className={cx(aos, 'relative -mx-6 mt-6 overflow-hidden')}>
        <img className="od-media" src={COVER.src} width={COVER.w} height={COVER.h} alt={COVER.alt} fetchPriority="high" />
        <Waves position="top" />
        <Waves position="bottom" />
      </figure>
      {/* Programmatic focus target only (tabindex -1, not in the tab order, not a control),
          so it carries no focus ring — controls keep theirs (WCAG 2.4.7 targets operable UI). */}
      <h1
        {...aosProps}
        id="cover-title"
        tabIndex={-1}
        className={cx(aos, 'mt-8 flex items-center justify-center gap-3 font-display text-2xl font-bold focus:outline-none')}
      >
        <span>{groom.name}</span>
        <span className="text-lg font-normal text-accent" aria-label="그리고">&amp;</span>
        <span>{bride.name}</span>
      </h1>
      <p {...aosProps} className={cx(aos, 'mt-4 text-muted')}>
        <span className="block whitespace-nowrap">{WEDDING.dateLabel} {WEDDING.timeLabel}</span>
        <span className="block">{venue.name} {venue.hall}</span>
      </p>
    </header>
  );
}
