import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export default function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handleKey(e) {
      if (e.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={"relative w-full animate-fade-up outline-none rounded-xl border border-mist bg-paper p-6 lg:p-7 " +
          (SIZES[size] || SIZES.md)
        }
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-linen hover:text-ink"
        >
          ✕
        </button>

        {title && <h2 className="font-display text-xl text-ink mb-1 pr-8">{title}</h2>}
        {description && <p className="text-sm text-ink/60 leading-relaxed mb-5">{description}</p>}

        {children}

        {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
