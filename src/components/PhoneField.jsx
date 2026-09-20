import { useEffect, useMemo, useRef, useState } from "react";
import RequiredMark from "./RequiredMark";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  formatAsYouType,
  fromE164,
  isValidForCountry,
  toE164,
} from "../lib/phone";

/**
 * An international phone input: pick a country, type the national number,
 * and the field reports E.164 upward. Validation is per-country via
 * libphonenumber-js, so a UK number isn't judged by Nigerian rules.
 *
 * `value` is the E.164 string (or ""), `onChange` receives the E.164 string
 * when valid and "" when not, and `onValidityChange` reports validity so a
 * parent form can gate its submit button.
 */
export default function PhoneField({
  label = "Phone number",
  value,
  onChange,
  onValidityChange,
  onBlur,
  required = true,
  hint,
  autoFocus = false,
  id,
}) {
  const fieldId = useRef(id || `phone-${Math.random().toString(36).slice(2, 9)}`).current;
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [national, setNational] = useState("");
  const [touched, setTouched] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const hydrated = useRef(false);
  const wrapRef = useRef(null);

  // Hydrate once from a stored E.164 value (a saved draft, a prefilled
  // profile) without fighting the user's typing afterwards.
  useEffect(() => {
    if (hydrated.current || !value) return;
    const parsed = fromE164(value);
    if (parsed) {
      setCountry(parsed.country);
      setNational(parsed.nationalNumber);
    }
    hydrated.current = true;
  }, [value]);

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.iso2 === country) || COUNTRIES[0],
    [country]
  );

  const valid = isValidForCountry(national, country);
  const showError = touched && national.trim() !== "" && !valid;
  const showRequired = touched && required && national.trim() === "";

  useEffect(() => {
    onValidityChange?.(required ? valid : valid || national.trim() === "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, national, required]);

  function emit(nextNational, nextCountry) {
    onChange?.(toE164(nextNational, nextCountry) || "");
  }

  function handleInput(raw) {
    // Typing a leading "+" means the user is pasting a full international
    // number — let libphonenumber re-detect the country from it.
    const next = formatAsYouType(raw, country);
    setNational(next);
    emit(next, country);
  }

  function handleCountry(iso2) {
    setCountry(iso2);
    setPickerOpen(false);
    setQuery("");
    emit(national, iso2);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso2.toLowerCase().includes(q) ||
        c.callingCode.includes(q)
    );
  }, [query]);

  return (
    <div className="block" ref={wrapRef}>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-xs text-ink/45"
      >
        {label}
        {required && <RequiredMark />}
      </label>

      <div
        className={"relative flex items-stretch rounded-2xl border bg-white/80 transition-colors " +
          (showError || showRequired
            ? "border-clay"
            : valid
            ? "border-pine/60"
            : "border-mist focus-within:border-pine")
        }
      >
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-label={`Country: ${selected.name}`}
          aria-expanded={pickerOpen}
          className="flex shrink-0 items-center gap-2 rounded-l-2xl border-r border-mist px-3.5 text-sm text-ink hover:bg-linen/60 transition-colors"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="font-mono text-xs text-ink/70">{selected.callingCode}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" className="text-ink/40">
            <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <input
          id={fieldId}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          autoFocus={autoFocus}
          value={national}
          onChange={(e) => handleInput(e.target.value)}
          onBlur={() => {
            setTouched(true);
            onBlur?.(toE164(national, country) || "");
          }}
          placeholder={country === "NG" ? "0801 234 5678" : "Phone number"}
          required={required}
          aria-required={required || undefined}
          aria-invalid={showError || showRequired}
          className="w-full rounded-r-2xl bg-transparent px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none"
        />

        {valid && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-pine" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}

        {pickerOpen && (
          <div className="absolute left-0 top-full z-[60] mt-2 w-full max-w-sm overflow-hidden rounded-2xl border border-mist bg-white">
            <div className="border-b border-mist p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or code"
                className="w-full rounded-xl border border-mist bg-linen/40 px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-pine"
              />
            </div>
            <ul className="max-h-64 overflow-y-auto py-1">
              {filtered.map((c) => (
                <li key={c.iso2}>
                  <button
                    type="button"
                    onClick={() => handleCountry(c.iso2)}
                    className={"flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors " +
                      (c.iso2 === country ? "bg-pine/10 text-pine" : "text-ink hover:bg-linen/70")
                    }
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="font-mono text-xs text-ink/45">{c.callingCode}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-4 text-center text-sm text-ink/45">No country matches that.</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {showRequired ? (
        <p className="mt-2 text-xs text-clay">Enter your phone number so your cleaner can reach you.</p>
      ) : showError ? (
        <p className="mt-2 text-xs text-clay">
          That doesn't look like a valid {selected.name} number. Check the digits and try again.
        </p>
      ) : (
        hint && <p className="mt-2 text-xs text-ink/45">{hint}</p>
      )}
    </div>
  );
}
