import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/book", label: "Book a Clean" },
  { to: "/cleaners", label: "Cleaners" },
  { to: "/contact", label: "Contact" },
];

const ROLE_HOME = {
  admin: "/admin",
  support_agent: "/support",
  cleaner: "/cleaner",
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const dashboardLink = isAuthenticated
    ? { to: ROLE_HOME[user?.role] || "/dashboard", label: "Dashboard" }
    : null;
  const navLinks = dashboardLink ? [...links, dashboardLink] : links;

  return (
    <header className="sticky top-0 z-50 bg-linen/95 backdrop-blur border-b border-mist">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-20 items-center justify-between gap-6">
          <NavLink to="/" className="flex items-center shrink-0">
            <img
              src="/Tidynow1.png"
              alt="TidyNow — Cleaning spaces, better living"
              className="h-16 w-auto shrink-0 object-contain mix-blend-multiply"
            />
          </NavLink>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>"whitespace-nowrap font-display text-sm transition-colors " +
                  (isActive
                    ? "text-pine border-b border-ink/30 pb-0.5"
                    : "text-ink/60 hover:text-ink")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center whitespace-nowrap rounded-md border border-ink/20 px-4 py-2 text-sm font-medium text-ink hover:bg-white transition-colors"
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                className="inline-flex items-center whitespace-nowrap rounded-md border border-ink/20 px-4 py-2 text-sm font-medium text-ink hover:bg-white transition-colors"
              >
                Sign in
              </NavLink>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="h-px w-6 bg-ink" />
            <span className="h-px w-6 bg-ink" />
            <span className="h-px w-6 bg-ink" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-mist px-6 py-4 flex flex-col gap-4">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className="font-display text-sm text-ink/70"
            >
              {l.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="text-left text-xs text-ink/70"
            >
              Logout
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
              className="text-xs text-ink/70"
            >
              Sign in
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
