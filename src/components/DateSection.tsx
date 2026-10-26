import { useEffect, useMemo, useState } from 'react';
import { WEDDING } from '../data/wedding.ts';
import Section from './Section.tsx';
import { aosBlock } from '../styles/ui.ts';
import { cx, pad2 } from '../utils.ts';

const DOWS = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface Countdown { done: boolean; d: number; h: string; m: string; s: string; dd: number }

function useCountdown(target: Date): Countdown {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = target.getTime() - now;
  if (diff <= 0) return { done: true, d: 0, h: '00', m: '00', s: '00', dd: 0 };
  const s = Math.floor(diff / 1000);
  return {
    done: false,
    d: Math.floor(s / 86400),
    h: pad2(Math.floor((s % 86400) / 3600)),
    m: pad2(Math.floor((s % 3600) / 60)),
    s: pad2(s % 60),
    dd: Math.ceil(diff / 86400000),
  };
}

type Cell = { d: number; dow: number } | null;

export default function DateSection() {
  const { year, month, day, groom, bride, venue } = WEDDING;
  const cd = useCountdown(WEDDING.at);
  const cells = useMemo<Cell[]>(() => {
    const first = new Date(year, month - 1, 1).getDay();
    const days = new Date(year, month, 0).getDate();
    const out: Cell[] = Array.from({ length: first }, () => null);
    for (let d = 1; d <= days; d++) out.push({ d, dow: (first + d - 1) % 7 });
    return out;
  }, [year, month]);

  const stats: Array<[string | number, string]> = [[cd.d, '일'], [cd.h, '시간'], [cd.m, '분'], [cd.s, '초']];

  return (
    <Section labelId="t-date" eyebrow="THE DAY" title={WEDDING.dateLabel} lead={`${WEDDING.timeLabel} · ${venue.name} ${venue.hall}`}>
      <div {...aosBlock('rounded-lg border border-line bg-surface px-4 py-6')} role="group" aria-label={`${year}년 ${month}월 달력, ${day}일 예식`}>
        <p className="text-center font-display text-lg font-bold">{month}월</p>
        <div className="od-grid mt-4 text-center text-sm [--od-cols:7] [--od-gap:4px]">
          {DOWS.map((d, i) => (
            <span key={d} className={cx('pb-2 text-xs font-semibold', i === 0 ? 'text-sun' : 'text-muted')} aria-hidden="true">{d}</span>
          ))}
          {cells.map((c, i) => (c === null
            ? <span key={`b${i}`} aria-hidden="true" />
            : (
              <span
                key={c.d}
                className={cx(
                  'grid place-items-center tabular-nums',
                  c.d === day
                    ? 'aspect-square w-10 justify-self-center rounded-full bg-accent font-bold text-accent-ink'
                    : cx('h-10', c.dow === 0 && 'text-sun'),
                )}
                {...(c.d === day ? { 'aria-label': `${month}월 ${day}일 예식일` } : { 'aria-hidden': true })}
              >
                {c.d}
              </span>
            )))}
        </div>
      </div>
      <div {...aosBlock('od-grid mt-8 [--od-cols:4] [--od-gap:8px]')} role="timer" aria-live="off" aria-label="예식까지 남은 시간">
        {stats.map(([n, cap]) => (
          <div key={cap} className="od-stat rounded-md border border-line bg-surface py-3 text-center">
            <span className="text-[clamp(22px,6.4vw,26px)] font-bold leading-[1.2] whitespace-nowrap tabular-nums">{n}</span>
            <span className="text-xs text-muted">{cap}</span>
          </div>
        ))}
      </div>
      <p {...aosBlock('mt-4 text-center text-sm text-muted')}>
        {cd.done
          ? <>{groom.short} ♡ {bride.short}의 결혼식 <strong className="text-accent">당일</strong>입니다. 함께해 주셔서 감사합니다</>
          : <>{groom.short} ♡ {bride.short}의 결혼식이 <strong className="whitespace-nowrap text-accent">{cd.dd}일</strong> 남았습니다</>}
      </p>
    </Section>
  );
}
