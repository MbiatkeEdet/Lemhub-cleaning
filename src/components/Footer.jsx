import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-mist bg-linen-dim">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/Tidynow1.png"
              alt="TidyNow logo"
              className="h-16 w-16 shrink-0 object-contain mix-blend-multiply"
            />
            <div>
              <div className="font-display text-lg text-ink">TidyNow</div>
              <div className="text-xs text-ink/55">Cleaner spaces · Better living</div>
            </div>
          </div>
          <p className="text-sm text-ink/60 leading-relaxed max-w-xs">
            Every cleaner on our roster is background-checked, trained, and
            personally vetted before they're issued a seal.
          </p>
        </div>

        <div>
          <p className="text-xs text-ink/50 mb-4">
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
              <Link to="/about" className="hover:text-ink transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-ink transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs text-ink/50 mb-4">
            Work with us
          </p>
          <ul className="space-y-2 text-sm text-ink/70">
            <li>
              <Link to="/cleaner/apply" className="hover:text-ink transition-colors">
                Become a Cleaner
              </Link>
            </li>
            <li>
              <Link to="/support/apply" className="hover:text-ink transition-colors">
                Join Our Support Team
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs text-ink/50 mb-4">
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
      <div className="border-t border-mist px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-center text-xs text-ink/40 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} TidyNow — Premium Home Cleaning</p>
        </div>
      </div>
    </footer>
  );
}
