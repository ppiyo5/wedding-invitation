import { useRef, useState, type FormEvent } from 'react';
import { WEDDING } from '../data/wedding.ts';
import { Icon } from './Icon.tsx';
import { Sheet } from './Overlay.tsx';
import Section from './Section.tsx';
import { FieldError, Segmented } from './form.tsx';
import { aosBlock, btn, field, fieldset, help, input, label, legend, req, textarea } from '../styles/ui.ts';
import { cx } from '../utils.ts';

type Side = '신랑측' | '신부측';
type Attend = '참석' | '불참';
type Meal = '식사 예정' | '식사 안 함' | '미정';

interface RsvpForm {
  side: Side | '';
  attend: Attend | '';
  name: string;
  count: number;
  meal: Meal;
  note: string;
}
type RuleKey = 'side' | 'attend' | 'name';
type Status = 'idle' | 'sending' | 'done';

const EMPTY: RsvpForm = { side: '', attend: '', name: '', count: 1, meal: '식사 예정', note: '' };
const RULES: Record<RuleKey, { label: string; check: (f: RsvpForm) => boolean; focusId: string }> = {
  side: { label: '하객 구분', check: (f) => !!f.side, focusId: 'side-g' },
  attend: { label: '참석 여부', check: (f) => !!f.attend, focusId: 'att-y' },
  name: { label: '성함', check: (f) => f.name.trim().length >= 2, focusId: 'rsvp-name' },
};
const RULE_KEYS = Object.keys(RULES) as RuleKey[];

const stepBtn = 'grid size-12 cursor-pointer place-items-center rounded-sm border border-field bg-surface disabled:cursor-not-allowed disabled:opacity-40';

export default function Rsvp() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RsvpForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<RuleKey, boolean>>>({});
  const [summary, setSummary] = useState<RuleKey[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<RsvpForm | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof RsvpForm>(k: K, v: RsvpForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const validate = (k: RuleKey, f: RsvpForm = form) => {
    const ok = RULES[k].check(f);
    setErrors((e) => ({ ...e, [k]: !ok }));
    return ok;
  };

  const openSheet = () => {
    if (status === 'done') { setForm(EMPTY); setErrors({}); setSummary([]); setStatus('idle'); }
    setOpen(true);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const failed = RULE_KEYS.filter((k) => !RULES[k].check(form));
    setErrors(Object.fromEntries(RULE_KEYS.map((k) => [k, failed.includes(k)])));
    if (failed.length) {
      setSummary(failed);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSummary([]);
    setStatus('sending');
    window.setTimeout(() => {
      setResult({ ...form, name: form.name.trim() });
      setStatus('done');
      // The submit button unmounts with the form; keep focus inside the dialog.
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[aria-labelledby="sheet-rsvp-title"] [data-sheet-close]')?.focus();
      });
    }, 900);
  };

  const attending = form.attend !== '불참';
  const doneMsg = result && (result.attend === '참석'
    ? `${result.name}님${result.count > 1 ? ` 외 ${result.count - 1}명` : ''}, ${WEDDING.month}월 ${WEDDING.day}일에 뵙겠습니다.`
    : `${result.name}님, 마음만으로도 큰 힘이 됩니다. 감사합니다.`);

  return (
    <Section
      labelId="t-rsvp"
      eyebrow="R.S.V.P."
      title="참석 여부를 알려주세요"
      after={(
        <Sheet
          open={open}
          onClose={() => setOpen(false)}
          title="참석 의사 전달"
          titleId="sheet-rsvp-title"
          footer={status !== 'done' && (
            <button className={btn({ tone: 'primary', block: true })} type="submit" form="rsvp-form" disabled={status === 'sending'}>
              {status === 'sending'
                ? <><span className="size-[18px] animate-spinner rounded-full border-2 border-white/40 border-t-white motion-reduce:[animation-duration:2s]" aria-hidden="true" /> 보내는 중…</>
                : '회신 보내기'}
            </button>
          )}
        >
          {status === 'done' ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-accent-soft text-success [--od-icon-size:32px]"><Icon name="check" /></div>
              <h3 className="font-display text-lg">전달되었습니다</h3>
              <p className="mt-2 text-sm text-muted">{doneMsg}</p>
            </div>
          ) : (
            <form className="grid gap-6" id="rsvp-form" noValidate onSubmit={submit}>
              <div className="rounded-sm border border-error bg-error-soft px-4 py-3 text-sm text-error" role="alert" tabIndex={-1} ref={summaryRef} hidden={!summary.length}>
                <strong>확인이 필요한 항목이 있어요</strong>
                <ul className="mt-1 list-disc pl-4">
                  {summary.map((k) => (
                    <li key={k}>
                      <a
                        className="text-error underline"
                        href={`#${RULES[k].focusId}`}
                        onClick={(e) => { e.preventDefault(); document.getElementById(RULES[k].focusId)?.focus(); }}
                      >
                        {RULES[k].label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <fieldset className={fieldset}>
                <legend className={legend}>어느 쪽 하객이신가요?<span className={req} aria-hidden="true">*</span></legend>
                <Segmented<Side>
                  name="side"
                  value={form.side}
                  options={[{ id: 'side-g', value: '신랑측', label: '신랑측' }, { id: 'side-b', value: '신부측', label: '신부측' }]}
                  onChange={(v) => { set('side', v); validate('side', { ...form, side: v }); }}
                />
                <FieldError id="f-side-err" show={!!errors.side}>신랑측·신부측 중 하나를 골라 주세요.</FieldError>
              </fieldset>

              <fieldset className={fieldset}>
                <legend className={legend}>참석 여부<span className={req} aria-hidden="true">*</span></legend>
                <Segmented<Attend>
                  name="attend"
                  value={form.attend}
                  options={[{ id: 'att-y', value: '참석', label: '참석할게요' }, { id: 'att-n', value: '불참', label: '어려워요' }]}
                  onChange={(v) => { set('attend', v); validate('attend', { ...form, attend: v }); }}
                />
                <FieldError id="f-attend-err" show={!!errors.attend}>참석 여부를 선택해 주세요.</FieldError>
              </fieldset>

              <div className={field}>
                <label className={label} htmlFor="rsvp-name">성함<span className={req} aria-hidden="true">*</span></label>
                <input
                  className={input} id="rsvp-name" name="name" maxLength={20} autoComplete="name"
                  value={form.name} aria-invalid={!!errors.name} aria-describedby="f-name-err"
                  onChange={(e) => set('name', e.target.value)}
                  onBlur={() => { if (form.name || errors.name) validate('name'); }}
                />
                <FieldError id="f-name-err" show={!!errors.name}>성함을 2자 이상 입력해 주세요. 명단 확인에 사용해요.</FieldError>
              </div>

              {attending && (
                <>
                  <div className={field}>
                    <span className={label} id="count-label">본인 포함 참석 인원</span>
                    <div className="flex items-center gap-2" role="group" aria-labelledby="count-label">
                      <button className={stepBtn} type="button" aria-label="인원 줄이기" disabled={form.count <= 1} onClick={() => set('count', Math.max(1, form.count - 1))}><Icon name="minus" /></button>
                      <output className="min-w-16 text-center text-lg font-bold whitespace-nowrap tabular-nums" aria-live="polite">{form.count}명</output>
                      <button className={stepBtn} type="button" aria-label="인원 늘리기" disabled={form.count >= 10} onClick={() => set('count', Math.min(10, form.count + 1))}><Icon name="plus" /></button>
                    </div>
                    <span className={help}>최대 10명까지 선택할 수 있어요</span>
                  </div>

                  <fieldset className={fieldset}>
                    <legend className={legend}>식사 여부</legend>
                    <Segmented<Meal>
                      name="meal"
                      cols={3}
                      value={form.meal}
                      options={[
                        { id: 'meal-y', value: '식사 예정', label: '예정' },
                        { id: 'meal-n', value: '식사 안 함', label: '안 함' },
                        { id: 'meal-u', value: '미정', label: '미정' },
                      ]}
                      onChange={(v) => set('meal', v)}
                    />
                  </fieldset>
                </>
              )}

              <div className={field}>
                <label className={label} htmlFor="rsvp-note">전하실 말씀 <span className={cx(help, 'inline')}>(선택)</span></label>
                <textarea className={textarea} id="rsvp-note" name="note" maxLength={100} value={form.note} onChange={(e) => set('note', e.target.value)} />
              </div>
            </form>
          )}
        </Sheet>
      )}
    >
      <div {...aosBlock('rounded-lg border border-line bg-surface p-6 text-center')}>
        <p className="text-sm text-muted">원활한 예식 준비를 위해<br />{WEDDING.rsvpDeadline}까지 회신 부탁드립니다.</p>
        <button className={cx(btn({ tone: 'primary', block: true }), 'mt-6')} type="button" onClick={openSheet}>
          {status === 'done' ? '회신 다시 보내기' : '참석 의사 전달하기'}
        </button>
        <p className="mt-3 font-semibold text-success" role="status" hidden={!result || status !== 'done'}>
          {result && `${result.name}님의 ${result.attend === '참석' ? '참석' : '불참'} 회신이 전달되었어요`}
        </p>
      </div>
    </Section>
  );
}
