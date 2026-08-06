import { Link } from "react-router-dom";
import SealBadge from "../components/SealBadge";
import CleanerCard from "../components/CleanerCard";
import { useApp } from "../context/AppContext";
import { APARTMENT_TYPES, FREQUENCIES, currency } from "../data/pricing";

const steps = [
  {
    n: "Choose",
    title: "Tell us your apartment",
    body: "Studio through 4+ bedrooms — pick a size and see pricing instantly.",
  },
  {
    n: "Schedule",
    title: "Pick a frequency",
    body: "One-time, twice a month, or weekly. Change or pause anytime.",
  },
  {
    n: "Relax",
    title: "A verified cleaner arrives",
    body: "Every cleaner carries our seal — background-checked and trained.",
  },
];

export default function Home() {
  const { cleaners } = useApp();

  return (
    <div>
      {/* Hero */}
      <section className="texture-linen relative overflow-hidden border-b border-mist">
        <img
          src="/cleaning2.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-linen/45" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-32 grid md:grid-cols-[1.2fr_0.8fr] gap-16 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-brass mb-6">
              Verified cleaners · Port Harcourt, Rivers State, Nigeria
            </p>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-ink">
              Every clean,
              <br />
              <span className="italic text-pine">sealed</span> by verification.
            </h1>
            <p className="mt-6 max-w-md text-ink/65 leading-relaxed">
              TidyNow connects your apartment with cleaners from Port
              Harcourt and surrounding Rivers State communities. Our team
              understands local customs, languages, and household
              preferences — every cleaner has passed background checks,
              in-home trials, and standards review, marked by a seal you
              can trust.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/book"
                className="inline-flex items-center rounded-full bg-pine px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-linen hover:bg-pine-light transition-colors"
              >
                Get your price
              </Link>
              <Link
                to="/cleaners"
                className="inline-flex items-center rounded-full border border-ink/20 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-ink hover:border-ink/50 transition-colors"
              >
                Meet the cleaners
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="relative">
              <SealBadge size={220} />
              <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em] text-ink/40">
                {cleaners.length} cleaners currently verified
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/45 mb-3">
              How it works
            </p>
            <h2 className="font-display text-3xl text-ink max-w-lg">
              Three steps between you and a spotless apartment.
            </h2>
          </div>
          <div className="w-full max-w-md rounded-[2rem] border border-mist bg-linen-dim p-3 shadow-[0_20px_60px_rgba(33,36,31,0.08)]">
            <img
              src="/cleaning1.jpg"
              alt="A bright, tidy apartment setting the tone for LuxeClean"
              className="h-72 w-full rounded-[1.5rem] object-cover"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((s) => (
            <div key={s.n} className="border-t border-mist pt-6">
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-brass mb-3">
                {s.n}
              </p>
              <h3 className="font-display text-xl text-ink mb-2">{s.title}</h3>
              <p className="text-sm text-ink/60 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="border-y border-mist bg-linen-dim">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/45 mb-3">
            Pricing
          </p>
          <h2 className="font-display text-3xl text-ink mb-4 max-w-lg">
            Priced by apartment size, discounted by consistency.
          </h2>
          <p className="text-ink/60 max-w-xl mb-12 leading-relaxed">
            Booking recurring visits lowers your per-visit rate automatically.
            Full detail and a live estimate are one step away.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-mist bg-white/60">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-mist">
                  <th className="px-6 py-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/45">
                    Apartment
                  </th>
                  {FREQUENCIES.map((f) => (
                    <th
                      key={f.id}
                      className="px-6 py-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/45"
                    >
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {APARTMENT_TYPES.map((apt, i) => (
                  <tr
                    key={apt.id}
                    className={i !== APARTMENT_TYPES.length - 1 ? "border-b border-mist" : ""}
                  >
                    <td className="px-6 py-4 font-display text-base text-ink">
                      {apt.label}
                    </td>
                    {FREQUENCIES.map((f) => (
                      <td key={f.id} className="px-6 py-4 font-mono text-sm text-ink/70">
                        {currency(apt.base * f.multiplier)}
                        <span className="text-ink/40"> /visit</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link
            to="/book"
            className="mt-8 inline-flex items-center font-mono text-xs uppercase tracking-[0.14em] text-pine border-b border-brass pb-1"
          >
            Get an exact quote →
          </Link>
        </div>
      </section>

      {/* Verified cleaners preview */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/45 mb-3">
              The roster
            </p>
            <h2 className="font-display text-3xl text-ink max-w-lg">
              A small number of cleaners, each personally vetted.
            </h2>
          </div>
          <Link
            to="/cleaners"
            className="font-mono text-xs uppercase tracking-[0.14em] text-pine border-b border-brass pb-1 whitespace-nowrap"
          >
            View all →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {cleaners.slice(0, 3).map((c) => (
            <CleanerCard key={c.id} cleaner={c} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-mist bg-pine">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-linen mb-4">
            Your apartment, held to a standard.
          </h2>
          <p className="text-linen/60 max-w-md mx-auto mb-8">
            See your price in under a minute — no account required.
          </p>
          <Link
            to="/book"
            className="inline-flex items-center rounded-full bg-brass px-8 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-ink hover:bg-brass-light transition-colors"
          >
            Get your price
          </Link>
        </div>
      </section>
    </div>
  );
}
