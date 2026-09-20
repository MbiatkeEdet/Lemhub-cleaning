import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SECTIONS = [
  {
    title: "Admin",
    roles: ["admin"],
    links: [
      { to: "/admin", label: "Overview", end: true },
      { to: "/admin/bookings", label: "Bookings" },
      { to: "/admin/customers", label: "Customers" },
      { to: "/admin/applications", label: "Applications" },
      { to: "/admin/cleaners/new", label: "Add cleaner" },
      { to: "/admin/payments", label: "Payments" },
      { to: "/admin/payouts", label: "Payouts" },
      { to: "/admin/gateways", label: "Gateways" },
      { to: "/admin/pricing", label: "Pricing" },
      { to: "/admin/support-applications", label: "Support apps" },
      { to: "/admin/activity", label: "Activity" },
    ],
  },
  {
    // Shared by admins and support agents — the same console for both, with
    // admin-only actions hidden by the API's response.
    title: "Operations",
    roles: ["admin", "support_agent"],
    links: [
      { to: "/staff/cleaners", label: "Cleaners" },
      { to: "/staff/safety-alerts", label: "Safety alerts" },
    ],
  },
  {
    title: "Support",
    roles: ["admin", "support_agent"],
    links: [
      { to: "/support", label: "Overview", end: true },
      { to: "/support/console", label: "Tickets" },
    ],
  },
  {
    title: "Cleaner",
    roles: ["cleaner"],
    links: [{ to: "/cleaner", label: "Dashboard", end: true }],
  },
];

const ROLE_LABEL = {
  admin: "Admin",
  support_agent: "Support",
  cleaner: "Cleaner",
};

export default function InternalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sections = SECTIONS.filter((s) => s.roles.includes(user?.role));

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="h-screen flex bg-paper overflow-hidden">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-mist bg-linen-dim px-5 py-8 h-screen overflow-y-auto">
        <NavLink to="/" className="font-display text-lg text-ink mb-10">
          TidyNow
        </NavLink>

        <nav className="flex-1 grid gap-8">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs text-ink/40 mb-3">
                {section.title}
              </p>
              <div className="grid gap-1">
                {section.links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>"rounded-lg px-3 py-2 text-xs transition-colors " +
                      (isActive ? "bg-pine text-linen" : "text-ink/60 hover:bg-white hover:text-ink")
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="shrink-0 flex items-center justify-between border-b border-mist bg-linen/95 backdrop-blur px-6 py-4">
          <p className="text-xs text-ink/45">
            {ROLE_LABEL[user?.role] || "Console"}
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-ink/70">{user?.name}</p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center rounded-md border border-ink/20 px-4 py-1.5 text-sm font-medium text-ink"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
