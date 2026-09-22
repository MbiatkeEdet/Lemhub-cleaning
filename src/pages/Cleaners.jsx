import { Link } from "react-router-dom";

const verification = [
  { title: "Identity, checked", body: "Proof of address and a named guarantor, confirmed before an application goes any further." },
  { title: "A named guarantor", body: "Someone who vouches for them, contacted directly by our team — not a form-filling exercise." },
  { title: "An in-home trial", body: "A supervised clean against our standards checklist. Passing it is how the seal is earned." },
  { title: "Safe-word check-ins", body: "Every visit carries a shared safe word and a 30-minute check-in. A missed one alerts our team automatically." },
];

const highlights = [
  { title: "White-glove care", body: "Every visit is handled with polished precision, calm energy, and respect for your home." },
  { title: "Tailored to your rhythm", body: "Choose a schedule that fits your routine, from one-offs to recurring support." },
  { title: "Trusted by detail", body: "Our standards are elevated, our approach is personal, and every service feels effortless." },
];

export default function Cleaners() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="rounded-xl border border-mist bg-[linear-gradient(135deg,rgba(79,187,172,0.14),rgba(255,255,255,0.95))] p-8 md:p-12 animate-fade-up">
        <p className="text-xs text-ink/50 mb-3">
          Elevated care
        </p>
        <h1 className="font-display text-4xl text-ink md:text-5xl max-w-3xl">
          A cleaner home, delivered with calm luxury and thoughtful attention.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/70">
          Our service experience is designed to feel seamless, reassuring, and refined — from the first booking to the final room reset.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {highlights.map((item, i) => (
            <div key={item.title} className="rounded-[1.25rem] border border-mist bg-white/80 p-5 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <h2 className="font-display text-xl text-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            to="/book"
            className="inline-flex items-center rounded-md bg-pine px-7 py-3.5 text-sm font-medium text-linen transition-colors hover:bg-pine-light"
          >
            Book your clean
          </Link>
        </div>
      </div>

      <div className="mt-16">
        <p className="text-xs text-ink/45 mb-3">
          How we verify
        </p>
        <h2 className="font-display text-3xl text-ink mb-8 max-w-2xl">
          Every cleaner earns the seal before they ever reach your door.
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {verification.map((item, i) => (
            <div
              key={item.title}
              className="rounded-[1.25rem] border border-mist bg-white/70 p-6 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <h3 className="font-display text-xl text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{item.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink/55">
          You'll be told your cleaner's name before they arrive, and you confirm a shared safe word
          at the door. We don't publish our team's details — their privacy matters as much as yours.
        </p>
      </div>
    </div>
  );
}
