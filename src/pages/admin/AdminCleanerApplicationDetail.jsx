import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  adminApproveCleanerApplication,
  adminRejectCleanerApplication,
  adminRequestMoreInfo,
  fetchAdminCleanerApplication,
  fetchAdminDocumentUrl,
} from "../../lib/api";

export default function AdminCleanerApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [actioning, setActioning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminCleanerApplication(id)
      .then(setApplication)
      .finally(() => setLoading(false));
  }, [id]);

  async function viewDocument(documentId) {
    try {
      const url = await fetchAdminDocumentUrl(id, documentId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleApprove() {
    setActioning(true);
    setError("");
    try {
      await adminApproveCleanerApplication(id);
      navigate("/admin/applications");
    } catch (err) {
      setError(err.message);
    } finally {
      setActioning(false);
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      setError("Add a reason for the applicant.");
      return;
    }
    setActioning(true);
    setError("");
    try {
      await adminRejectCleanerApplication(id, reason.trim());
      navigate("/admin/applications");
    } catch (err) {
      setError(err.message);
    } finally {
      setActioning(false);
    }
  }

  async function handleRequestMoreInfo() {
    if (!reason.trim()) {
      setError("Explain what's missing for the applicant.");
      return;
    }
    setActioning(true);
    setError("");
    try {
      await adminRequestMoreInfo(id, reason.trim());
      navigate("/admin/applications");
    } catch (err) {
      setError(err.message);
    } finally {
      setActioning(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-6 py-16 text-center text-ink/50">Loading…</div>;
  }
  if (!application) {
    return <div className="mx-auto max-w-4xl px-6 py-16 text-center text-clay">Application not found.</div>;
  }

  const canDecide = ["submitted", "under_review", "more_info_requested"].includes(application.status);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs text-ink/45 mb-3">
        Review application
      </p>
      <h1 className="font-display text-3xl text-ink mb-2">{application.full_legal_name}</h1>
      <p className="text-sm text-ink/50 mb-8">
        {application.applicant_email} · {application.phone} ·{" "}
        <span className="text-xs text-ink/50">
          {application.status.replace(/_/g, " ")}
        </span>
      </p>

      <Section title="Guarantor">
        {application.guarantor ? (
          <div className="grid gap-1 text-sm text-ink/70">
            <p>{application.guarantor.full_name} ({application.guarantor.relationship})</p>
            <p>{application.guarantor.phone} {application.guarantor.email ? `· ${application.guarantor.email}` : ""}</p>
            <p>{application.guarantor.address}</p>
          </div>
        ) : (
          <p className="text-sm text-ink/50">No guarantor on file.</p>
        )}
      </Section>

      <Section title="Documents">
        {application.documents?.length ? (
          <div className="grid gap-2">
            {application.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border border-mist bg-white/70 px-4 py-3">
                <span className="text-sm text-ink">{doc.document_type.replace(/_/g, " ")}</span>
                <button
                  type="button"
                  onClick={() => viewDocument(doc.id)}
                  className="text-xs text-pine border-b border-ink/30 pb-0.5"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/50">No documents uploaded.</p>
        )}
      </Section>

      {canDecide && (
        <Section title="Decision">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (required for reject / request more info)"
            rows={3}
            className="w-full rounded-xl border border-mist bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine resize-none mb-4"
          />
          {error && <p className="mb-4 text-sm text-clay">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleApprove}
              disabled={actioning}
              className="inline-flex items-center rounded-md bg-pine px-6 py-3 text-sm font-medium text-linen disabled:opacity-60"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={handleRequestMoreInfo}
              disabled={actioning}
              className="inline-flex items-center rounded-md border border-ink/20 px-6 py-3 text-sm font-medium text-ink disabled:opacity-60"
            >
              Request more info
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={actioning}
              className="inline-flex items-center rounded-md border border-clay/40 px-6 py-3 text-sm font-medium text-clay disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <p className="text-xs text-ink/50 mb-4">{title}</p>
      <div className="rounded-2xl border border-mist bg-white/60 p-6">{children}</div>
    </div>
  );
}
