import type { ReactNode } from 'react';
import { aosBlock, eyebrow as eyebrowCls, section, sectionBody, sectionLead, sectionTint, sectionTitle } from '../styles/ui.ts';
import { cx } from '../utils.ts';

interface SectionProps {
  labelId: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  tint?: boolean;
  /** extra nodes rendered after the body (sheets, lightbox — they portal out) */
  after?: ReactNode;
  children: ReactNode;
}

/* Section scaffold: eyebrow, title and lead each fade up on their own; every direct
   block inside the body opts in with `aosBlock()`. */
export default function Section({ labelId, eyebrow, title, lead, tint, after, children }: SectionProps) {
  return (
    <section className={cx(section, tint && sectionTint)} aria-labelledby={labelId}>
      <span {...aosBlock(eyebrowCls)}>{eyebrow}</span>
      <h2 {...aosBlock(sectionTitle)} id={labelId}>{title}</h2>
      {lead && <p {...aosBlock(sectionLead)}>{lead}</p>}
      <div className={sectionBody}>{children}</div>
      {after}
    </section>
  );
}

/** Render string lines separated by <br/> */
export function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
      ))}
    </>
  );
}
