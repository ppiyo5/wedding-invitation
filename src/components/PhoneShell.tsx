import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ShellContext, type Shell } from "./shellContext.ts";
import { ToastProvider } from "./Toast.tsx";

interface PhoneShellProps {
  children: ReactNode;
  /** screen-level layers rendered over the page (intro, petals, floating controls) */
  chrome?: ReactNode;
}

/* Open Design neutral handset shell (markup and CSS kept intact in styles/shell.css).
   The app mounts in .phone-content; overlays portal into .phone-screen. */
export default function PhoneShell({ children, chrome }: PhoneShellProps) {
  const [screenEl, setScreenEl] = useState<HTMLElement | null>(null);
  const [overlays, setOverlays] = useState(0);
  const [darkOverlay, setDarkOverlay] = useState(false);
  const scrollerRef = useRef<HTMLElement | null>(null);

  const lock = useCallback((dark = false) => {
    setOverlays((n) => n + 1);
    if (dark) setDarkOverlay(true);
    return () => {
      setOverlays((n) => Math.max(0, n - 1));
      if (dark) setDarkOverlay(false);
    };
  }, []);

  const locked = overlays > 0;
  const value = useMemo<Shell>(
    () => ({ screenEl, scrollerRef, lock, locked }),
    [screenEl, lock, locked],
  );

  return (
    <ShellContext.Provider value={value}>
      <ToastProvider>
        <div className="phone-frame" data-phone-shell data-platform="neutral">
          <span className="hardware-button volume" aria-hidden="true" />
          <span className="hardware-button power" aria-hidden="true" />

          <section
            className={`phone-screen${darkOverlay ? " is-dark-overlay" : ""}`}
            data-phone-screen
            ref={setScreenEl}
          >
            <main
              className="phone-content"
              data-phone-content
              ref={scrollerRef}
              inert={locked}
              aria-hidden={locked || undefined}
            >
              {/* APP CONTENT START */}
              {children}
              {/* APP CONTENT END */}
            </main>

            <div className="status-bar" aria-hidden="true">
              <span className="status-time">3:21</span>
              <span className="status-cutout-zone" />
              <span className="status-icons">
                <svg className="connectivity" viewBox="0 0 15 12">
                  <path d="M1.5 10.5v-2m4 2v-4.5m4 4.5v-7m4 7v-9" />
                </svg>
                <svg className="wifi" viewBox="0 0 16 12">
                  <path d="M1.5 4.7a9.2 9.2 0 0 1 13 0M4.2 7.3a5.4 5.4 0 0 1 7.6 0M6.9 10a1.55 1.55 0 0 1 2.2 0" />
                </svg>
                <svg className="battery" viewBox="0 0 20 11">
                  <rect x=".75" y="1.25" width="16.5" height="8.5" rx="2" />
                  <path
                    d="M18.5 4v3M3.2 3.4h10.4v4.2H3.2z"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </span>
            </div>
            <div className="camera-dot" aria-hidden="true" />

            {screenEl && chrome}

            <div className="gesture-indicator" aria-hidden="true" />
          </section>
        </div>
      </ToastProvider>
    </ShellContext.Provider>
  );
}
