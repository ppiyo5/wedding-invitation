/* Shared Tailwind class recipes — composed so no two recipes set the same property. */
import { cx } from '../utils.ts';

type Tone = 'default' | 'primary' | 'danger' | 'ghostDanger';
type Size = 'md' | 'sm' | 'compact';

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-md border font-semibold no-underline cursor-pointer ' +
  'transition-colors duration-160 ease-out-soft disabled:cursor-not-allowed disabled:opacity-55';
const btnTone: Record<Tone, string> = {
  default: 'border-line bg-surface text-ink hover:border-accent hover:bg-accent-soft',
  primary: 'border-accent bg-accent text-accent-ink hover:border-accent-strong hover:bg-accent-strong',
  danger: 'border-error bg-error text-white hover:border-error-strong hover:bg-error-strong',
  ghostDanger: 'border-line bg-surface text-error hover:border-error hover:bg-error-soft',
};
const btnSize: Record<Size, string> = {
  md: 'min-h-12 px-6 text-md',
  sm: 'min-h-11 px-4 text-sm',
  compact: 'min-h-11 px-2 text-sm',
};

export function btn({ tone = 'default', size = 'md', block = false }: { tone?: Tone; size?: Size; block?: boolean } = {}): string {
  return cx(btnBase, btnTone[tone], btnSize[size], block && 'w-full');
}

/* section scaffolding */
export const section = 'px-6 py-16 border-line [&+&]:border-t';
export const sectionTint = 'bg-surface';
export const eyebrow = 'block text-center text-xs font-semibold tracking-[.24em] text-accent';
export const sectionTitle = 'mt-2 text-center font-display text-xl font-bold';
export const sectionLead = 'mt-3 text-center text-sm text-muted';
export const sectionBody = 'mt-8';
export const card = 'rounded-md border border-line bg-surface';

/* forms */
export const field = 'od-field text-left [--od-gap:4px]';
export const fieldset = 'od-field m-0 min-w-0 border-0 p-0 text-left [--od-gap:4px]';
export const label = 'text-sm font-semibold';
export const legend = 'mb-1 p-0 text-sm font-semibold';
export const req = 'ml-0.5 text-error';
export const help = 'text-xs text-muted';
export const fieldError = 'flex items-center gap-1 text-xs text-error [--od-icon-size:14px]';
const control =
  'w-full rounded-sm border border-field bg-surface p-3 text-md text-ink transition-colors duration-160 ' +
  'focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] focus:outline-none aria-[invalid=true]:border-error';
export const input = cx(control, 'min-h-12');
export const textarea = cx(control, 'min-h-24 resize-y leading-[1.6]');

/* segmented radio: the input is the `peer` of the label right after it */
export const segInput = 'peer absolute opacity-0 pointer-events-none';
export const segLabel =
  'flex min-h-12 cursor-pointer items-center justify-center rounded-sm border border-field bg-surface text-sm font-medium ' +
  'transition-colors duration-160 ' +
  'peer-checked:border-accent peer-checked:bg-accent peer-checked:font-bold peer-checked:text-accent-ink ' +
  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-focus-visible:outline-solid';

/* overlays */
export const iconBtnBase =
  'grid size-11 cursor-pointer place-items-center rounded-full bg-transparent [--od-icon-size:22px]';
export const iconBtn = cx(iconBtnBase, 'border-0 hover:bg-accent-soft');
export const roundBtn =
  'grid size-11 place-items-center rounded-full border border-line text-accent no-underline [--od-icon-size:20px] hover:bg-accent-soft';
export const floatBtn =
  'grid size-11 cursor-pointer place-items-center rounded-full border border-line bg-white/95 text-muted ' +
  'shadow-[0_4px_12px_rgb(18_22_20/.12)] [--od-icon-size:20px] transition-colors duration-160 ' +
  'hover:border-accent hover:text-accent ' +
  'aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-ink aria-pressed:hover:bg-accent-strong aria-pressed:hover:text-accent-ink ' +
  'aria-busy:cursor-progress motion-reduce:transition-none';

/* scroll fade-up block (driven by aos.ts): hidden until `data-aos-in`, then stays put */
export const aos =
  'opacity-0 translate-y-[50px] transition-[opacity,translate] duration-600 ease-[ease] ' +
  'data-aos-in:opacity-100 data-aos-in:translate-y-0 data-aos-done:transition-none ' +
  'motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none';
export const aosProps = { 'data-aos': '' } as const;
/** Props for a fade-up block: `<div {...aosBlock('mt-4 …')}>` */
export const aosBlock = (className?: string) => ({ ...aosProps, className: cx(aos, className) });
