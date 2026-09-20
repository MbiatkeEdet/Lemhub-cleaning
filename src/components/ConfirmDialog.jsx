import Modal from "./Modal";

const TONE_STYLES = {
  default: "bg-pine text-linen hover:bg-pine-light shadow-[0_16px_32px_rgba(14,111,99,0.18)]",
  danger: "bg-clay text-linen hover:bg-clay/90 shadow-[0_16px_32px_rgba(219,75,60,0.2)]",
};

export default function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  busy = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex items-center rounded-md border border-mist px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={"inline-flex items-center rounded-md px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 " +
              (TONE_STYLES[tone] || TONE_STYLES.default)
            }
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
