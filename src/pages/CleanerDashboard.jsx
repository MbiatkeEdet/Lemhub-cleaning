import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import CleanerApplicationForm from "../components/CleanerApplicationForm";
import { fetchCleanerApplication } from "../lib/api";

const STATUS_COPY = {
  submitted: {
    title: "Application submitted.",
    body: "Thanks for applying — our team is reviewing your documents. We'll email you once there's an update.",
  },
  under_review: {
    title: "Your application is under review.",
    body: "An admin is currently reviewing your documents. We'll email you once there's an update.",
  },
  rejected: {
    title: "We couldn't approve your application.",
    body: "If you think this is a mistake, reach out to support and we'll take another look.",
  },
};

export default function CleanerDashboard() {
  const [application, setApplication] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  function load() {
    return fetchCleanerApplication().then((data) => {
      setApplication(data.application);
      setProfile(data.profile);
    });
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-ink/50">Loading…</div>;
  }

  if (profile) {
    return <Navigate to="/cleaner" replace />;
  }

  const editable = !application || application.status === "draft" || application.status === "more_info_requested";

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs text-ink/45 mb-3">
        Cleaner application
      </p>
      <h1 className="font-display text-4xl text-ink mb-4">
        {application ? "Your application" : "Become a TidyNow cleaner."}
      </h1>
      <p className="text-ink/60 leading-relaxed mb-10 max-w-lg">
        {application
          ? "Track your application status below."
          : "We manually review every cleaner's identity and guarantor before they join the roster. You'll need a proof of address, a recent bank statement, and a guarantor."}
      </p>

      {application?.status === "more_info_requested" && (
        <div className="mb-8 rounded-2xl border border-mist bg-linen p-5">
          <p className="text-xs text-ink/50 mb-2">
            More information needed
          </p>
          <p className="text-sm text-ink/70">{application.rejection_reason}</p>
        </div>
      )}

      {application && !editable && STATUS_COPY[application.status] && (
        <div className="rounded-2xl border border-mist bg-white/60 p-8 text-center">
          <h2 className="font-display text-2xl text-ink mb-3">
            {STATUS_COPY[application.status].title}
          </h2>
          <p className="text-ink/60 leading-relaxed">{STATUS_COPY[application.status].body}</p>
          {application.status === "rejected" && application.rejection_reason && (
            <p className="mt-4 text-sm text-clay">{application.rejection_reason}</p>
          )}
        </div>
      )}

      {editable && (
        <CleanerApplicationForm
          application={application}
          onChanged={(updated) => setApplication(updated)}
        />
      )}
    </div>
  );
}
