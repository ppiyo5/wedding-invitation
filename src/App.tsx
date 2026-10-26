import { useEffect, useState } from "react";
import PhoneShell from "./components/PhoneShell.tsx";
import { useShell } from "./components/shellContext.ts";
import { IconSprite } from "./components/Icon.tsx";
import Cover from "./components/Cover.tsx";
import Invitation from "./components/Invitation.tsx";
import DateSection from "./components/DateSection.tsx";
import Gallery from "./components/Gallery.tsx";
import Location from "./components/Location.tsx";
import Accounts from "./components/Accounts.tsx";
import Closing from "./components/Closing.tsx";
import Petals from "./components/Petals.tsx";
import FloatingControls, {
  usePetalsPreference,
} from "./components/FloatingControls.tsx";
import IntroCover from "./components/IntroCover.tsx";
import FloatingActions from "./components/FloatingActions.tsx";
import { useGuestName } from "./hooks/useGuestName.ts";
import { prefersReducedMotion, pad2 } from "./utils.ts";
import { startAos } from "./aos.ts";

/* Blocks fade up as they scroll into view (see aos.ts). Starts after the intro has left. */
function useAos(active: boolean) {
  const { scrollerRef } = useShell();
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || !active) return undefined;
    return startAos(root, { reduce: prefersReducedMotion() });
  }, [scrollerRef, active]);
}

/* Intro shows once per day (local date). ?intro=1 forces it, for testing. */
const INTRO_DATE_KEY = "inv-intro-date";
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
function shouldShowIntro(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get("intro") === "1")
      return true;
    return localStorage.getItem(INTRO_DATE_KEY) !== todayKey();
  } catch {
    return true;
  }
}
function markIntroSeen() {
  try {
    localStorage.setItem(INTRO_DATE_KEY, todayKey());
  } catch {
    /* ignore */
  }
}

function InvitationPage({ active }: { active: boolean }) {
  useAos(active);
  return (
    <div className="bg-bg font-body text-md text-ink [overflow-wrap:anywhere] [word-break:keep-all]">
      <IconSprite />
      <Cover />
      <Invitation />
      <DateSection />
      <Gallery />
      <Location />
      <Accounts />
      {/* <Rsvp />
      <Guestbook /> */}
      <Closing />
    </div>
  );
}

export default function App() {
  const [petalsOn, setPetalsOn] = usePetalsPreference();
  const guest = useGuestName();
  const [introDone, setIntroDone] = useState(() => !shouldShowIntro());
  const finishIntro = (byKeyboard: boolean) => {
    markIntroSeen();
    setIntroDone(true);
    // Hand focus to the invitation only for keyboard users (the page stays inert until the
    // intro's lock is released, hence the two frames). Pointer users keep their place.
    if (!byKeyboard) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document.getElementById("cover-title")?.focus({ preventScroll: true });
      }),
    );
  };
  return (
    <PhoneShell
      chrome={
        <>
          {!introDone && <IntroCover guest={guest} onDone={finishIntro} />}
          <Petals enabled={petalsOn} />
          <FloatingActions />
          <FloatingControls
            petalsOn={petalsOn}
            onTogglePetals={() => setPetalsOn((v) => !v)}
            hintReady={introDone}
          />
        </>
      }
    >
      <InvitationPage active={introDone} />
    </PhoneShell>
  );
}
