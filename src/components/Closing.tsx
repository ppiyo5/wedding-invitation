import { WEDDING, CLOSING, BGM } from '../data/wedding.ts';
import Waves from './Waves.tsx';
import { aosBlock, section } from '../styles/ui.ts';
import { cx } from '../utils.ts';

export default function Closing() {
  const { groom, bride } = WEDDING;

  return (
    <>
      <section className={cx(section, 'text-center')} aria-labelledby="t-thanks">
        {/* full-bleed photo; waves melt its top and bottom edges into the page */}
        <figure {...aosBlock('relative -mx-6 mb-8 overflow-hidden')}>
          <img className="od-media" src={CLOSING.src} width={CLOSING.w} height={CLOSING.h} alt={CLOSING.alt} loading="lazy" />
          <Waves position="top" />
          <Waves position="bottom" />
        </figure>
        <h2 {...aosBlock('text-center font-display text-xl font-bold')} id="t-thanks">감사합니다</h2>
        <p {...aosBlock('mt-4 font-display text-poem leading-[1.9]')}>귀한 걸음 해주시는 모든 분들께<br />늘 감사하는 마음으로 살겠습니다.</p>
      </section>
      {/* bottom padding clears the floating 맨 위로 / 공유 / 링크 stack (3 × 44px + gaps) */}
      <footer className="px-6 pt-8 pb-[calc(var(--phone-safe-bottom)+180px)] text-center text-xs text-muted">
        <p>{groom.en} &amp; {bride.en} · {WEDDING.dateDots.replace(/ /g, '')}</p>
        <p className="mt-2 leading-[1.6]">{BGM.credit}</p>
      </footer>
    </>
  );
}
