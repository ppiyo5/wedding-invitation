import { useState } from 'react';
import { WEDDING, POEM, CONTACTS, type Person } from '../data/wedding.ts';
import { Icon } from './Icon.tsx';
import { Sheet } from './Overlay.tsx';
import Section, { Lines } from './Section.tsx';
import { telDigits } from '../utils.ts';
import { useGuestName } from '../hooks/useGuestName.ts';
import { aosBlock, btn, roundBtn } from '../styles/ui.ts';

/* "아버지 · 어머니 의 장남 연학" — a single-parent family shows only the parent given. */
function ParentLine({ person }: { person: Person }) {
  const parents = [person.father, person.mother].filter(Boolean).join(' · ');
  return (
    <p className="flex flex-wrap items-baseline justify-center gap-2">
      <span className="text-sm text-muted">{parents ? `${parents} 의 ${person.order}` : person.order}</span>
      <span className="font-display text-lg font-bold">{person.short}</span>
    </p>
  );
}

export default function Invitation() {
  const [open, setOpen] = useState(false);
  const { groom, bride } = WEDDING;
  const guest = useGuestName();
  const groups = CONTACTS
    .map((g) => ({ ...g, people: g.people.filter((p) => p.name && p.tel) }))
    .filter((g) => g.people.length);

  return (
    <Section
      tint
      labelId="t-invite"
      eyebrow="INVITATION"
      title={guest ? <>소중한 <span className="text-accent">{guest}</span> 님을 초대합니다.</> : '소중한 분들을 초대합니다'}
      after={(
        <Sheet open={open} onClose={() => setOpen(false)} title="연락하기" titleId="sheet-contact-title">
          {groups.map((g) => (
            <div className="[&+&]:mt-6" key={g.side}>
              <h3 className="mb-2 text-xs font-bold tracking-[.16em] text-accent">{g.side}</h3>
              {g.people.map((p) => (
                <div className="od-row border-b border-line py-2 [--od-gap:8px]" key={p.tel}>
                  <div className="od-field od-fill">
                    <span className="text-xs text-muted">{p.rel}</span>
                    <span className="font-semibold">{p.name}</span>
                  </div>
                  <a className={`${roundBtn} od-fixed`} href={`tel:${telDigits(p.tel)}`} aria-label={`${p.rel} ${p.name}에게 전화하기`}><Icon name="phone" /></a>
                  <a className={`${roundBtn} od-fixed`} href={`sms:${telDigits(p.tel)}`} aria-label={`${p.rel} ${p.name}에게 문자 보내기`}><Icon name="message" /></a>
                </div>
              ))}
            </div>
          ))}
        </Sheet>
      )}
    >
      {POEM.map((stanza, i) => (
        <p {...aosBlock('text-center font-display text-poem [&+&]:mt-6')} key={i}>
          <Lines lines={stanza} />
        </p>
      ))}
      <div {...aosBlock('mt-12 grid justify-items-center gap-3')}>
        <ParentLine person={groom} />
        <ParentLine person={bride} />
      </div>
      <div {...aosBlock('mt-8 flex justify-center')}>
        <button className={btn()} type="button" onClick={() => setOpen(true)}>
          <Icon name="phone" />
          연락하기
        </button>
      </div>
    </Section>
  );
}
