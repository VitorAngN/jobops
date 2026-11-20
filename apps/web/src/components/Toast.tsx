import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ToastData = { text: string; action?: { label: string; run: () => void } };
const Ctx = createContext<(t: ToastData) => void>(() => {});

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timer = useRef<number>(undefined);
  const show = useCallback((t: ToastData) => {
    window.clearTimeout(timer.current);
    setToast(t);
    timer.current = window.setTimeout(() => setToast(null), 5000);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast.text}
          {toast.action && (
            <button onClick={() => { toast.action!.run(); setToast(null); }}>{toast.action.label}</button>
          )}
        </div>
      )}
    </Ctx.Provider>
  );
}
