import { createContext, useContext, useEffect, useState } from "react";
import { SEED_CLEANERS, initials } from "../data/cleaners";

const AppContext = createContext(null);

const CLEANERS_KEY = "linenpress_cleaners";
const BOOKINGS_KEY = "linenpress_bookings";

function loadCleaners() {
  try {
    const raw = localStorage.getItem(CLEANERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to seed
  }
  return SEED_CLEANERS;
}

function loadBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through
  }
  return [];
}

export function AppProvider({ children }) {
  const [cleaners, setCleaners] = useState(loadCleaners);
  const [bookings, setBookings] = useState(loadBookings);

  useEffect(() => {
    localStorage.setItem(CLEANERS_KEY, JSON.stringify(cleaners));
  }, [cleaners]);

  useEffect(() => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }, [bookings]);

  function addCleaner(data) {
    const record = {
      id: "c-" + Date.now(),
      initials: initials(data.name),
      rating: 5.0,
      reviews: 0,
      verifiedOn: new Date().toISOString().slice(0, 10),
      ...data,
    };
    setCleaners((prev) => [record, ...prev]);
    return record;
  }

  function removeCleaner(id) {
    setCleaners((prev) => prev.filter((c) => c.id !== id));
  }

  function addBooking(data) {
    const record = {
      id: "b-" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "Pending confirmation",
      ...data,
    };
    setBookings((prev) => [record, ...prev]);
    return record;
  }

  const value = {
    cleaners,
    addCleaner,
    removeCleaner,
    bookings,
    addBooking,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
