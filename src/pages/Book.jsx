import { useEffect, useMemo, useState } from "react";
import InlineAccountStep from "../components/InlineAccountStep";
import ScheduleBuilder from "../components/ScheduleBuilder";
import PaymentStep from "../components/PaymentStep";
import PhoneField from "../components/PhoneField";
import PriceCalculator from "../components/PriceCalculator";
import RequiredMark, { RequiredLegend } from "../components/RequiredMark";
import SealBadge from "../components/SealBadge";
import SlotPicker from "../components/SlotPicker";
import SupportRequestForm from "../components/SupportRequestForm";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../hooks/useCatalog";
import { createBooking } from "../lib/api";
import {
  clearBookingDraft,
  clearGuestCache,
  loadBookingDraft,
  loadGuestProfile,
  saveBookingDraft,
  saveGuestProfile,
} from "../lib/guestCache";
import { formatLongDate, formatShortDate, todayISO } from "../lib/dates";
import { formatKobo } from "../lib/money";
import { applyDiscount, discountBps, formatBps, nextTier } from "../lib/discount";
import { FALLBACK_SLOTS } from "../lib/slots";
import { formatInternational } from "../lib/phone";

const emptyContact = { name: "", phone: "", email: "" };
const emptyLocation = { street: "", landmark: "", extraDescription: "" };
const emptyAccess = { method: "someone_present", instructions: "", code: "" };
const emptySchedule = { dates: [], slot: "" };

const ACCESS_METHODS = [
  { value: "someone_present", label: "Someone will be home", detail: "We'll knock — no code needed" },
  { value: "access_code", label: "There's a gate or door code", detail: "We'll store it encrypted" },
  { value: "call_on_arrival", label: "Call me on arrival", detail: "Your cleaner rings first" },
  { value: "other", label: "Other access notes", detail: "Tell us how it works" },
];

const STEPS = [
  { id: 1, label: "Your clean", hint: "Size & frequency" },
  { id: 2, label: "Dates & time", hint: "Pick your days" },
  { id: 3, label: "Where to come", hint: "Contact & address" },
  { id: 4, label: "How we get in", hint: "Access details" },
  { id: 5, label: "Paying", hint: "Upfront or per visit" },
];

export default function Book() {
  const auth = useAuth();
  const { apartmentTypes, frequencies, slots, pricing, loading: catalogLoading, error: catalogError } = useCatalog();
  const [apartmentCode, setApartmentCode] = useState("");
  const [frequencyCode, setFrequencyCode] = useState("");
  const [schedule, setSchedule] = useState(emptySchedule);
  const [contact, setContact] = useState(emptyContact);
  const [phoneValid, setPhoneValid] = useState(false);
  const [location, setLocation] = useState(emptyLocation);
  const [access, setAccess] = useState(emptyAccess);
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [draftLoaded, setDraftLoaded] = useState(false);
  // Only meaningful for a single one-off visit, where an account is a
  // choice rather than a requirement.
  const [accountChoice, setAccountChoice] = useState("guest");
  const [paymentMode, setPaymentMode] = useState("upfront");
  const [schedulePattern, setSchedulePattern] = useState("once");

  const selectedApartment = apartmentTypes.find((a) => a.code === apartmentCode);
  const selectedFrequency = frequencies.find((f) => f.code === frequencyCode);
  const isCustomPricing = !!selectedApartment?.is_custom_pricing;
  const slotOptions = slots?.length ? slots : FALLBACK_SLOTS;
  const selectedSlot = slotOptions.find((s) => s.value === schedule.slot);
  const visitCount = schedule.dates.length;
  const isMultiVisit = visitCount > 1;
  // More than one visit means we will be charging again later, so the
  // booking has to hang off a verified account.
  const requiresAccount = isMultiVisit;
  const maxVisits = pricing?.max_visits_per_booking ?? 366;
  const monthsAhead = pricing?.max_months_ahead ?? 12;
  const chargeLeadHours = pricing?.charge_lead_hours ?? 48;
  const refundCutoffHours = pricing?.refund_cutoff_hours ?? 24;

  // The draft holds a home address and access notes, so it lives in the
  // same encrypted device store as the saved profile rather than in plain
  // localStorage.
  useEffect(() => {
    let cancelled = false;

    loadBookingDraft().then((draft) => {
      if (cancelled || !draft) return;

      if (draft.apartmentCode) setApartmentCode(draft.apartmentCode);
      if (draft.frequencyCode) setFrequencyCode(draft.frequencyCode);
      if (draft.contact) setContact((prev) => ({ ...prev, ...draft.contact }));
      if (draft.location) setLocation((prev) => ({ ...prev, ...draft.location }));
      if (draft.access) setAccess((prev) => ({ ...prev, ...draft.access }));
      if (draft.paymentMode) setPaymentMode(draft.paymentMode);

      // Saved dates that have since passed are worse than no date at all.
      if (draft.schedule) {
        const dates = (draft.schedule.dates || []).filter((d) => d >= todayISO());
        setSchedule((prev) => ({ ...prev, ...draft.schedule, dates }));
      }
      if (draft.activeStep) {
        setActiveStep(draft.activeStep);
        setMaxStepReached((m) => Math.max(m, draft.activeStep));
      }

      setDraftLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Don't write an empty draft over a good one before it has loaded.
    if (!draftLoaded) return;

    saveBookingDraft({ apartmentCode, frequencyCode, schedule, contact, location, access, activeStep, paymentMode });
  }, [draftLoaded, apartmentCode, frequencyCode, schedule, contact, location, access, activeStep, paymentMode]);

  useEffect(() => {
    if (apartmentTypes.length && !apartmentCode) setApartmentCode(apartmentTypes[0].code);
  }, [apartmentTypes, apartmentCode]);

  useEffect(() => {
    if (frequencies.length && !frequencyCode) {
      const defaultFrequency = frequencies.find((f) => f.code === "biweekly") || frequencies[0];
      setFrequencyCode(defaultFrequency.code);
    }
  }, [frequencies, frequencyCode]);

  async function handleContactBlur(value) {
    const profile = await loadGuestProfile(value);
    if (!profile) return;

    setContact((prev) => ({
      ...prev,
      name: prev.name || profile.name || "",
      email: prev.email || profile.email || "",
    }));
    setLocation((prev) => ({
      ...prev,
      street: prev.street || profile.address || "",
      landmark: prev.landmark || profile.landmark || "",
      extraDescription: prev.extraDescription || profile.extraDescription || "",
    }));
    setAccess((prev) => ({
      ...prev,
      method: profile.accessMethod || prev.method,
      instructions: prev.instructions || profile.accessInstructions || "",
    }));
    setSchedule((prev) => ({ ...prev, slot: prev.slot || profile.preferredSlot || "" }));
    setPrefilled(true);
  }

  function handleClearPrefill() {
    clearGuestCache();
    setContact(emptyContact);
    setLocation(emptyLocation);
    setAccess(emptyAccess);
    setSchedule({ dates: [], slot: "" });
    setPrefilled(false);
    clearBookingDraft();
  }

  function validateStep(step) {
    if (step === 1 && (!apartmentCode || !frequencyCode)) {
      return "Choose an apartment size and cleaning frequency to continue.";
    }
    if (step === 2 && schedule.dates.length === 0) return "Pick at least one day you'd like your cleaner to come.";
    if (step === 2 && !schedule.slot) return "Choose an arrival time for those days.";
    if (step === 3) {
      if (!contact.name.trim()) return "Please tell us your name.";
      if (!contact.phone || !phoneValid) return "Enter a valid phone number so your cleaner can reach you.";
      if (!location.street.trim()) return "Add the address we should come to.";
      if (!location.landmark.trim()) return "Add the closest landmark — it's how cleaners find you.";
    }
    if (step === 4 && access.method === "access_code" && !access.code.trim()) {
      return "Add the access code so your cleaner can get in.";
    }
    if (step === 5 && requiresAccount && !auth.isAuthenticated) {
      return "Verify your email to continue — more than one clean needs an account.";
    }
    if (step === 5 && !requiresAccount && accountChoice === "account" && !auth.isAuthenticated) {
      return "Verify your email, or choose to book this one without an account.";
    }
    return null;
  }

  function goToStep(step) {
    setError("");
    setActiveStep(step);
  }

  function goNext() {
    const problem = validateStep(activeStep);
    if (problem) {
      setError(problem);
      return;
    }
    if (activeStep === 1 && isCustomPricing) return;

    setError("");
    const next = Math.min(STEPS.length, activeStep + 1);
    setActiveStep(next);
    setMaxStepReached((m) => Math.max(m, next));
  }

  function goBack() {
    setError("");
    setActiveStep((s) => Math.max(1, s - 1));
  }

  const serviceAddress = useMemo(() => {
    return [
      location.street.trim(),
      location.landmark.trim() ? `Closest landmark: ${location.landmark.trim()}` : null,
      location.extraDescription.trim() ? `Directions: ${location.extraDescription.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [location]);

  const perVisitKobo =
    selectedApartment && selectedFrequency && !isCustomPricing
      ? Math.round(selectedApartment.base_price_kobo * selectedFrequency.multiplier)
      : 0;
  const monthlyKobo = perVisitKobo ? perVisitKobo * selectedFrequency.visits_per_month : 0;

  // The live quote. The server recomputes all of this before charging —
  // this is only so the customer sees the same number we're about to ask
  // them for.
  const paidUpfront = !isMultiVisit || paymentMode === "upfront";
  const discount = discountBps(visitCount, paidUpfront, pricing);
  const discountedPerVisitKobo = applyDiscount(perVisitKobo, discount);
  const bookedTotalKobo = discountedPerVisitKobo * Math.max(1, visitCount);
  const listTotalKobo = perVisitKobo * Math.max(1, visitCount);
  const savingKobo = listTotalKobo - bookedTotalKobo;
  const dueNowKobo = paidUpfront ? bookedTotalKobo : discountedPerVisitKobo;
  const upcomingTier = nextTier(visitCount, pricing);

  async function handleSubmit(e) {
    e.preventDefault();

    for (const step of STEPS) {
      const problem = validateStep(step.id);
      if (problem) {
        setError(problem);
        setActiveStep(step.id);
        return;
      }
    }

    setError("");
    setSubmitting(true);

    try {
      const booking = await createBooking({
        apartment_type_code: apartmentCode,
        frequency_code: frequencyCode,
        scheduled_dates: schedule.dates,
        scheduled_slot: schedule.slot,
        payment_mode: paidUpfront ? "upfront" : "per_visit",
        schedule_pattern: schedulePattern,
        customer: {
          name: contact.name.trim(),
          phone: contact.phone,
          email: contact.email.trim() || null,
        },
        service_address: serviceAddress,
        service_landmark: location.landmark.trim(),
        access: {
          method: access.method,
          instructions: access.instructions.trim() || null,
          code: access.method === "access_code" ? access.code.trim() : null,
        },
      });

      setConfirmed(booking);
      clearBookingDraft();
      // Everything that makes the next booking a two-tap job. Nothing
      // payment-related: the card lives with the gateway, never here.
      saveGuestProfile([contact.phone, contact.email], {
        name: contact.name.trim(),
        email: contact.email.trim(),
        address: location.street.trim(),
        landmark: location.landmark.trim(),
        extraDescription: location.extraDescription.trim(),
        accessMethod: access.method,
        accessInstructions: access.instructions.trim(),
        preferredSlot: schedule.slot,
      });
    } catch (err) {
      const message = err.errors ? Object.values(err.errors).flat().join(" ") : err.message;
      setError(message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (catalogLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <div className="grid gap-4">
          <div className="h-10 w-2/3 animate-pulse rounded-xl bg-mist/60" />
          <div className="h-48 animate-pulse rounded-3xl bg-mist/40" />
          <div className="h-32 animate-pulse rounded-3xl bg-mist/30" />
        </div>
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-clay">
          We couldn't load pricing right now. Please refresh, or reach us on WhatsApp.
        </p>
      </div>
    );
  }

  if (confirmed) {
    return <BookingConfirmation booking={confirmed} contact={contact} showHelp={showHelp} setShowHelp={setShowHelp} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
      <section className="relative overflow-hidden rounded-xl border border-mist gradient-brand p-8 lg:p-10">
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs text-pine/65 mb-3">Book a clean</p>
            <h1 className="font-display text-4xl lg:text-5xl text-ink leading-tight mb-4 max-w-xl">
              Pick a day, pick a time, and we'll take it from there.
            </h1>
            <p className="max-w-2xl text-ink/65 leading-relaxed">
              Four short steps. Choose your apartment, lock in an arrival window, tell us where you
              are, and pay — your verified cleaner is confirmed the moment payment lands.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <QuickStat label="Arrival windows" value="7am · 11am · 1pm · 3pm" />
            <QuickStat label="Working days" value="Monday – Saturday" />
            <QuickStat label="Every cleaner" value="Background-checked" />
            <QuickStat label="Confirmation" value="Instant on payment" />
          </div>
        </div>
      </section>

      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <StepPill
            key={step.id}
            step={step}
            active={step.id === activeStep}
            done={step.id < activeStep}
            reachable={step.id <= maxStepReached}
            onClick={() => step.id <= maxStepReached && goToStep(step.id)}
          />
        ))}
      </ol>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-mist bg-white/70 p-6 lg:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-ink/50">
                Step {activeStep} of {STEPS.length}
              </p>
              <h2 className="font-display text-2xl text-ink">{STEPS[activeStep - 1].label}</h2>
            </div>
            {prefilled && (
              <button
                type="button"
                onClick={handleClearPrefill}
                className="shrink-0 text-xs text-ink/45 hover:text-clay"
              >
                Clear saved details
              </button>
            )}
          </div>

          <div className="grid gap-6">
            {activeStep === 1 && (
              <Panel title="01. Choose your clean">
                <PriceCalculator
                  apartmentTypes={apartmentTypes}
                  frequencies={frequencies}
                  apartmentCode={apartmentCode}
                  frequencyCode={frequencyCode}
                  onChangeApartment={setApartmentCode}
                  onChangeFrequency={setFrequencyCode}
                />

                {isCustomPricing && (
                  <div className="mt-6 rounded-2xl border border-mist bg-white/60 p-6">
                    <p className="text-xs text-ink/50 mb-4">
                      Request a custom quote
                    </p>
                    <SupportRequestForm
                      bookingId={null}
                      defaultName={contact.name}
                      defaultEmail={contact.email}
                      defaultMessage={`I'd like a quote for a ${selectedApartment.label.toLowerCase()} clean${
                        selectedFrequency ? `, ${selectedFrequency.label.toLowerCase()}` : ""
                      }.`}
                      subject="Custom quote request"
                      submitLabel="Request quote"
                      sentMessage="Thanks — we've received your request and will follow up with a custom quote shortly."
                    />
                  </div>
                )}
              </Panel>
            )}

            {activeStep === 2 && (
              <Panel title="02. Pick your days and arrival time">
                <ScheduleBuilder
                  dates={schedule.dates}
                  maxVisits={maxVisits}
                  monthsAhead={monthsAhead}
                  onChange={(dates, pattern) => {
                    setSchedule((s) => ({ ...s, dates }));
                    if (pattern) setSchedulePattern(pattern);
                    setError("");
                  }}
                  onPatternChange={setSchedulePattern}
                />

                <div className="mt-8 border-t border-mist pt-6">
                  <p className="mb-3 text-xs text-ink/45">
                    Choose an arrival time{isMultiVisit ? " — it applies to every visit" : ""}
                  </p>
                  <SlotPicker
                    slots={slotOptions}
                    value={schedule.slot}
                    disabled={visitCount === 0}
                    onChange={(slot) => {
                      setSchedule((s) => ({ ...s, slot }));
                      setError("");
                    }}
                  />
                  {visitCount === 0 && (
                    <p className="mt-3 text-xs text-ink/45">Pick a date first to choose a time.</p>
                  )}
                </div>

                {isMultiVisit && discount > 0 && (
                  <p className="mt-6 rounded-lg border border-sage-dim bg-sage/10 px-4 py-3 text-sm text-pine">
                    {visitCount} visits earns you {formatBps(discount)} off every clean.
                    {upcomingTier && (
                      <> Book {upcomingTier.min_visits - visitCount} more and it rises to {formatBps(upcomingTier.bps + (paidUpfront ? (pricing?.upfront_discount_bps || 0) : 0))}.</>
                    )}
                  </p>
                )}
              </Panel>
            )}

            {activeStep === 3 && (
              <Panel title="03. Tell us where to come">
                <RequiredLegend className="mb-4" />
                <div className="grid gap-4">
                  <Field
                    label="Full name"
                    required
                    value={contact.name}
                    onChange={(v) => setContact({ ...contact, name: v })}
                    placeholder="Chioma Eze"
                    autoComplete="name"
                  />
                  <PhoneField
                    label="Phone number"
                    value={contact.phone}
                    onChange={(v) => setContact((c) => ({ ...c, phone: v }))}
                    onValidityChange={setPhoneValid}
                    onBlur={(e164) => e164 && handleContactBlur(e164)}
                  />
                  <Field
                    label="Email (optional)"
                    value={contact.email}
                    onChange={(v) => setContact({ ...contact, email: v })}
                    onBlur={() => handleContactBlur(contact.email)}
                    placeholder="chioma@example.com"
                    type="email"
                    autoComplete="email"
                    hint="We'll email your confirmation and receipt here."
                  />
                  <Field
                    label="Home address"
                    required
                    value={location.street}
                    onChange={(v) => setLocation({ ...location, street: v })}
                    placeholder="12 Aba Road, Port Harcourt"
                    autoComplete="street-address"
                  />
                  <Field
                    label="Closest landmark"
                    required
                    value={location.landmark}
                    onChange={(v) => setLocation({ ...location, landmark: v })}
                    placeholder="Opposite Market Square / beside XYZ Pharmacy"
                  />
                  <TextArea
                    label="Additional directions (optional)"
                    value={location.extraDescription}
                    onChange={(v) => setLocation({ ...location, extraDescription: v })}
                    placeholder="E.g. call at the estate gate, use the back staircase, blue door on the left"
                  />
                </div>
              </Panel>
            )}

            {activeStep === 4 && (
              <Panel title="04. How we get in">
                <div className="grid gap-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ACCESS_METHODS.map((m) => {
                      const active = access.method === m.value;
                      return (
                        <button
                          type="button"
                          key={m.value}
                          onClick={() => setAccess({ ...access, method: m.value })}
                          className={"rounded-2xl border p-4 text-left transition-all duration-300 " +
                            (active
                              ? "border-pine bg-pine text-linen -translate-y-0.5"
                              : "border-mist bg-white/60 text-ink hover:border-sage hover:-translate-y-0.5")
                          }
                        >
                          <p className="text-sm font-medium">{m.label}</p>
                          <p className={"mt-1 text-xs " + (active ? "text-linen/70" : "text-ink/50")}>
                            {m.detail}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {access.method === "access_code" && (
                    <Field
                      label="Access code"
                      required
                      value={access.code}
                      onChange={(v) => setAccess({ ...access, code: v })}
                      placeholder="e.g. gate code, lockbox code"
                      hint="Stored encrypted and only shown to your assigned cleaner."
                    />
                  )}

                  <TextArea
                    label="Anything else your cleaner should know? (optional)"
                    value={access.instructions}
                    onChange={(v) => setAccess({ ...access, instructions: v })}
                    placeholder="E.g. use the side entrance, dog is friendly, call when you're outside"
                  />
                </div>
              </Panel>
            )}

            {activeStep === 5 && (
              <Panel title={isMultiVisit ? "05. How you'd like to pay" : "05. Your account"}>
                <div className="grid gap-6">
                  {isMultiVisit && (
                    <div>
                      <p className="mb-3 text-xs text-ink/45">Paying for {visitCount} visits</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ChoiceCard
                          active={paymentMode === "upfront"}
                          title={`Pay for all ${visitCount} now`}
                          detail={`One payment of ${formatKobo(bookedTotalKobo)} — and an extra ${formatBps(pricing?.upfront_discount_bps || 100)} off for paying upfront.`}
                          onClick={() => { setPaymentMode("upfront"); setError(""); }}
                        />
                        <ChoiceCard
                          active={paymentMode === "per_visit"}
                          title="Pay before each visit"
                          detail={`${formatKobo(discountedPerVisitKobo)} today for your first clean. Each later visit is charged to your saved card ${chargeLeadHours} hours before.`}
                          onClick={() => { setPaymentMode("per_visit"); setError(""); }}
                        />
                      </div>

                      <div className="mt-4 rounded-lg border border-mist bg-linen p-4 text-sm">
                        <Row2 label="Price per clean" value={
                          discount > 0 ? (
                            <>
                              <span className="text-ink/40 line-through mr-2">{formatKobo(perVisitKobo)}</span>
                              {formatKobo(discountedPerVisitKobo)}
                            </>
                          ) : formatKobo(perVisitKobo)
                        } />
                        <Row2 label={`Discount (${visitCount} visits${paidUpfront ? " + upfront" : ""})`} value={discount > 0 ? formatBps(discount) : "—"} />
                        <Row2 label={`Total for all ${visitCount}`} value={formatKobo(bookedTotalKobo)} />
                        {savingKobo > 0 && <Row2 label="You save" value={formatKobo(savingKobo)} />}
                        <Row2 label="Due today" value={formatKobo(dueNowKobo)} strong />
                      </div>

                      {!paidUpfront && (
                        <p className="mt-3 text-xs text-ink/55">
                          We'll charge your saved card {chargeLeadHours} hours before each clean, so you can always
                          cancel up to {refundCutoffHours} hours before for a full refund. If the card stops working,
                          the remaining visits are put on hold and we'll email you.
                        </p>
                      )}
                    </div>
                  )}

                  {requiresAccount ? (
                    <InlineAccountStep
                      email={contact.email}
                      onEmailChange={(v) => setContact((c) => ({ ...c, email: v }))}
                      reason={`You're booking ${visitCount} visits. They're managed together — and your card is saved for the later ones — so verify your email to continue.`}
                    />
                  ) : (
                    <div className="grid gap-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ChoiceCard
                          active={accountChoice === "guest"}
                          title="Book this one clean"
                          detail="No account. We'll email your confirmation and receipt."
                          onClick={() => { setAccountChoice("guest"); setError(""); }}
                        />
                        <ChoiceCard
                          active={accountChoice === "account"}
                          title="Create an account"
                          detail="Save your card, rebook in a tap, and see every visit and payment."
                          onClick={() => { setAccountChoice("account"); setError(""); }}
                        />
                      </div>

                      {accountChoice === "account" && (
                        <InlineAccountStep
                          email={contact.email}
                          onEmailChange={(v) => setContact((c) => ({ ...c, email: v }))}
                          reason="We'll email you a 6-digit code to confirm it's you — no password to remember."
                        />
                      )}
                    </div>
                  )}
                </div>
              </Panel>
            )}

            {error && (
              <p role="alert" className="rounded-2xl border border-clay/20 bg-clay/[0.05] px-4 py-3 text-sm text-clay">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-4">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center justify-center rounded-md border border-mist px-6 py-3.5 text-sm font-medium text-ink/70 hover:border-ink/30 hover:text-ink transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <span />
              )}

              {activeStep === 1 && isCustomPricing ? (
                <span />
              ) : activeStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center justify-center rounded-md bg-pine px-8 py-3.5 text-sm font-medium text-linen hover:bg-pine-light transition-all duration-300"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-md bg-pine px-8 py-3.5 text-sm font-medium text-linen hover:bg-pine-light transition-all duration-300 disabled:opacity-60"
                >
                  {submitting
                    ? "Confirming…"
                    : requiresAccount
                    ? "Create account & book"
                    : accountChoice === "account"
                    ? "Sign up & book"
                    : "Book this clean"}
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-mist bg-ink text-linen p-6 lg:p-8 xl:sticky xl:top-6">
          <p className="text-xs text-ink/50-light mb-3">
            Your booking so far
          </p>
          <h2 className="font-display text-2xl mb-4">Live summary</h2>
          <div className="grid gap-3 text-sm">
            <SummaryRow label="Apartment" value={selectedApartment?.label || "Choose one"} />
            <SummaryRow label="Frequency" value={selectedFrequency?.label || "Choose one"} />
            <SummaryRow
              label={isMultiVisit ? "Dates" : "Date"}
              value={
                visitCount === 0
                  ? "Not picked yet"
                  : visitCount === 1
                  ? formatLongDate(schedule.dates[0])
                  : `${visitCount} visits, from ${formatLongDate(schedule.dates[0])}`
              }
            />
            <SummaryRow label="Arrival" value={selectedSlot ? selectedSlot.window : "Not picked yet"} />
            <SummaryRow label="Name" value={contact.name || "Not yet"} />
            <SummaryRow
              label="Phone"
              value={contact.phone ? formatInternational(contact.phone) : "Not yet"}
            />
            <SummaryRow label="Landmark" value={location.landmark || "Add a landmark"} />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-4">
            <p className="text-xs text-ink/50-light mb-2">
              {isMultiVisit ? "Total for these visits" : "Estimated monthly total"}
            </p>
            {isCustomPricing ? (
              <p className="font-display text-2xl text-white">Custom quote</p>
            ) : (
              <>
                <p className="font-display text-3xl text-white">
                  {formatKobo(isMultiVisit ? bookedTotalKobo : monthlyKobo)}
                </p>
                <p className="mt-1 text-xs text-linen/60">
                  {formatKobo(discountedPerVisitKobo)} per visit
                  {isMultiVisit
                    ? ` · ${visitCount} visits booked`
                    : selectedFrequency
                    ? ` · ${selectedFrequency.visits_per_month} visits/month`
                    : ""}
                </p>
                {discount > 0 && (
                  <p className="mt-2 text-xs text-brass">
                    {formatBps(discount)} off · you save {formatKobo(savingKobo)}
                  </p>
                )}
              </>
            )}
            <p className="mt-2 text-sm text-linen/70">
              {isCustomPricing
                ? "We'll follow up with pricing after you request a quote."
                : "Updates live as you change size or frequency."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            className="mt-6 text-xs text-ink/50-light hover:text-white"
          >
            Need help?
          </button>
          {showHelp && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 p-4">
              <SupportRequestForm
                bookingId={null}
                defaultName={contact.name}
                defaultEmail={contact.email}
                onSent={() => setShowHelp(false)}
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function BookingConfirmation({ booking, contact, showHelp, setShowHelp }) {
  const visits = booking.scheduled_dates?.length ? booking.scheduled_dates : [booking.scheduled_date];
  const group = booking.group;
  const isUpfront = !group || group.payment_mode === "upfront";

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:py-24 animate-[fadeUp_500ms_ease-out]">
      <div className="rounded-xl border border-mist bg-white/70 p-8">
        <div className="mb-8 flex justify-center">
          <SealBadge size={96} />
        </div>
        <h1 className="mb-3 text-center font-display text-4xl text-ink">
          Nearly there, {contact.name.split(" ")[0]}.
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-center leading-relaxed text-ink/60">
          {visits.length > 1 ? (
            <>
              Your {booking.apartment_label.toLowerCase()} is held for{" "}
              <strong className="text-ink">{visits.length} visits</strong>, the first on{" "}
              <strong className="text-ink">{formatLongDate(visits[0])}</strong>, each arriving{" "}
              {booking.scheduled_slot_window}. One payment covers them all.
            </>
          ) : (
            <>
              Your {booking.apartment_label.toLowerCase()} is held for{" "}
              <strong className="text-ink">{formatLongDate(booking.scheduled_date)}</strong>, arriving{" "}
              {booking.scheduled_slot_window}. Complete payment below and we'll confirm your verified
              cleaner by email straight away.
            </>
          )}
        </p>

        <div className="mb-8 grid gap-3 rounded-2xl border border-mist bg-linen/40 p-6 text-left">
          {visits.length > 1 ? (
            <VisitDatesRow visits={visits} />
          ) : (
            <Row label="Date" value={formatLongDate(booking.scheduled_date)} />
          )}
          <Row label="Arrival" value={booking.scheduled_slot_window} />
          <Row label="Apartment" value={booking.apartment_label} />
          <Row label="Frequency" value={booking.frequency_label} />
          <Row label="Per visit" value={formatKobo(booking.per_visit_price_kobo)} />
          {group?.discount_bps > 0 && (
            <Row
              label={`Discount (${formatBps(group.discount_bps)})`}
              value={`− ${formatKobo(group.saving_kobo)}`}
            />
          )}
          {group && !isUpfront && (
            <Row label={`Order total (${group.visits_count} visits)`} value={formatKobo(group.total_kobo)} />
          )}
          <Row
            label={visits.length > 1 ? "Due today" : "Monthly total"}
            value={formatKobo(booking.amount_due_now_kobo ?? booking.monthly_total_kobo)}
          />
          <Row label="Status" value="Awaiting payment" />
        </div>

        {!isUpfront && (
          <p className="mb-8 rounded-xl border border-sage-dim bg-sage/10 px-4 py-3 text-sm leading-relaxed text-pine">
            You're paying for the first clean today. Each of the other {group.visits_count - 1}{" "}
            {group.visits_count - 1 === 1 ? "visit is" : "visits are"} charged to this card shortly before
            the day, and you can cancel any of them for a full refund up until then.
          </p>
        )}

        <div className="mb-8 text-left">
          <p className="mb-4 text-xs text-ink/50">
            Secure your booking
          </p>
          <PaymentStep booking={booking} />
        </div>

        <div className="text-left">
          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            className="text-xs text-ink/40 hover:text-ink"
          >
            Need help with this booking?
          </button>
          {showHelp && (
            <div className="mt-4 rounded-2xl border border-mist bg-white/60 p-6">
              <SupportRequestForm
                bookingId={booking.id}
                defaultName={contact.name}
                defaultEmail={contact.email}
                onSent={() => setShowHelp(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** A long schedule collapses to a summary — 300 dates is not a list. */
function VisitDatesRow({ visits }) {
  const [expanded, setExpanded] = useState(false);
  const preview = visits.slice(0, 4);

  return (
    <div className="grid gap-2">
      <Row
        label={`Dates (${visits.length})`}
        value={`${formatLongDate(visits[0])} → ${formatLongDate(visits[visits.length - 1])}`}
      />
      <div className="text-xs text-ink/55">
        {(expanded ? visits : preview).map((d) => formatShortDate(d)).join(" · ")}
        {!expanded && visits.length > preview.length ? ` … +${visits.length - preview.length} more` : ""}
      </div>
      {visits.length > preview.length && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="justify-self-start text-xs text-pine border-b border-brass pb-0.5"
        >
          {expanded ? "Show fewer" : "Show every date"}
        </button>
      )}
    </div>
  );
}

function Row2({ label, value, strong }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="text-xs text-ink/50">{label}</span>
      <span className={strong ? "font-display text-base text-ink" : "text-sm text-ink/80"}>{value}</span>
    </div>
  );
}

function ChoiceCard({ active, title, detail, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={"rounded-2xl border p-4 text-left transition-all duration-300 " +
        (active
          ? "border-pine bg-pine text-linen -translate-y-0.5"
          : "border-mist bg-white/60 text-ink hover:border-sage hover:-translate-y-0.5")
      }
    >
      <p className="text-sm font-medium">{title}</p>
      <p className={"mt-1 text-xs " + (active ? "text-linen/70" : "text-ink/50")}>{detail}</p>
    </button>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-mist bg-linen p-5">
      <p className="mb-4 text-xs text-ink/45">{title}</p>
      {children}
    </section>
  );
}

function StepPill({ step, active, done, reachable, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={!reachable}
        aria-current={active ? "step" : undefined}
        className={"w-full rounded-2xl border px-4 py-4 text-left transition-all duration-300 " +
          (active
            ? "border-pine bg-pine text-linen"
            : done
            ? "border-sage-dim bg-sage/10 text-pine hover:-translate-y-0.5"
            : reachable
            ? "border-mist bg-white/60 text-ink/70 hover:border-sage hover:-translate-y-0.5"
            : "cursor-not-allowed border-mist/60 bg-white/30 text-ink/30")
        }
      >
        <p className="mb-1 text-xs">
          {done ? "✓ Step " : "Step "}
          {step.id}
        </p>
        <p className="font-display text-lg leading-tight">{step.label}</p>
        <p className={"mt-0.5 text-xs " + (active ? "text-linen/65" : "text-ink/45")}>{step.hint}</p>
      </button>
    </li>
  );
}

function QuickStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
      <p className="mb-1 text-xs text-ink/45">{label}</p>
      <p className="font-display text-lg text-ink">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, onBlur, placeholder, type = "text", hint, autoComplete, required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-ink/45">
        {label}
        {required && <RequiredMark />}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        aria-required={required || undefined}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full rounded-lg border border-mist bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine transition-colors"
      />
      {hint && <span className="mt-2 block text-xs text-ink/45">{hint}</span>}
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-ink/45">
        {label}
        {required && <RequiredMark />}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-2xl border border-mist bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pine transition-colors"
      />
    </label>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-xs text-linen/55">{label}</span>
      <span className="text-right text-sm text-linen">{value}</span>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-ink/45">{label}</span>
      <span className="text-right font-display text-ink">{value}</span>
    </div>
  );
}
