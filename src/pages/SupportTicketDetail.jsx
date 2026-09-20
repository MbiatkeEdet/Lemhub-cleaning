import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addSupportTicketMessage,
  fetchSupportTicket,
  reopenSupportTicket,
  resolveSupportTicket,
} from "../lib/api";

export default function SupportTicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function load() {
    return fetchSupportTicket(id).then(setTicket);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleReply(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      await addSupportTicketMessage(id, { body: body.trim(), is_internal_note: isInternalNote });
      setBody("");
      setIsInternalNote(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus() {
    setSubmitting(true);
    try {
      if (ticket.status === "resolved") {
        await reopenSupportTicket(id);
      } else {
        await resolveSupportTicket(id);
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !ticket) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-ink/50">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        to="/support/console"
        className="text-xs text-ink/45 hover:text-ink"
      >
        ← Back to tickets
      </Link>

      <div className="mt-4 mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink mb-2">{ticket.subject}</h1>
          <p className="text-sm text-ink/60">
            {ticket.contact_name}
            {ticket.contact_email && <> · {ticket.contact_email}</>}
            {ticket.contact_phone && <> · {ticket.contact_phone}</>}
          </p>
          {ticket.booking && (
            <p className="text-sm text-ink/50 mt-1">
              Booking: {ticket.booking.apartment_label} — {ticket.booking.service_address_text}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={submitting}
          className="shrink-0 rounded-md border border-ink/20 px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
        >
          {ticket.status === "resolved" ? "Reopen" : "Mark resolved"}
        </button>
      </div>

      <div className="grid gap-3 mb-8">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={"rounded-xl border px-5 py-4 " +
              (m.is_internal_note
                ? "border-mist bg-linen"
                : "border-mist bg-white/60")
            }
          >
            <p className="text-xs text-ink/40 mb-2">
              {m.author_name ? m.author_name : ticket.contact_name}
              {m.is_internal_note && " · internal note"}
              {" · "}
              {new Date(m.created_at).toLocaleString()}
            </p>
            <p className="text-sm text-ink/80 whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleReply} className="rounded-2xl border border-mist bg-white/60 p-6">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Write a reply…"
          className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine resize-none mb-4"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink/60">
            <input
              type="checkbox"
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
            />
            Internal note (not sent to customer)
          </label>
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="inline-flex items-center rounded-md bg-pine px-6 py-2.5 text-sm font-medium text-linen disabled:opacity-60"
          >
            {submitting ? "Sending…" : isInternalNote ? "Add note" : "Send reply"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-clay">{error}</p>}
      </form>
    </div>
  );
}
