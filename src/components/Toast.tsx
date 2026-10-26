import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ShellContext } from "./shellContext.ts";
import { Icon } from "./Icon.tsx";
import { cx } from "../utils.ts";

type Toast = (text: string) => void;
const ToastContext = createContext<Toast>(() => {});
export const useToast = (): Toast => useContext(ToastContext);

export const toastClass = (shown: boolean, extra?: string) =>
  cx(
    "pointer-events-none z-50 flex w-max max-w-[calc(100%-136px)] items-center gap-2 rounded-md bg-ink px-4 py-3",
    "font-body text-sm text-white [word-break:keep-all] [--od-icon-size:18px]",
    "left-1/2 -translate-x-1/2 transition-[opacity,translate] duration-240 ease-out-soft motion-reduce:transition-none",
    shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
    extra,
  );

/** Toast portalled into the phone screen (or into `container` when given, e.g. the admin page). */
export function ToastProvider({
  children,
  container,
}: {
  children: ReactNode;
  container?: HTMLElement | null;
}) {
  const shell = useContext(ShellContext);
  const target = container ?? shell?.screenEl ?? null;
  const [msg, setMsg] = useState("");
  const [shown, setShown] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const toast = useCallback<Toast>((text) => {
    setMsg(text);
    setShown(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShown(false), 2200);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {target &&
        createPortal(
          <div
            className={toastClass(
              shown,
              container
                ? "fixed bottom-[calc(24px+env(safe-area-inset-bottom))]"
                : "absolute bottom-[calc(var(--phone-safe-bottom)+64px)]",
            )}
            role="status"
            aria-live="polite"
          >
            <Icon name="check" className="text-[#c9e3d2]" />
            <span>{msg}</span>
          </div>,
          target,
        )}
    </ToastContext.Provider>
  );
}
