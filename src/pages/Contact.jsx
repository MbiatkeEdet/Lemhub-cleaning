import Reveal from "../components/Reveal";
import SupportRequestForm from "../components/SupportRequestForm";
import WhatsAppChat from "../components/WhatsAppChat";
import { useCatalog } from "../hooks/useCatalog";

// The WhatsApp line is admin-editable, so the list is built per render
// from whatever the catalog currently returns.
const contactPoints = (whatsappNumber) => [
  {
    label: "Email us",
    value: "hello@tidynow.com.ng",
    href: "mailto:hello@tidynow.com.ng",
    detail: "Replies within a few hours",
    icon: "mail",
  },
  {
    label: "Call or WhatsApp",
    value: whatsappNumber,
    href: `tel:${(whatsappNumber || "").replace(/[^0-9+]/g, "")}`,
    detail: "Mon – Sat, 7:00am – 7:00pm",
    icon: "phone",
  },
  {
    label: "Coverage area",
    value: "Port Harcourt, Rivers State",
    href: null,
    detail: "And surrounding communities",
    icon: "pin",
  },
];

const ROUTES = [
  {
    title: "Booking a clean",
    body: "Pricing, arrival windows, or anything about a booking you have not made yet.",
  },
  {
    title: "An existing booking",
    body: "Rescheduling, access details, or a question about your assigned cleaner.",
  },
  {
    title: "Joining the roster",
    body: "Applying as a cleaner or a support agent, and questions about verification.",
  },
  {
    title: "Something went wrong",
    body: "A visit that fell short, a payment question, or a safety concern. We take these first.",
  },
];

export default function Contact() {
  const { whatsappNumber } = useCatalog();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
      <Reveal className="mb-12 max-w-2xl">
        <p className="mb-3 text-xs text-ink/50">Get in touch</p>
        <h1 className="mb-4 font-display text-4xl leading-tight text-ink md:text-5xl">
          Talk to a real person at TidyNow.
        </h1>
        <p className="leading-relaxed text-ink/65">
          Whether you are planning a first booking or need help with one already on the calendar,
          your message reaches our team directly — and you will get an email confirming we have it,
          with a reference number you can quote.
        </p>
      </Reveal>

      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {contactPoints(whatsappNumber).map((c, i) => (
          <Reveal
            key={c.label}
            delay={i * 70}
            className="group rounded-2xl border border-mist bg-white/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sage"
          >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-mist bg-linen text-ink/70">
              <ContactIcon name={c.icon} />
            </span>
            <p className="mb-2 text-xs text-ink/45">
              {c.label}
            </p>
            {c.href ? (
              <a href={c.href} className="font-display text-lg text-ink transition-colors hover:text-pine">
                {c.value}
              </a>
            ) : (
              <p className="font-display text-lg text-ink">{c.value}</p>
            )}
            <p className="mt-1 text-xs text-ink/45">{c.detail}</p>
          </Reveal>
        ))}
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal className="rounded-xl border border-mist bg-white/70 p-6 lg:p-8">
          <p className="mb-1 text-xs text-ink/50">
            Send a message
          </p>
          <h2 className="mb-2 font-display text-2xl text-ink">We'll reply within a few hours.</h2>
          <p className="mb-6 text-sm leading-relaxed text-ink/55">
            Leave an email or a phone number and we will come back on whichever you prefer.
          </p>
          <SupportRequestForm subject="Contact form" />
        </Reveal>

        <div className="grid gap-6">
          <Reveal delay={80} className="overflow-hidden rounded-xl border border-mist">
            <img
              src="/cleaning3.jpg"
              alt="A TidyNow cleaner finishing a Port Harcourt apartment"
              className="h-64 w-full object-cover"
            />
          </Reveal>

          <Reveal delay={140} className="rounded-xl border border-mist bg-linen-dim p-6 lg:p-7">
            <p className="mb-4 text-xs text-ink/45">
              What people write in about
            </p>
            <ul className="grid gap-4">
              {ROUTES.map((r) => (
                <li key={r.title} className="border-l-2 border-brass/50 pl-4">
                  <p className="font-display text-base text-ink">{r.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink/55">{r.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={200} className="rounded-xl border border-mist bg-linen p-6">
            <p className="mb-2 text-xs text-ink/50">
              Urgent or safety-related?
            </p>
            <p className="text-sm leading-relaxed text-ink/70">
              Use the WhatsApp chat in the corner, or call{" "}
              <a href={`tel:${(whatsappNumber || "").replace(/[^0-9+]/g, "")}`} className="font-medium text-pine underline underline-offset-4">
                {whatsappNumber}
              </a>
              . Safety reports go straight to a human — they are never queued behind anything else.
            </p>
          </Reveal>
        </div>
      </div>

      <WhatsAppChat label="Chat with TidyNow" />
    </div>
  );
}

function ContactIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round","aria-hidden": true,
  };

  if (name === "mail") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3.5 6.5l8.5 6 8.5-6" />
      </svg>
    );
  }
  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M5 3h3.5l1.5 4-2 1.5a12 12 0 006.5 6.5L16 13l4 1.5V18a2 2 0 01-2.2 2A16.5 16.5 0 013 6.2 2 2 0 015 4z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
