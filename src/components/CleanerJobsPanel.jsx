import { useEffect, useState } from "react";
import { arriveAtJob, completeJob, confirmCheckin, fetchCleanerJobs, raiseJobSos } from "../lib/api";
import { enablePushNotifications, pushSupported } from "../lib/push";
import { statusBadgeClasses, statusLabel } from "../lib/status";
import { formatShortDate } from "../lib/dates";

const PUSH_ENABLED_KEY = "tidynow_push_enabled";

const ACCESS_METHOD_LABEL = {
  access_code: "Access code",
  someone_present: "Someone will be present",
  call_on_arrival: "Call on arrival",
  other: "Other",
};

export default function CleanerJobsPanel() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pushEnabled, setPushEnabled] = useState(
    () => localStorage.getItem(PUSH_ENABLED_KEY) === "1"
  );
  const [enablingPush, setEnablingPush] = useState(false);

  function load() {
    return fetchCleanerJobs().then(setJobs);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleEnablePush() {
    setEnablingPush(true);
    setError("");
    try {
      await enablePushNotifications();
      localStorage.setItem(PUSH_ENABLED_KEY, "1");
      setPushEnabled(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnablingPush(false);
    }
  }

  return (
    <div>
      <p className="text-xs text-ink/50 mb-4">
        Your jobs
      </p>

      {pushSupported() && !pushEnabled && (
        <div className="mb-4 rounded-xl border border-mist bg-linen px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-ink/70">
            Turn on notifications so you don't miss a 30-minute safety check-in while you're on a
            job.
          </p>
          <button
            type="button"
            onClick={handleEnablePush}
            disabled={enablingPush}
            className="shrink-0 text-xs text-pine border-b border-ink/30 pb-0.5 disabled:opacity-50"
          >
            {enablingPush ? "Enabling…" : "Enable alerts"}
          </button>
        </div>
      )}

      {error && <p className="mb-4 rounded-xl border border-clay/20 bg-clay/[0.05] px-4 py-3 text-sm text-clay">{error}</p>}

      <div className="rounded-2xl border border-mist bg-white/60 p-6">
        {loading ? (
          <div className="grid gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-linen/60" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-ink/50">No jobs assigned yet — check back soon.</p>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onChanged={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [safeWordInput, setSafeWordInput] = useState("");
  const [sosState, setSosState] = useState("idle");

  async function handleArrive() {
    setBusy(true);
    setError("");
    try {
      await arriveAtJob(job.id);
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete() {
    setBusy(true);
    setError("");
    try {
      await completeJob(job.id);
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSos() {
    // Two taps, so a phone in a pocket can't summon the team — but no
    // dialog to dismiss and nothing else in the way.
    if (sosState === "idle") {
      setSosState("confirming");
      return;
    }

    setSosState("sending");
    setError("");
    try {
      await raiseJobSos(job.id);
      setSosState("sent");
      await onChanged();
    } catch (err) {
      setError(err.message);
      setSosState("confirming");
    }
  }

  async function handleConfirmCheckin(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await confirmCheckin(job.pending_checkin.id, safeWordInput);
      setSafeWordInput("");
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-mist bg-linen/40 px-5 py-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-display text-ink">{job.apartment_label} · {job.frequency_label}</p>
          <p className="text-xs text-pine">
            {job.scheduled_date
              ? `${formatShortDate(job.scheduled_date)}${
                  job.scheduled_slot_window ? ` · arrive ${job.scheduled_slot_window}` : ""
                }`
              : "Date to be confirmed"}
          </p>
          <p className="text-xs text-ink/50">{job.service_address_text}</p>
        </div>
        <span className={"shrink-0 inline-block rounded-md border px-2.5 py-0.5 text-sm font-medium " + statusBadgeClasses(job.status)}>
          {statusLabel(job.status)}
        </span>
      </div>

      <div className="grid gap-1 mb-3 text-sm text-ink/70">
        <p>
          <span className="text-ink/45">Getting in: </span>
          {ACCESS_METHOD_LABEL[job.access_method] || job.access_method}
          {job.access_method === "access_code" && job.access_code && (
            <span className="font-mono text-ink"> — code {job.access_code}</span>
          )}
        </p>
        {job.access_instructions && <p className="text-ink/60">{job.access_instructions}</p>}
        <p>
          <span className="text-ink/45">Safe word: </span>
          <span className="font-mono text-ink">{job.safe_word}</span>
        </p>
      </div>

      {error && <p className="mb-3 text-sm text-clay">{error}</p>}

      {job.status === "assigned" && (
        <button
          type="button"
          onClick={handleArrive}
          disabled={busy}
          className="inline-flex items-center rounded-md bg-pine px-5 py-2.5 text-sm font-medium text-linen disabled:opacity-60"
        >
          {busy ? "Saving…" : "I've arrived"}
        </button>
      )}

      {job.status === "in_progress" && (
        <div className="grid gap-3">
          {job.pending_checkin && (
            <form
              onSubmit={handleConfirmCheckin}
              className="rounded-lg border border-mist bg-linen p-4"
            >
              <p className="text-sm text-ink/70 mb-3">
                Safety check-in due — confirm the job's safe word to let us know you're okay.
              </p>
              <div className="flex gap-2">
                <input
                  value={safeWordInput}
                  onChange={(e) => setSafeWordInput(e.target.value)}
                  placeholder="Enter safe word"
                  className="flex-1 rounded-lg border border-mist bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
                />
                <button
                  type="submit"
                  disabled={busy || !safeWordInput.trim()}
                  className="rounded-lg bg-pine px-4 py-2 text-xs text-linen disabled:opacity-60"
                >
                  Confirm
                </button>
              </div>
            </form>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleComplete}
              disabled={busy}
              className="inline-flex items-center rounded-md border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink disabled:opacity-60"
            >
              {busy ? "Saving…" : "Mark job complete"}
            </button>

            {sosState === "sent" ? (
              <p className="text-sm font-medium text-clay">
                Help is on the way — our team has been alerted and is calling you.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSos}
                disabled={sosState === "sending"}
                className={"inline-flex items-center rounded-md px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 " +
                  (sosState === "confirming"
                    ? "bg-clay text-linen"
                    : "border border-clay/40 text-clay hover:bg-clay/5")
                }
              >
                {sosState === "sending"
                  ? "Alerting…"
                  : sosState === "confirming"
                  ? "Tap again to send SOS"
                  : "I need help"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

