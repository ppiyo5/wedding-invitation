import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { WEDDING } from "../data/wedding.ts";
import { IconSprite, Icon } from "../components/Icon.tsx";
import { ToastProvider, useToast } from "../components/Toast.tsx";
import { FieldError, Segmented } from "../components/form.tsx";
import { copyText, cx } from "../utils.ts";
import {
  btn,
  eyebrow,
  field,
  fieldset,
  help,
  input,
  label,
  legend,
  req,
  textarea,
} from "../styles/ui.ts";
import {
  BASE_KEY,
  NAME_MAX,
  SIDES,
  buildLink,
  cleanName,
  defaultBase,
  downloadText,
  loadGuests,
  newId,
  saveGuests,
  toCsv,
  type Guest,
  type Side,
} from "./links.ts";

type Filter = "전체" | Side;
const DUP_MSG =
  '이미 목록에 있는 이름이에요. 구분이 필요하면 "홍길동(회사)"처럼 적어 주세요.';
const sideOptions = (prefix: string) =>
  SIDES.map((s, i) => ({ id: `${prefix}-${i}`, value: s, label: s }));

const card =
  "rounded-lg border border-line bg-surface p-6 max-md:rounded-md max-md:p-4 [&+&]:mt-4";
const h2 = "text-lg font-bold max-md:text-md";
const rowBtn = cx(btn({ size: "sm" }), "max-md:w-full max-md:px-1");
const chip = (side: Side) =>
  cx(
    "whitespace-nowrap rounded-full px-2 text-xs leading-[22px] font-semibold",
    side === "신랑측"
      ? "bg-accent-soft text-accent"
      : "bg-spring-soft text-spring",
  );

interface GuestRowProps {
  guest: Guest;
  base: string;
  onChange: (g: Guest) => void;
  onDelete: (g: Guest) => void;
  onCopy: (link: string, name: string) => void;
  isDuplicate: (name: string, exceptId?: string) => boolean;
}

function GuestRow({
  guest,
  base,
  onChange,
  onDelete,
  onCopy,
  isDuplicate,
}: GuestRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(guest.name);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const link = buildLink(base, guest.name);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const cancel = () => {
    setEditing(false);
    setDraft(guest.name);
    setError("");
  };
  const save = () => {
    const name = cleanName(draft);
    if (!name) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (isDuplicate(name, guest.id)) {
      setError(DUP_MSG);
      return;
    }
    onChange({ ...guest, name });
    setEditing(false);
    setError("");
  };

  if (editing) {
    return (
      <li className="border-b border-line py-3 max-md:py-4">
        <div className={field}>
          <label className={label} htmlFor={`edit-${guest.id}`}>
            이름 수정
          </label>
          <div className="od-row max-md:flex-wrap">
            <input
              ref={inputRef}
              id={`edit-${guest.id}`}
              className={cx(input, "od-fill max-md:basis-full")}
              maxLength={NAME_MAX}
              value={draft}
              aria-invalid={!!error}
              aria-describedby={`edit-err-${guest.id}`}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
            />
            <button
              type="button"
              className={cx(
                btn({ tone: "primary", size: "sm" }),
                "od-fixed max-md:flex-1",
              )}
              onClick={save}
            >
              저장
            </button>
            <button
              type="button"
              className={cx(btn({ size: "sm" }), "od-fixed max-md:flex-1")}
              onClick={cancel}
            >
              취소
            </button>
          </div>
          <FieldError id={`edit-err-${guest.id}`} show={!!error}>
            {error}
          </FieldError>
        </div>
      </li>
    );
  }

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-3 max-md:grid-cols-1 max-md:gap-2 max-md:py-4">
      <div className="od-field min-w-0">
        <span className="flex! flex-wrap items-center gap-2">
          <span className="font-bold">{guest.name}</span>
          {guest.sent && (
            <span className="text-xs font-semibold text-success">보냄</span>
          )}
          <span className={chip(guest.side)}>{guest.side}</span>
        </span>
        <a
          className="od-truncate text-sm text-muted no-underline hover:text-accent hover:underline"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          title={link}
        >
          {link}
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 [--od-icon-size:16px] max-md:grid max-md:grid-cols-3">
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-1 px-2 text-sm max-md:justify-center max-md:rounded-md max-md:border max-md:border-line">
          <input
            type="checkbox"
            className="size-[18px] accent-accent"
            checked={guest.sent}
            onChange={(e) => onChange({ ...guest, sent: e.target.checked })}
          />
          <span>보냄</span>
        </label>
        <button
          type="button"
          className={rowBtn}
          onClick={() => onCopy(link, guest.name)}
          aria-label={`${guest.name} 링크 복사`}
        >
          <Icon name="copy" /> 복사
        </button>
        <a
          className={rowBtn}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${guest.name} 청첩장 미리보기 (새 탭)`}
        >
          미리보기
        </a>
        <button
          type="button"
          className={rowBtn}
          onClick={() => {
            setDraft(guest.name);
            setEditing(true);
          }}
          aria-label={`${guest.name} 이름 수정`}
        >
          수정
        </button>
        {confirming ? (
          <span
            className="inline-flex gap-2 max-md:col-span-2 max-md:grid max-md:grid-cols-2"
            role="group"
            aria-label={`${guest.name} 삭제 확인`}
          >
            <button
              type="button"
              className={cx(
                btn({ tone: "danger", size: "sm" }),
                "max-md:w-full",
              )}
              onClick={() => onDelete(guest)}
            >
              삭제
            </button>
            <button
              type="button"
              className={rowBtn}
              onClick={() => setConfirming(false)}
            >
              취소
            </button>
          </span>
        ) : (
          <button
            type="button"
            className={cx(
              btn({ tone: "ghostDanger", size: "sm" }),
              "max-md:w-full max-md:px-1",
            )}
            onClick={() => setConfirming(true)}
            aria-label={`${guest.name} 삭제`}
          >
            삭제
          </button>
        )}
      </div>
    </li>
  );
}

function Admin() {
  const toast = useToast();
  const [guests, setGuests] = useState<Guest[]>(loadGuests);
  const [base, setBase] = useState<string>(() => {
    try {
      return localStorage.getItem(BASE_KEY) || defaultBase();
    } catch {
      return defaultBase();
    }
  });
  const [name, setName] = useState("");
  const [side, setSide] = useState<Side>(SIDES[0]);
  const [nameError, setNameError] = useState("");
  const [bulk, setBulk] = useState("");
  const [bulkSide, setBulkSide] = useState<Side>(SIDES[0]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("전체");

  useEffect(() => {
    saveGuests(guests);
  }, [guests]);
  useEffect(() => {
    try {
      localStorage.setItem(BASE_KEY, base);
    } catch {
      /* ignore */
    }
  }, [base]);

  const isDuplicate = (n: string, exceptId?: string) =>
    guests.some((g) => g.name === n && g.id !== exceptId);

  const addOne = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const n = cleanName(name);
    if (!n) {
      setNameError("받는 분 이름을 입력해 주세요.");
      return;
    }
    if (isDuplicate(n)) {
      setNameError(DUP_MSG);
      return;
    }
    setGuests((list) => [
      {
        id: newId(),
        name: n,
        side,
        sent: false,
        createdAt: new Date().toISOString(),
      },
      ...list,
    ]);
    setName("");
    setNameError("");
    toast(`${n} 님을 추가했어요`);
  };

  const addBulk = () => {
    const names = bulk.split(/[\n,]/).map(cleanName).filter(Boolean);
    const seen = new Set(guests.map((g) => g.name));
    const fresh: Guest[] = [];
    let skipped = 0;
    names.forEach((n) => {
      if (seen.has(n)) {
        skipped += 1;
        return;
      }
      seen.add(n);
      fresh.push({
        id: newId(),
        name: n,
        side: bulkSide,
        sent: false,
        createdAt: new Date().toISOString(),
      });
    });
    if (!fresh.length) {
      toast(
        skipped ? "모두 이미 목록에 있는 이름이에요" : "추가할 이름이 없어요",
      );
      return;
    }
    setGuests((list) => [...fresh.reverse(), ...list]);
    setBulk("");
    toast(
      `${fresh.length}명을 추가했어요${skipped ? ` (중복 ${skipped}명 제외)` : ""}`,
    );
  };

  const update = (g: Guest) =>
    setGuests((list) => list.map((x) => (x.id === g.id ? g : x)));
  const remove = (g: Guest) => {
    setGuests((list) => list.filter((x) => x.id !== g.id));
    toast(`${g.name} 님을 삭제했어요`);
  };
  const copyOne = async (link: string, n: string) =>
    toast(
      (await copyText(link))
        ? `${n} 님 링크를 복사했어요`
        : "복사하지 못했어요. 링크를 길게 눌러 복사해 주세요",
    );

  const visible = useMemo(() => {
    const q = query.trim();
    return guests.filter(
      (g) =>
        (filter === "전체" || g.side === filter) && (!q || g.name.includes(q)),
    );
  }, [guests, query, filter]);

  const copyAll = async () => {
    if (!visible.length) return;
    const text = visible
      .map((g) => `${g.name}\t${buildLink(base, g.name)}`)
      .join("\n");
    toast(
      (await copyText(text))
        ? `링크 ${visible.length}개를 복사했어요`
        : "복사하지 못했어요",
    );
  };
  const exportCsv = () => {
    if (!visible.length) return;
    downloadText(
      `초대링크_${WEDDING.groom.short}_${WEDDING.bride.short}.csv`,
      toCsv(visible, base),
    );
  };

  const sentCount = guests.filter((g) => g.sent).length;
  const inlineBtn = cx(
    btn({ size: "sm" }),
    "max-md:w-full max-md:px-2 [--od-icon-size:16px]",
  );

  return (
    <div className="mx-auto max-w-[760px] px-6 pt-12 pb-24 max-md:px-4 max-md:pt-8 max-md:pb-[calc(64px+env(safe-area-inset-bottom))]">
      <IconSprite />
      <header className="mb-8">
        <span className={cx(eyebrow, "text-left!")}>INVITATION LINKS</span>
        <h1 className="mt-2 font-display text-2xl font-bold max-md:text-xl">
          초대 링크 관리
        </h1>
        <p className="mt-2 text-sm text-muted">
          {WEDDING.groom.name} ♥︎ {WEDDING.bride.name} · {WEDDING.dateLabel}{" "}
          {WEDDING.timeLabel}
        </p>
      </header>

      <section className={card} aria-labelledby="h-base">
        <h2 className={cx(h2, "mb-4")} id="h-base">
          청첩장 주소
        </h2>
        <div className={field}>
          <label className={label} htmlFor="base-url">
            링크의 기본 주소
          </label>
          <input
            id="base-url"
            className={input}
            inputMode="url"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            aria-describedby="base-help"
          />
          <span className={help} id="base-help">
            청첩장을 올린 실제 주소로 바꿔 주세요. 이름은 주소 끝에{" "}
            <code className="rounded-[4px] bg-accent-soft px-1">?to=이름</code>
            으로 붙습니다.
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={btn({ size: "sm" })}
            onClick={() => setBase(defaultBase())}
          >
            지금 주소로 되돌리기
          </button>
        </div>
      </section>

      <section className={card} aria-labelledby="h-add">
        <h2 className={cx(h2, "mb-4")} id="h-add">
          받는 분 추가
        </h2>
        <form
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,220px)_auto] items-start gap-4 max-md:grid-cols-1 max-md:gap-3"
          noValidate
          onSubmit={addOne}
        >
          <div className={field}>
            <label className={label} htmlFor="new-name">
              이름
              <span className={req} aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="new-name"
              className={input}
              maxLength={NAME_MAX}
              value={name}
              autoComplete="off"
              aria-invalid={!!nameError}
              aria-describedby="new-name-err"
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (nameError && cleanName(name)) setNameError("");
              }}
            />
            <FieldError id="new-name-err" show={!!nameError}>
              {nameError}
            </FieldError>
          </div>
          <fieldset className={fieldset}>
            <legend className={legend}>구분</legend>
            <Segmented<Side>
              name="new-side"
              value={side}
              options={sideOptions("new-side")}
              onChange={setSide}
            />
          </fieldset>
          <button
            type="submit"
            className={cx(
              btn({ tone: "primary" }),
              "mt-[26px] [--od-icon-size:18px] max-md:mt-0 max-md:w-full",
            )}
          >
            <Icon name="plus" /> 추가
          </button>
        </form>

        <details className="mt-4 border-t border-line pt-3">
          <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-accent">
            여러 명 한 번에 추가
          </summary>
          <div className="mt-2 grid gap-4">
            <div className={field}>
              <label className={label} htmlFor="bulk-names">
                이름 목록
              </label>
              <textarea
                id="bulk-names"
                className={textarea}
                rows={5}
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                aria-describedby="bulk-help"
              />
              <span className={help} id="bulk-help">
                한 줄에 한 명씩, 또는 쉼표로 구분해 붙여넣으세요. 이미 있는
                이름은 건너뜁니다.
              </span>
            </div>
            <fieldset className={fieldset}>
              <legend className={legend}>구분</legend>
              <Segmented<Side>
                name="bulk-side"
                value={bulkSide}
                options={sideOptions("bulk-side")}
                onChange={setBulkSide}
              />
            </fieldset>
            <button
              type="button"
              className={btn({ block: true })}
              onClick={addBulk}
            >
              목록에 추가
            </button>
          </div>
        </details>
      </section>

      <section className={card} aria-labelledby="h-list">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className={h2} id="h-list">
            초대 목록
          </h2>
          <p className="text-sm text-muted">
            <span className="whitespace-nowrap">총 {guests.length}명</span> ·{" "}
            <span className="whitespace-nowrap">보냄 {sentCount}명</span>
          </p>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,300px)] items-end gap-4 max-md:grid-cols-1 max-md:gap-3">
          <div className={field}>
            <label className={label} htmlFor="search">
              이름 검색
            </label>
            <input
              id="search"
              className={input}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <fieldset className={fieldset}>
            <legend className={legend}>보기</legend>
            <Segmented<Filter>
              name="filter"
              cols={3}
              value={filter}
              options={(["전체", ...SIDES] as Filter[]).map((f, i) => ({
                id: `filter-${i}`,
                value: f,
                label: f,
              }))}
              onChange={setFilter}
            />
          </fieldset>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 max-md:grid max-md:grid-cols-2">
          <button
            type="button"
            className={inlineBtn}
            onClick={copyAll}
            disabled={!visible.length}
          >
            <Icon name="copy" /> 보이는 링크 모두 복사
          </button>
          <button
            type="button"
            className={inlineBtn}
            onClick={exportCsv}
            disabled={!visible.length}
          >
            CSV 내려받기
          </button>
        </div>

        {guests.length === 0 ? (
          <p className="mt-6 rounded-md border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
            아직 받는 분이 없어요.
            <br />
            위에서 이름을 추가하면 그 사람만의 초대 링크가 만들어집니다.
          </p>
        ) : visible.length === 0 ? (
          <p className="mt-6 rounded-md border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
            조건에 맞는 분이 없어요. 검색어나 보기 설정을 바꿔 보세요.
          </p>
        ) : (
          <ul className="mt-6 list-none border-t border-line p-0 max-md:mt-4">
            {visible.map((g) => (
              <GuestRow
                key={g.id}
                guest={g}
                base={base}
                onChange={update}
                onDelete={remove}
                onCopy={copyOne}
                isDuplicate={isDuplicate}
              />
            ))}
          </ul>
        )}
      </section>

      <p className="mt-4 text-xs text-muted">
        목록은 지금 쓰는 브라우저에만 저장됩니다. 다른 기기에서 쓰려면 CSV로
        내려받아 두세요.
      </p>
    </div>
  );
}

export default function AdminApp() {
  return (
    <ToastProvider
      container={typeof document !== "undefined" ? document.body : null}
    >
      <Admin />
    </ToastProvider>
  );
}
