import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/cleaners", label: "Our Cleaners" },
  { to: "/book", label: "Book a Clean" },
  { to: "/agency", label: "Agency Portal" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-linen/95 backdrop-blur border-b border-mist">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-20 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pine text-linen font-display text-sm">
              LC
            </span>
            <span className="font-display text-xl tracking-tight text-ink">
              LuxeClean
            </span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  "font-mono text-xs uppercase tracking-[0.14em] transition-colors " +
                  (isActive
                    ? "text-pine border-b border-brass pb-1"
                    : "text-ink/60 hover:text-ink")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/book"
            className="hidden md:inline-flex items-center rounded-full bg-pine px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-linen transition-colors hover:bg-pine-light"
          >
            Get a Quote
          </NavLink>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden flex h-9 w-9 flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="h-px w-6 bg-ink" />
            <span className="h-px w-6 bg-ink" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-mist px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className="font-mono text-xs uppercase tracking-[0.14em] text-ink/70"
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/book"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex w-fit items-center rounded-full bg-pine px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-linen"
          >
            Get a Quote
          </NavLink>
        </nav>
      )}
    </header>
  );
}
