import { Link } from "react-router-dom";

const highlights = [
  { title: "White-glove care", body: "Every visit is handled with polished precision, calm energy, and respect for your home." },
  { title: "Tailored to your rhythm", body: "Choose a schedule that fits your routine, from one-offs to recurring support." },
  { title: "Trusted by detail", body: "Our standards are elevated, our approach is personal, and every service feels effortless." },
];

export default function Cleaners() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="rounded-[2rem] border border-mist bg-[linear-gradient(135deg,rgba(120,155,129,0.12),rgba(255,255,255,0.95))] p-8 shadow-[0_20px_60px_rgba(33,36,31,0.08)] md:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-brass mb-3">
          Elevated care
        </p>
        <h1 className="font-display text-4xl text-ink md:text-5xl max-w-3xl">
          A cleaner home, delivered with calm luxury and thoughtful attention.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/70">
          Our service experience is designed to feel seamless, reassuring, and refined — from the first booking to the final room reset.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-[1.25rem] border border-mist bg-white/80 p-5">
              <h2 className="font-display text-xl text-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/book"
            className="inline-flex items-center rounded-full bg-pine px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-linen transition-colors hover:bg-pine-light"
          >
            Book your clean
          </Link>
          <p className="text-sm text-ink/60">
            Cleaner profiles and roster details remain available inside the agency portal for authorized staff.
          </p>
        </div>
      </div>
    </div>
  );
}
