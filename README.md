# Linen & Press — Premium Verified Home Cleaning

A scaffolded booking platform for a premium home-cleaning agency, built with **Vite + React (JavaScript) + Tailwind CSS v4**.

## Features

- **Client booking flow** (`/book`) — pick apartment size (Studio → 4+ Bedroom), pick a frequency (One-time / Twice a month / Weekly), see a live price estimate, submit contact details to request a cleaner.
- **Verified cleaners roster** (`/cleaners`) — browse and search cleaners, each marked with a signature "seal" badge.
- **Agency portal** (`/agency`) — staff-facing screen to add newly verified cleaners (name, experience, bio, specialties, service areas) and review incoming booking requests.
- **Home page** (`/`) — hero, how-it-works, pricing table preview, roster preview, closing CTA.

## Design

- Palette: warm linen background, deep pine green primary, brass/gold accent, sage secondary — a hospitality-grade, trust-forward look (avoids the generic cream/terracotta AI-default).
- Type: **Fraunces** (display serif) + **Inter** (body) + **IBM Plex Mono** (labels/data), loaded via Google Fonts.
- Signature element: a circular wax-seal-style "Verified" badge used across the hero, cleaner cards, and confirmations.

## Data & persistence

There's no backend yet — cleaners and bookings are held in React Context and persisted to the browser's `localStorage`, seeded with 4 sample cleaners in `src/data/cleaners.js`. Swap `AppContext.jsx` for real API calls when you're ready to connect a backend.

Pricing logic (base price per apartment size × frequency discount multiplier) lives in `src/data/pricing.js` — edit the numbers there to change rates.

## Getting started

```bash
npm install
npm run dev       # start local dev server
npm run build      # production build
```

## Project structure

```
src/
  components/   Navbar, Footer, SealBadge, CleanerCard, PriceCalculator
  context/      AppContext.jsx — cleaners + bookings state
  data/         cleaners.js (seed data), pricing.js (rates & calculator)
  pages/        Home, Cleaners, Book, AgencyPortal
```

## Next steps to make this production-ready

- Replace localStorage with a real backend (auth for the agency portal, a database for cleaners/bookings).
- Add authentication so `/agency` isn't publicly reachable.
- Add payment collection at the end of the booking flow.
- Add cleaner-facing accounts (accept jobs, view schedule).
