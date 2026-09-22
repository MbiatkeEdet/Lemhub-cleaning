import { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext(null);
let idCounter = 0;

const TYPE_STYLES = {
  success: { chip: "bg-pine text-linen", border: "border-pine/20", icon: "✓" },
  error: { chip: "bg-clay text-linen", border: "border-clay/20", icon: "!" },
  warning: { chip: "bg-ink/30 text-ink", border: "border-brass/30", icon: "!" },
  info: { chip: "bg-sage-dim text-pine", border: "border-mist", icon: "i" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const notify = useCallback(
    (message, { type = "info", title, duration = 5000 } = {}) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type, title }]);
      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = {
    notify,
    success: (message, opts) => notify(message, { ...opts, type: "success" }),
    error: (message, opts) => notify(message, { ...opts, type: "error" }),
    warning: (message, opts) => notify(message, { ...opts, type: "warning" }),
    info: (message, opts) => notify(message, { ...opts, type: "info" }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed bottom-6 right-6 z-[200] flex w-[calc(100%-3rem)] max-w-sm flex-col gap-3">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
  return (
    <div
      role="alert"
      className={"animate-fade-up flex items-start gap-3 rounded-2xl border bg-white/95 px-4 py-3.5 backdrop-blur " +
        style.border
      }
    >
      <span className={"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs " + style.chip}>
        {style.icon}
      </span>
      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className="text-xs text-ink/45 mb-0.5">{toast.title}</p>
        )}
        <p className="text-sm leading-snug text-ink">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="shrink-0 text-ink/35 transition-colors hover:text-ink"
      >
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
