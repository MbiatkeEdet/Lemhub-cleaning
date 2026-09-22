import { useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import SealBadge from "../components/SealBadge";
import { useCatalog } from "../hooks/useCatalog";
import { formatKobo } from "../lib/money";

const STEPS = [
  {
    n: "01",
    title: "Size your home",
    body: "Studio through four-plus bedrooms. Pricing appears as you choose — no quote form, no waiting.",
  },
  {
    n: "02",
    title: "Pick a day and a time",
    body: "Choose a date on the calendar, then an arrival window: 7am, 11am, 1pm or 3pm.",
  },
  {
    n: "03",
    title: "Pay and you're confirmed",
    body: "Card or bank transfer. The moment payment lands, your booking is locked and you get a receipt.",
  },
  {
    n: "04",
    title: "A verified cleaner arrives",
    body: "Background-checked, trained, and carrying our seal. You'll know their name before they knock.",
  },
];

const PROMISES = [
  {
    title: "Verified, not just vetted",
    body: "A named guarantor, proof of address and an in-home trial. Only then does a cleaner earn the seal.",
    icon: "shield",
  },
  {
    title: "A safe word on every visit",
    body: "You and your cleaner confirm a shared word at the door. If a check-in is missed, our team is alerted automatically.",
    icon: "key",
  },
  {
    title: "Fixed prices, no haggling",
    body: "The price you see is the price you pay. Book recurring visits and the per-visit rate drops automatically.",
    icon: "tag",
  },
  {
    title: "Tips go straight to cleaners",
    body: "One hundred percent of every tip reaches the person who earned it. We don't take a cut.",
    icon: "heart",
  },
];

const MARQUEE = ["Guarantor checked","In-home trial passed","Proof of address","Safe-word check-ins","Encrypted access codes","Direct bank payouts","Port Harcourt based",
];

const FAQS = [
  {
    q: "What times can a cleaner arrive?",
    a: "We run four arrival windows every working day: 7:00am, 11:00am, 1:00pm and 3:00pm. Pick a date on the calendar when you book, then choose the window that suits you. We clean Monday to Saturday.",
  },
  {
    q: "Do I need an account to book?",
    a: "No. You can book as a guest in under two minutes. Creating an account just lets you manage recurring plans, see your history, and re-book faster.",
  },
  {
    q: "How are your cleaners checked?",
    a: "Every applicant submits proof of address, a photo and a named guarantor we contact directly. They then complete an in-home trial and a standards review before they are issued a seal.",
  },
  {
    q: "What if nobody will be home?",
    a: "Tell us at booking. You can leave a gate or door code — stored encrypted and only released to your assigned cleaner — or ask them to call you when they arrive.",
  },
  {
    q: "Can I change or cancel a booking?",
    a: "Yes. Cancel from your dashboard any time before your cleaner is on the way, and if you have already paid we process the refund automatically.",
  },
  {
    q: "Which areas do you cover?",
    a: "Port Harcourt and the surrounding Rivers State communities. If you are just outside and not sure, send us a message — we will tell you honestly either way.",
  },
];

export default function Home() {
  const { apartmentTypes, frequencies } = useCatalog();

  return (
    <div className="overflow-x-hidden">
      <Hero />
      <VerificationStrip />
      <HowItWorks />
      <Promises />
      <Pricing apartmentTypes={apartmentTypes} frequencies={frequencies} />
      <Recruitment />
      <Faq />
      <FinalCta />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-mist gradient-brand">
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 md:py-28 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-fade-up">
          <p className="mb-6 flex items-center gap-3 text-xs text-ink/50">
            <span className="h-px w-8 bg-ink/25" aria-hidden="true" />
            Port Harcourt · Rivers State
          </p>
          <h1 className="font-display text-[2.75rem] leading-[1.06] text-ink md:text-6xl md:leading-[1.03]">
            Verified cleaners,
            <br />
            booked in two minutes.
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-ink/65">
            TidyNow matches your apartment with cleaners from Port Harcourt and the surrounding
            Rivers State communities — people who know local customs, languages and household
            preferences. Every one of them has passed background checks, an in-home trial and a
            standards review.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/book"
              className="group inline-flex items-center gap-2 rounded-md bg-pine px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-pine-light"
            >
              Book a clean
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/cleaners"
              className="inline-flex items-center rounded-md border border-mist px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/40"
            >
              How we verify
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ink/10 pt-6 sm:grid-cols-4">
            <HeroStat value="Mon – Sat" label="We clean" />
            <HeroStat value="100%" label="Background-checked" />
            <HeroStat value="4" label="Arrival windows" />
            <HeroStat value="< 2 min" label="To book" />
          </dl>
        </div>

        <div className="relative animate-fade-up">
          <div className="relative overflow-hidden rounded-lg border border-mist">
            <img
              src="/cleaning2.jpg"
              alt="TidyNow cleaners tidying a bright Port Harcourt apartment"
              className="h-[420px] w-full object-cover md:h-[500px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
          </div>

          <div className="absolute -left-4 bottom-6 flex items-center gap-3 rounded-lg border border-mist bg-paper px-4 py-3 sm:-left-6">
            <SealBadge size={44} />
            <div className="whitespace-nowrap">
              <p className="font-display text-base leading-tight text-ink">Verified seal</p>
              <p className="text-xs text-ink/45">
                On every cleaner
              </p>
            </div>
          </div>

          <div className="absolute -right-2 -top-4 hidden rounded-lg border border-mist bg-paper px-4 py-3 sm:block">
            <p className="text-xs text-ink/45">
              Arrival windows
            </p>
            <p className="font-display text-base text-ink">7am · 11am · 1pm · 3pm</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }) {
  return (
    <div>
      <dd className="font-display text-2xl text-ink">{value}</dd>
      <dt className="text-xs text-ink/45">{label}</dt>
    </div>
  );
}

function VerificationStrip() {
  return (
    <section className="border-b border-mist bg-linen" aria-label="What verification covers">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 divide-y divide-mist px-6 sm:grid-cols-4 sm:divide-y-0 md:divide-x">
        {MARQUEE.slice(0, 4).map((item) => (
          <li key={item} className="px-0 py-4 text-sm text-ink/60 sm:px-5 sm:text-center">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-xs text-ink/45">How it works</p>
          <h2 className="max-w-lg font-display text-3xl leading-[1.12] text-ink">
            Four steps between you and a spotless apartment.
          </h2>
        </div>
        <div className="w-full max-w-md rounded-xl border border-mist bg-linen-dim p-3">
          <img
            src="/cleaning1.jpg"
            alt="A bright, tidy apartment after a TidyNow visit"
            className="h-64 w-full rounded-xl object-cover"
          />
        </div>
      </Reveal>

      <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 90} className="border-t border-mist pt-6">
            <p className="mb-3 text-xs text-ink/50">{s.n}</p>
            <h3 className="mb-2 font-display text-xl text-ink">{s.title}</h3>
            <p className="text-sm leading-relaxed text-ink/60">{s.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Promises() {
  return (
    <section className="border-y border-mist bg-linen-dim">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="mb-14 max-w-2xl">
          <p className="mb-3 text-xs text-ink/45">
            Why the seal matters
          </p>
          <h2 className="mb-4 font-display text-3xl leading-[1.12] text-ink">
            Letting someone into your home is a trust decision. We treat it like one.
          </h2>
          <p className="leading-relaxed text-ink/60">
            Anyone can call themselves a cleaning service. The seal is the part that is hard —
            and the part we do not skip.
          </p>
        </Reveal>

        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {PROMISES.map((p, i) => (
            <Reveal
              key={p.title}
              delay={i * 80}
              className="group border-t border-mist pt-6"
            >
              <span className="mb-4 flex h-8 w-8 items-center justify-center text-ink/70">
                <PromiseIcon name={p.icon} />
              </span>
              <h3 className="mb-2 font-display text-xl text-ink">{p.title}</h3>
              <p className="text-sm leading-relaxed text-ink/60">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromiseIcon({ name }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round","aria-hidden": true,
  };

  if (name === "shield") {
    return (
      <svg {...common}>
        <path d="M12 3l7 3v5c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }
  if (name === "key") {
    return (
      <svg {...common}>
        <circle cx="8" cy="12" r="3.5" />
        <path d="M11.5 12H21M18 12v3M15 12v2" />
      </svg>
    );
  }
  if (name === "tag") {
    return (
      <svg {...common}>
        <path d="M3 12V5a2 2 0 012-2h7l9 9-9 9-9-9z" />
        <circle cx="7.5" cy="7.5" r="1.2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 20s-7-4.5-7-9.5A3.8 3.8 0 0112 7a3.8 3.8 0 017 3.5c0 5-7 9.5-7 9.5z" />
    </svg>
  );
}

function Pricing({ apartmentTypes, frequencies }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mb-12 max-w-2xl">
        <p className="mb-3 text-xs text-ink/45">Pricing</p>
        <h2 className="mb-4 font-display text-3xl leading-[1.12] text-ink">
          Priced by apartment size. Discounted by consistency.
        </h2>
        <p className="leading-relaxed text-ink/60">
          Book recurring visits and your per-visit rate drops automatically. No contracts, no
          cancellation fees — pause or change your plan whenever you like.
        </p>
      </Reveal>

      <Reveal className="overflow-x-auto rounded-2xl border border-mist bg-white/70">
        <table className="w-full min-w-[540px] text-left">
          <caption className="sr-only">Per-visit price by apartment size and cleaning frequency</caption>
          <thead>
            <tr className="border-b border-mist">
              <th scope="col" className="px-6 py-4 text-xs text-ink/45">
                Apartment
              </th>
              {frequencies.map((f) => (
                <th
                  key={f.code}
                  scope="col"
                  className="px-6 py-4 text-xs text-ink/45"
                >
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apartmentTypes.map((apt, i) => (
              <tr
                key={apt.code}
                className={"transition-colors hover:bg-linen " +
                  (i !== apartmentTypes.length - 1 ? "border-b border-mist" : "")
                }
              >
                <th scope="row" className="px-6 py-4 text-left font-display text-base font-normal text-ink">
                  {apt.label}
                  <span className="mt-0.5 block text-xs text-ink/40">
                    {apt.subtitle}
                  </span>
                </th>
                {apt.is_custom_pricing ? (
                  <td colSpan={frequencies.length} className="px-6 py-4 font-mono text-sm text-ink/70">
                    Contact us for a custom quote
                  </td>
                ) : (
                  frequencies.map((f) => (
                    <td key={f.code} className="px-6 py-4 font-mono text-sm text-ink/70">
                      {formatKobo(apt.base_price_kobo * f.multiplier)}
                      <span className="text-ink/40"> /visit</span>
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <Reveal delay={100} className="mt-8">
        <Link
          to="/book"
          className="inline-flex items-center gap-2 border-b border-ink/30 pb-0.5 text-xs text-pine"
        >
          Get an exact quote
          <span aria-hidden="true">→</span>
        </Link>
      </Reveal>
    </section>
  );
}

function Recruitment() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2">
      <Reveal className="order-2 rounded-xl border border-mist bg-white p-3 md:order-1">
        <img
          src="/cleaning4.jpg"
          alt="A TidyNow cleaner at work"
          className="h-80 w-full rounded-xl object-cover"
        />
      </Reveal>
      <Reveal delay={80} className="order-1 md:order-2">
        <p className="mb-3 text-xs text-ink/50">
          Work with TidyNow
        </p>
        <h2 className="mb-4 max-w-md font-display text-3xl leading-[1.12] text-ink">
          Earn steady income as a verified TidyNow cleaner.
        </h2>
        <p className="mb-8 max-w-md leading-relaxed text-ink/60">
          Join a roster of background-checked professionals across Port Harcourt. Get matched with
          apartments near you and build a reputation customers trust.
        </p>
        <ul className="mb-9 grid gap-3 text-sm text-ink/70">
          {["Flexible schedule — take on as many jobs as you choose","A verified seal that builds customer trust from day one","Direct bank payouts — you keep 100% of your tips",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <Link
          to="/cleaner/apply"
          className="inline-flex items-center rounded-md bg-pine px-7 py-3.5 text-sm font-medium text-linen transition-colors hover:bg-pine-light"
        >
          Apply to become a cleaner
        </Link>
      </Reveal>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="border-t border-mist bg-linen-dim">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <Reveal className="mb-12 text-center">
          <p className="mb-3 text-xs text-ink/45">
            Questions, answered
          </p>
          <h2 className="font-display text-3xl leading-[1.12] text-ink">
            The things people ask before their first clean.
          </h2>
        </Reveal>

        <div className="border-t border-mist">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={faq.q} delay={i * 50}>
                <div className="border-b border-mist">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-ink/70"
                    >
                      <span className="font-display text-lg text-ink">{faq.q}</span>
                      <span
                        className={"flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-mist text-ink/50 transition-transform duration-300 " +
                          (isOpen ? "rotate-45 border-pine text-pine" : "")
                        }
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>
                  </h3>
                  <div
                    className={"grid transition-all duration-300 ease-out " +
                      (isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")
                    }
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-5 text-sm leading-relaxed text-ink/60">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-mist gradient-brand-deep">
      <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
        <Reveal>
          <h2 className="mx-auto mb-4 max-w-2xl font-display text-3xl leading-[1.12] text-paper md:text-4xl">
            Your apartment, held to a standard.
          </h2>
          <p className="mx-auto mb-9 max-w-md leading-relaxed text-paper/60">
            Pick a day, pick a time, and get a verified cleaner at your door. No account needed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/book"
              className="group inline-flex items-center gap-2 rounded-md bg-paper px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-white/90"
            >
              Book a clean
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md border border-white/25 px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-white/60"
            >
              Talk to us first
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
