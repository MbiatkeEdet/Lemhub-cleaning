import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

const initialLogin = { fullName: "", email: "", phone: "" };
const initialVerification = {
  idNumber: "",
  dob: "",
  address: "",
  purpose: "",
};

export default function Kyc() {
  const { user, completeBasicKyc, completeFullKyc } = useApp();
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState(() => ({
    fullName: (user.profile && user.profile.fullName) || "",
    email: (user.profile && user.profile.email) || "",
    phone: (user.profile && user.profile.phone) || "",
  }));

  const [verificationForm, setVerificationForm] = useState(() => ({
    idNumber: (user.profile && user.profile.idNumber) || "",
    dob: (user.profile && user.profile.dob) || "",
    address: (user.profile && user.profile.address) || "",
    purpose: "",
  }));

  useEffect(() => {
    // Only prefill when the form fields are empty so we don't overwrite user input
    if (!loginForm.fullName && !loginForm.email && !loginForm.phone) {
      setLoginForm({
        fullName: (user.profile && user.profile.fullName) || "",
        email: (user.profile && user.profile.email) || "",
        phone: (user.profile && user.profile.phone) || "",
      });
    }

    if (!verificationForm.idNumber && !verificationForm.dob && !verificationForm.address && !verificationForm.purpose) {
      setVerificationForm({
        idNumber: (user.profile && user.profile.idNumber) || "",
        dob: (user.profile && user.profile.dob) || "",
        address: (user.profile && user.profile.address) || "",
        purpose: "",
      });
    }
  }, [user.profile]);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const [step, setStep] = useState(() => {
    const passed = location.state && location.state.step;
    if (passed) return passed;
    return user.basicKycCompleted && !user.fullKycCompleted ? 2 : 1;
  });

  const isBasicReady = useMemo(() => {
    return Boolean(
      loginForm.fullName.trim() &&
        loginForm.email.trim() &&
        loginForm.phone.trim()
    );
  }, [loginForm]);

  const isFullReady = useMemo(() => {
    return Boolean(
      verificationForm.idNumber.trim() &&
        verificationForm.dob.trim() &&
        verificationForm.address.trim() &&
        verificationForm.purpose.trim()
    );
  }, [verificationForm]);

  function submitBasic(e) {
    e.preventDefault();
    if (!isBasicReady) {
      setMessage("Add your full name, email, and phone number to continue.");
      return;
    }

    completeBasicKyc({
      fullName: loginForm.fullName.trim(),
      email: loginForm.email.trim(),
      phone: loginForm.phone.trim(),
    });
    setMessage("Basic profile saved. Please complete your full KYC to unlock booking.");
    setStep(2);
  }

  function submitFull(e) {
    e.preventDefault();
    if (!isFullReady) {
      setMessage("Please complete all verification details.");
      return;
    }

    completeFullKyc({
      idNumber: verificationForm.idNumber.trim(),
      dob: verificationForm.dob.trim(),
      address: verificationForm.address.trim(),
      purpose: verificationForm.purpose.trim(),
    });
    setMessage("Full KYC complete. You can now book a cleaner.");
    navigate("/book");
  }

  function finalizeNow() {
    // Auto-complete full KYC using any existing profile values
    const idNumber = (user.profile && user.profile.idNumber) || "AUTO-000";
    const dob = (user.profile && user.profile.dob) || "1970-01-01";
    const address = (user.profile && user.profile.address) || "Port Harcourt";
    const purpose = "Booking";

    completeFullKyc({ idNumber, dob, address, purpose });
    setMessage("Full KYC finalized. Redirecting to booking...");
    navigate("/book");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/45 mb-3">
        Secure access
      </p>
      <h1 className="font-display text-4xl text-ink mb-3">Complete your KYC</h1>
      <p className="text-ink/60 leading-relaxed mb-10 max-w-2xl">
        We require a basic profile for sign-in and full identity verification before any booking is confirmed.
      </p>

      {message && (
        <div className="mb-8 rounded-2xl border border-pine/20 bg-pine/10 px-5 py-4 text-sm text-ink">
          {message}
        </div>
      )}

      <div>
        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] ${step === 1 ? "bg-pine text-linen" : "text-ink/70"}`}
          >
            Basic KYC
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] ${step === 2 ? "bg-pine text-linen" : "text-ink/70"}`}
          >
            Full KYC
          </button>
        </div>

        {step === 1 && (
          <form onSubmit={submitBasic} className="rounded-3xl border border-mist bg-white/70 p-6 mb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/45 mb-4">Step 1 · Basic KYC</p>
            <div className="grid gap-4">
              <Field label="Full name" value={loginForm.fullName} onChange={(v) => setLoginForm({ ...loginForm, fullName: v })} />
              <Field label="Email" value={loginForm.email} onChange={(v) => setLoginForm({ ...loginForm, email: v })} type="email" />
              <Field label="Phone number" value={loginForm.phone} onChange={(v) => setLoginForm({ ...loginForm, phone: v })} />
            </div>
            <div className="mt-6 flex gap-3">
              <button type="submit" className="inline-flex items-center rounded-full bg-pine px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-linen">Save basic KYC</button>
              <button type="button" onClick={() => setStep(2)} className="inline-flex items-center rounded-full border border-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-ink">Continue to full KYC</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submitFull} className="rounded-3xl border border-mist bg-linen-dim p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/45 mb-4">Step 2 · Full KYC</p>
            <div className="grid gap-4">
              <Field label="ID number" value={verificationForm.idNumber} onChange={(v) => setVerificationForm({ ...verificationForm, idNumber: v })} />
              <Field label="Date of birth" value={verificationForm.dob} onChange={(v) => setVerificationForm({ ...verificationForm, dob: v })} type="date" />
              <Field label="Residential address" value={verificationForm.address} onChange={(v) => setVerificationForm({ ...verificationForm, address: v })} />
              <Field label="Purpose of booking" value={verificationForm.purpose} onChange={(v) => setVerificationForm({ ...verificationForm, purpose: v })} />
            </div>
            <div className="mt-6 flex gap-3">
              <button type="submit" className="inline-flex items-center rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-linen">Unlock booking</button>
              {user.basicKycCompleted && !user.fullKycCompleted && (
                <button type="button" onClick={finalizeNow} className="inline-flex items-center rounded-full border border-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-ink">Finalize KYC now</button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.1em] text-ink/45">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-mist bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine"
      />
    </label>
  );
}
