import { useState, type FormEvent } from 'react';
import { GUESTBOOK_KEY, GUESTBOOK_SEED, type GuestbookEntry } from '../data/wedding.ts';
import { useToast } from './Toast.tsx';
import Section from './Section.tsx';
import { FieldError } from './form.tsx';
import { aosBlock, btn, field, help, input, label, req, textarea } from '../styles/ui.ts';
import { cx, pad2 } from '../utils.ts';

const PAGE = 5;
type Key = 'name' | 'msg';

function load(): GuestbookEntry[] {
  try {
    const s: unknown = JSON.parse(localStorage.getItem(GUESTBOOK_KEY) ?? 'null');
    if (Array.isArray(s)) return s as GuestbookEntry[];
  } catch { /* ignore */ }
  return GUESTBOOK_SEED.slice();
}
function save(items: GuestbookEntry[]) {
  try { localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}
const fmt = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`; };

export default function Guestbook() {
  const toast = useToast();
  const [items, setItems] = useState<GuestbookEntry[]>(load);
  const [shown, setShown] = useState(PAGE);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Key, boolean>>>({});

  const check = (k: Key, v: string) => {
    const bad = v.trim().length === 0;
    setErrors((e) => ({ ...e, [k]: bad }));
    return !bad;
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const okName = check('name', name);
    const okMsg = check('msg', msg);
    if (!okName) { document.getElementById('gb-name')?.focus(); return; }
    if (!okMsg) { document.getElementById('gb-msg')?.focus(); return; }
    const next = [{ name: name.trim(), msg: msg.trim(), at: new Date().toISOString() }, ...items];
    setItems(next);
    save(next);
    setName('');
    setMsg('');
    toast('방명록이 등록되었어요');
  };

  return (
    <Section tint labelId="t-guest" eyebrow="GUESTBOOK" title="축하 한마디">
      <form {...aosBlock('grid gap-3')} noValidate onSubmit={submit}>
        <div className={field}>
          <label className={label} htmlFor="gb-name">이름<span className={req} aria-hidden="true">*</span></label>
          <input
            className={input} id="gb-name" maxLength={20} autoComplete="name" required
            value={name} aria-invalid={!!errors.name} aria-describedby="gb-name-err"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => { if (name || errors.name) check('name', name); }}
          />
          <FieldError id="gb-name-err" show={!!errors.name}>이름을 입력해 주세요. 두 분이 누구의 메시지인지 알 수 있어요.</FieldError>
        </div>
        <div className={field}>
          <label className={label} htmlFor="gb-msg">메시지<span className={req} aria-hidden="true">*</span></label>
          <textarea
            className={textarea} id="gb-msg" maxLength={200} required
            value={msg} aria-invalid={!!errors.msg} aria-describedby="gb-msg-help gb-msg-err"
            onChange={(e) => setMsg(e.target.value)}
            onBlur={() => { if (msg || errors.msg) check('msg', msg); }}
          />
          <span className={help} id="gb-msg-help">{msg.length}/200자</span>
          <FieldError id="gb-msg-err" show={!!errors.msg}>축하 메시지를 한 글자 이상 적어 주세요.</FieldError>
        </div>
        <button className={btn({ tone: 'primary', block: true })} type="submit">방명록 남기기</button>
      </form>

      <ul {...aosBlock('mt-6 grid list-none gap-3 p-0')} aria-live="polite">
        {items.slice(0, shown).map((it, i) => (
          <li className="rounded-md border border-line bg-surface p-4" key={`${it.at}-${i}`}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="od-truncate text-sm font-bold">{it.name}</span>
              <span className="text-xs whitespace-nowrap text-muted">{fmt(it.at)}</span>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap">{it.msg}</p>
          </li>
        ))}
      </ul>
      <p {...aosBlock('mt-6 rounded-md border border-dashed border-line px-4 py-8 text-center text-sm text-muted')} hidden={items.length > 0}>
        아직 남겨진 메시지가 없어요.<br />첫 번째 축하 인사를 남겨 주세요.
      </p>
      <button
        {...aosBlock(cx(btn({ size: 'sm', block: true }), 'mt-3'))}
        type="button"
        hidden={items.length <= shown}
        onClick={() => setShown((n) => n + PAGE)}
      >
        메시지 더 보기 ({Math.max(0, items.length - shown)}개)
      </button>
    </Section>
  );
}
