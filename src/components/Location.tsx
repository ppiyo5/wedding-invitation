import { WEDDING } from '../data/wedding.ts';
import { Icon } from './Icon.tsx';
import Section, { Lines } from './Section.tsx';
import { useCopy } from '../hooks/useCopy.ts';
import { telDigits } from '../utils.ts';
import { aosBlock, btn } from '../styles/ui.ts';

const MAP_FONT = 'Pretendard, sans-serif';

/* Schematic map (content SVG — keeps its own geometry). */
function SketchMap() {
  return (
    <div {...aosBlock('relative mt-6 overflow-hidden rounded-md border border-line bg-map')}>
      <span className="absolute top-2 left-2 rounded-[4px] bg-white/90 px-2 py-0.5 text-xs text-muted">간략 약도 · 실제 축척과 다름</span>
      <svg className="block h-auto w-full" viewBox="0 0 342 220" role="img" aria-label="약도: 2호선 문래역 5번 출구에서 문래로를 따라 직진 300m, SK리더스뷰 4층 JK아트컨벤션">
        <rect width="342" height="220" fill="#eef1ef" />
        <rect x="0" y="96" width="342" height="28" fill="#ffffff" />
        <rect x="150" y="0" width="26" height="220" fill="#ffffff" />
        <rect x="40" y="0" width="14" height="220" fill="#f8f9f8" />
        <rect x="0" y="176" width="342" height="12" fill="#f8f9f8" />
        <rect x="196" y="20" width="120" height="60" rx="6" fill="#dfe6e2" />
        <rect x="70" y="20" width="62" height="60" rx="6" fill="#e4e9e6" />
        <rect x="70" y="136" width="62" height="32" rx="6" fill="#e4e9e6" />
        <rect x="196" y="136" width="54" height="32" rx="6" fill="#d6e2db" />
        <rect x="262" y="136" width="54" height="32" rx="6" fill="#e4e9e6" />
        <text x="236" y="114" fontSize="10" fill="#66605d" fontFamily={MAP_FONT}>문래로</text>
        <circle cx="110" cy="110" r="9" fill="#2f8f3f" />
        <text x="110" y="113.5" fontSize="9" fill="#fff" textAnchor="middle" fontFamily={MAP_FONT} fontWeight="700">2</text>
        <text x="80" y="92" fontSize="10" fill="#262322" fontFamily={MAP_FONT}>문래역 5번 출구</text>
        <path d="M120 110 H 222 V 136" fill="none" stroke="#7a706b" strokeWidth="2.5" strokeDasharray="5 4" strokeLinecap="round" />
        <g transform="translate(210 120)">
          <path d="M12 30s-11-9.8-11-18.2a11 11 0 0 1 22 0C23 20.2 12 30 12 30z" fill="#7a706b" />
          <circle cx="12" cy="11.5" r="4" fill="#fff" />
        </g>
        <text x="223" y="200" fontSize="11" fill="#262322" fontWeight="700" textAnchor="middle" fontFamily={MAP_FONT}>SK리더스뷰 · {WEDDING.venue.name}</text>
      </svg>
    </div>
  );
}

export default function Location() {
  const { venue, transit } = WEDDING;
  const copy = useCopy();
  return (
    <Section labelId="t-location" eyebrow="LOCATION" title="오시는 길">
      <div {...aosBlock('od-stack text-center [--od-gap:2px]')}>
        <p className="font-display text-lg font-bold">{venue.name} {venue.hall}</p>
        <p className="text-sm text-muted">{venue.address}</p>
        <p className="text-sm text-muted">
          <a href={`tel:${telDigits(venue.tel)}`} className="whitespace-nowrap">Tel. {venue.tel}</a>
        </p>
      </div>

      <SketchMap />

      <div {...aosBlock('od-grid mt-3 [--od-cols:3] [--od-gap:8px]')}>
        <a className={btn({ size: 'compact' })} target="_blank" rel="noopener noreferrer" href={venue.naverUrl}>네이버 지도</a>
        <a className={btn({ size: 'compact' })} target="_blank" rel="noopener noreferrer" href={venue.kakaoUrl}>카카오맵</a>
        <a className={btn({ size: 'compact' })} target="_blank" rel="noopener noreferrer" href={venue.tmapUrl}>티맵</a>
      </div>
      <button {...aosBlock(btn({ size: 'sm', block: true }) + ' mt-2')} type="button" onClick={() => copy(venue.address, '주소를')}>
        <Icon name="copy" />
        주소 복사
      </button>

      <div {...aosBlock('mt-8 grid gap-6')}>
        {transit.map((t) => (
          <div className="od-row-top [--od-gap:12px]" key={t.title}>
            <span className="od-fixed grid size-10 place-items-center rounded-full bg-accent-soft text-accent [--od-icon-size:20px]" aria-hidden="true">
              <Icon name={t.icon} />
            </span>
            <div className="od-fill">
              <h3 className="text-md font-bold leading-[1.5]">{t.title}</h3>
              <p className="text-sm text-muted"><Lines lines={t.lines} /></p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
