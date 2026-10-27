import { useEffect, useState } from "react";
import { WEDDING } from "../data/wedding.ts";
import { useShell } from "./shellContext.ts";
import { useToast } from "./Toast.tsx";
import { Icon } from "./Icon.tsx";
import { copyText, cx, prefersReducedMotion } from "../utils.ts";

const THRESHOLD = 600;

const actionBtn = cx(
  "grid size-11 cursor-pointer place-items-center rounded-full border border-line bg-white/95 text-ink",
  "shadow-[0_4px_12px_rgb(18_22_20/.12)] [--od-icon-size:20px] transition-colors duration-160",
  "hover:border-accent hover:text-accent motion-reduce:transition-none",
);

/* Bottom-right stack: 맨 위로 (appears after scrolling) above 카카오톡 공유 and 링크 복사.
   The top button keeps its slot when hidden so the share buttons never jump.
   The whole stack steps aside while a sheet, the lightbox or the intro is open. */
export default function FloatingActions() {
  const { scrollerRef, locked } = useShell();
  const toast = useToast();
  const [past, setPast] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setPast(el.scrollTop > THRESHOLD);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [scrollerRef]);

  const showTop = past && !locked;

  const toTop = () => {
    scrollerRef.current?.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    // move the reading position back to the top for keyboard and screen-reader users
    document.getElementById("cover-title")?.focus({ preventScroll: true });
  };
  const share = async () => {
    const { groom, bride, venue } = WEDDING;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${groom.name} ♥︎ ${bride.name} 결혼합니다`,
          text: `${WEDDING.dateLabel} ${WEDDING.timeLabel}, ${venue.name}`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    toast("카카오톡 공유는 앱 키 연동 후 사용할 수 있어요");
  };
  const copyLink = async () => {
    const ok = await copyText(window.location.href);
    toast(
      ok
        ? "청첩장 링크를 복사했어요"
        : "복사하지 못했어요. 주소창의 링크를 직접 복사해 주세요",
    );
  };

  return (
    <div
      className={cx(
        "absolute right-3 bottom-[calc(var(--phone-safe-bottom)+16px)] z-30 flex flex-col items-end gap-2",
        locked && "invisible",
      )}
      inert={locked}
    >
      <button
        type="button"
        className={cx(
          actionBtn,
          showTop
            ? "visible translate-y-0 opacity-100 transition-[opacity,translate,visibility,color,border-color] duration-240 ease-out-soft"
            : "invisible translate-y-2 opacity-0 transition-[opacity,translate,visibility] duration-160 ease-in-soft",
        )}
        aria-label="맨 위로 가기"
        title="맨 위로"
        inert={!showTop}
        aria-hidden={!showTop || undefined}
        onClick={toTop}
      >
        <Icon name="arrow-up" />
      </button>
      <button
        type="button"
        className={actionBtn}
        aria-label="카카오톡 공유"
        title="카카오톡 공유"
        onClick={share}
      >
        <Icon name="share" />
      </button>
      <button
        type="button"
        className={actionBtn}
        aria-label="링크 복사"
        title="링크 복사"
        onClick={copyLink}
      >
        <Icon name="link" />
      </button>
    </div>
  );
}
