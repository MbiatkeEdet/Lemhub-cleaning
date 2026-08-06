import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-mist bg-linen-dim">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pine text-linen font-display text-xs">
              LC
            </span>
            <span className="font-display text-lg text-ink">LuxeClean</span>
          </div>
          <p className="text-sm text-ink/60 leading-relaxed max-w-xs">
            Every cleaner on our roster is background-checked, trained, and
            personally vetted before they're issued a seal.
          </p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/50 mb-4">
            Explore
          </p>
          <ul className="space-y-2 text-sm text-ink/70">
            <li>
              <Link to="/cleaners" className="hover:text-ink transition-colors">
                Our Cleaners
              </Link>
            </li>
            <li>
              <Link to="/book" className="hover:text-ink transition-colors">
                Book a Clean
              </Link>
            </li>
            <li>
              <Link to="/agency" className="hover:text-ink transition-colors">
                Agency Portal
              </Link>
            </li>
            <li>
              <Link to="/book" className="hover:text-ink transition-colors">
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/50 mb-4">
            Serving
          </p>
          <p className="text-sm text-ink/70 leading-relaxed">
            Port Harcourt, Rivers State, Nigeria — honoring local cultural
            identities and household customs.
            <br />
            Mon – Sat, 7:00am – 7:00pm
          </p>
        </div>
      </div>
      <div className="border-t border-mist px-6 py-6 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-ink/40">
        © {new Date().getFullYear()} LuxeClean — Premium Home Cleaning
      </div>
    </footer>
  );
}
