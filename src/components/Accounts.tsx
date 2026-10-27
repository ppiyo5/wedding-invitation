import { useState } from "react";
import { ACCOUNTS, type AccountGroup as Group } from "../data/wedding.ts";
import { Icon } from "./Icon.tsx";
import Section from "./Section.tsx";
import { useCopy } from "../hooks/useCopy.ts";
import { aosBlock, btn } from "../styles/ui.ts";
import { cx } from "../utils.ts";

function AccountGroup({ group, index }: { group: Group; index: number }) {
  const [open, setOpen] = useState(false);
  const copy = useCopy();
  const panelId = `acc-${index}`;
  return (
    <div
      {...aosBlock(
        "overflow-hidden rounded-md border border-line bg-surface [&+&]:mt-3",
      )}
    >
      <button
        className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-4 text-left font-semibold"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{group.side} 계좌번호</span>
        <Icon
          name="chevron-down"
          className={cx(
            "text-muted [--od-icon-size:20px] transition-transform duration-240 ease-out-soft motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>
      <div className="border-t border-line" id={panelId} hidden={!open}>
        {group.rows.map((r) => (
          <div
            className="od-row px-4 py-3 [--od-gap:12px] [&+&]:border-t [&+&]:border-dashed [&+&]:border-line"
            key={r.number}
          >
            <div className="od-field od-fill">
              <span className="text-sm text-muted">
                {r.bank} · {r.holder}
              </span>
              <span className="whitespace-nowrap font-semibold tabular-nums">
                {r.number}
              </span>
            </div>
            <button
              className={cx(
                btn({ size: "sm" }),
                "od-fixed [--od-icon-size:16px]",
              )}
              type="button"
              aria-label={`${r.holder} 계좌번호 복사`}
              onClick={() => copy(`${r.number}`, "계좌번호를")}
            >
              <Icon name="copy" /> 복사
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Accounts() {
  const groups = ACCOUNTS.map((g) => ({
    ...g,
    rows: g.rows.filter((r) => r.number && r.holder),
  })).filter((g) => g.rows.length);
  return (
    <Section
      tint
      labelId="t-account"
      eyebrow="WITH HEART"
      title="마음 전하실 곳"
      lead={
        <>
          참석이 어려우신 분들을 위해 계좌번호를 안내드립니다.
          <br />
          너그러운 양해 부탁드립니다.
        </>
      }
    >
      {groups.map((g, i) => (
        <AccountGroup key={g.side} group={g} index={i} />
      ))}
    </Section>
  );
}
