import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [verificationForm, setVerificationForm] = useState(initialVerification);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(user.isLoggedIn && !user.basicKycCompleted ? 1 : 1);

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

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={submitBasic} className="rounded-3xl border border-mist bg-white/70 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/45 mb-4">
            Step 1 · Basic KYC
          </p>
          <div className="grid gap-4">
            <Field label="Full name" value={loginForm.fullName} onChange={(v) => setLoginForm({ ...loginForm, fullName: v })} />
            <Field label="Email" value={loginForm.email} onChange={(v) => setLoginForm({ ...loginForm, email: v })} type="email" />
            <Field label="Phone number" value={loginForm.phone} onChange={(v) => setLoginForm({ ...loginForm, phone: v })} />
          </div>
          <button type="submit" className="mt-6 inline-flex items-center rounded-full bg-pine px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-linen">
            Save basic KYC
          </button>
        </form>

        <form onSubmit={submitFull} className="rounded-3xl border border-mist bg-linen-dim p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/45 mb-4">
            Step 2 · Full KYC
          </p>
          <div className="grid gap-4">
            <Field label="ID number" value={verificationForm.idNumber} onChange={(v) => setVerificationForm({ ...verificationForm, idNumber: v })} />
            <Field label="Date of birth" value={verificationForm.dob} onChange={(v) => setVerificationForm({ ...verificationForm, dob: v })} type="date" />
            <Field label="Residential address" value={verificationForm.address} onChange={(v) => setVerificationForm({ ...verificationForm, address: v })} />
            <Field label="Purpose of booking" value={verificationForm.purpose} onChange={(v) => setVerificationForm({ ...verificationForm, purpose: v })} />
          </div>
          <button type="submit" className="mt-6 inline-flex items-center rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-linen">
            Unlock booking
          </button>
        </form>
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
