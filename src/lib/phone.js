import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

export const DEFAULT_COUNTRY = "NG";

const displayNames =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

/** ISO 3166-1 alpha-2 → the flag emoji built from regional indicator symbols. */
export function flagFor(iso2) {
  return iso2
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

export function countryName(iso2) {
  return displayNames?.of(iso2) || iso2;
}

/**
 * Every country libphonenumber knows how to validate, sorted by name with
 * Nigeria pinned first — it's where TidyNow operates, so it's the answer
 * most people want without scrolling.
 */
export const COUNTRIES = getCountries()
  .map((iso2) => ({
    iso2,
    name: countryName(iso2),
    callingCode: `+${getCountryCallingCode(iso2)}`,
    flag: flagFor(iso2),
  }))
  .sort((a, b) => {
    if (a.iso2 === DEFAULT_COUNTRY) return -1;
    if (b.iso2 === DEFAULT_COUNTRY) return 1;
    return a.name.localeCompare(b.name);
  });

/** Formats digits as they're typed, using that country's own grouping. */
export function formatAsYouType(value, country) {
  return new AsYouType(country).input(value || "");
}

/**
 * Per-country validation — libphonenumber applies that country's real
 * length and prefix rules, not a one-size-fits-all pattern.
 */
export function isValidForCountry(nationalNumber, country) {
  if (!nationalNumber?.trim()) return false;
  try {
    return isValidPhoneNumber(nationalNumber, country);
  } catch {
    return false;
  }
}

/** The E.164 string the API stores, or null if the number isn't valid. */
export function toE164(nationalNumber, country) {
  if (!nationalNumber?.trim()) return null;
  try {
    const parsed = parsePhoneNumberFromString(nationalNumber, country);
    return parsed?.isValid() ? parsed.number : null;
  } catch {
    return null;
  }
}

/** Splits a stored E.164 number back into { country, nationalNumber }. */
export function fromE164(e164) {
  if (!e164) return null;
  try {
    const parsed = parsePhoneNumberFromString(e164);
    if (!parsed) return null;
    return {
      country: parsed.country || DEFAULT_COUNTRY,
      nationalNumber: parsed.formatNational(),
    };
  } catch {
    return null;
  }
}

/** A human-friendly international rendering, e.g. "+234 815 968 2481". */
export function formatInternational(e164) {
  try {
    return parsePhoneNumberFromString(e164 || "")?.formatInternational() || e164 || "";
  } catch {
    return e164 || "";
  }
}

export function exampleFor(country) {
  const found = COUNTRIES.find((c) => c.iso2 === country);
  return found ? `${found.callingCode} …` : "";
}
