/**
 * The asterisk beside a required field's label.
 *
 * Marked aria-hidden because the input itself carries `required`, so a
 * screen reader already announces the constraint — reading "asterisk"
 * on top of that is noise. Sighted users get the convention; both get
 * the legend from <RequiredLegend />.
 */
export default function RequiredMark() {
  return (
    <span className="ml-0.5 text-clay" aria-hidden="true" title="Required">
      *
    </span>
  );
}

/** One line telling people what the asterisk means. Put it above a form. */
export function RequiredLegend({ className = "" }) {
  return (
    <p className={"text-xs text-ink/45 " + className}>
      Fields marked <span className="text-clay">*</span> are required.
    </p>
  );
}
