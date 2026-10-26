import type { CSSProperties } from 'react';
import type { IconName } from '../data/wedding.ts';
import { cx } from '../utils.ts';

/* One outline icon family (24px grid, 1.6 stroke). Every UI glyph renders through <Icon>. */
export function IconSprite() {
  return (
    <svg className="absolute size-0 overflow-hidden" aria-hidden="true" focusable="false">
      <symbol id="i-phone" viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></symbol>
      <symbol id="i-message" viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z" /></symbol>
      <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></symbol>
      <symbol id="i-chevron-down" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></symbol>
      <symbol id="i-chevron-left" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></symbol>
      <symbol id="i-chevron-right" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></symbol>
      <symbol id="i-copy" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></symbol>
      <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></symbol>
      <symbol id="i-alert" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></symbol>
      <symbol id="i-subway" viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="14" rx="3" /><path d="M6 11h12M9 14.5v.01M15 14.5v.01M8 21l2-4M16 21l-2-4" /></symbol>
      <symbol id="i-bus" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="15" rx="2" /><path d="M5 11h14M8.5 15v.01M15.5 15v.01M7 18v3M17 18v3" /></symbol>
      <symbol id="i-car" viewBox="0 0 24 24"><path d="M5 16V11l2-5h10l2 5v5M5 16h14M5 16v3M19 16v3M3 11h18M8 13.5v.01M16 13.5v.01" /></symbol>
      <symbol id="i-link" viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></symbol>
      <symbol id="i-share" viewBox="0 0 24 24"><circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="M8.2 10.8l7.6-4M8.2 13.2l7.6 4" /></symbol>
      <symbol id="i-minus" viewBox="0 0 24 24"><path d="M6 12h12" /></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><path d="M6 12h12M12 6v12" /></symbol>
      <symbol id="i-arrow-up" viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" /></symbol>
      <symbol id="i-music" viewBox="0 0 24 24"><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></symbol>
      <symbol id="i-music-off" viewBox="0 0 24 24"><path d="M9 13.5V18M9 9V5l11-2v10" /><circle cx="6.5" cy="18" r="2.5" /><path d="M3 3l18 18" /></symbol>
      <symbol id="i-petal" viewBox="0 0 24 24"><path d="M12 21c-5-3-7-7.5-7-11a7 7 0 0 1 7-7 7 7 0 0 1 7 7c0 3.5-2 8-7 11z" /><path d="M12 21V9" /></symbol>
      <symbol id="i-petal-off" viewBox="0 0 24 24"><path d="M7.6 7.6A7 7 0 0 0 5 10c0 3.5 2 8 7 11 1.7-1 3-2.2 4-3.5M18.6 13.5c.3-1.2.4-2.4.4-3.5a7 7 0 0 0-9.8-6.4" /><path d="M3 3l18 18" /></symbol>
    </svg>
  );
}

interface IconProps { name: IconName; className?: string; style?: CSSProperties }

export function Icon({ name, className, style }: IconProps) {
  return (
    <svg
      className={cx('od-icon fill-none stroke-current stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]', className)}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <use href={`#i-${name}`} />
    </svg>
  );
}
