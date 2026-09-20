const STATUS_STYLES = {
  pending_confirmation: "bg-brass/15 text-brass border-brass/30",
  awaiting_payment_manual: "bg-brass/15 text-brass border-brass/30",
  confirmed: "bg-sage/15 text-pine border-sage-dim",
  assigned: "bg-sage/15 text-pine border-sage-dim",
  in_progress: "bg-pine/10 text-pine border-pine/30",
  completed: "bg-pine text-linen border-pine",
  cancelled: "bg-clay/10 text-clay border-clay/30",
};

export function statusBadgeClasses(status) {
  return STATUS_STYLES[status] || "bg-mist/40 text-ink/60 border-mist";
}

export function statusLabel(status) {
  return (status || "").replace(/_/g, " ");
}
