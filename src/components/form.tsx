import type { ReactNode } from 'react';
import { Icon } from './Icon.tsx';
import { fieldError, segInput, segLabel } from '../styles/ui.ts';
import { cx } from '../utils.ts';

export function FieldError({ id, show, children }: { id: string; show: boolean; children: ReactNode }) {
  return (
    <span className={fieldError} id={id} hidden={!show}>
      <Icon name="alert" /><span>{children}</span>
    </span>
  );
}

export interface SegOption<V extends string> { id: string; value: V; label: string }

/* Segmented radio group. Each input/label pair sits in its own `contents` wrapper so the
   `peer-checked` styles only see their own input. */
export function Segmented<V extends string>({ name, value, options, onChange, cols = 2 }: {
  name: string;
  value: V | '';
  options: ReadonlyArray<SegOption<V>>;
  onChange: (v: V) => void;
  cols?: 2 | 3;
}) {
  return (
    <div className={cx('grid gap-2', cols === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
      {options.map((o) => (
        <span key={o.id} className="contents">
          <input className={segInput} type="radio" name={name} id={o.id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          <label className={segLabel} htmlFor={o.id}>{o.label}</label>
        </span>
      ))}
    </div>
  );
}
