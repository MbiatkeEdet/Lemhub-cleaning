import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/book", label: "Book a Clean" },
  { to: "/agency", label: "Agency Portal" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-linen/95 backdrop-blur border-b border-mist">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-20 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pine text-linen font-display text-sm">
              TN
            </span>
            <span className="font-display text-xl tracking-tight text-ink">
              TidyNow
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

          <div className="hidden md:flex items-center gap-3">
            {user.isLoggedIn ? (
              <button
                onClick={logout}
                className="inline-flex items-center rounded-full border border-ink/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink"
              >
                Logout
              </button>
            ) : null}
          </div>

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
        </nav>
      )}
    </header>
  );
}
