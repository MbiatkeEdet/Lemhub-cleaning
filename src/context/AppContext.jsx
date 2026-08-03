import { createContext, useContext, useEffect, useState } from "react";
import { SEED_CLEANERS, initials } from "../data/cleaners";

const AppContext = createContext(null);

const CLEANERS_KEY = "linenpress_cleaners";
const BOOKINGS_KEY = "linenpress_bookings";
const USER_KEY = "linenpress_user";

const DEFAULT_PROFILE = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  idNumber: "",
  dob: "",
  purpose: "",
};

const DEFAULT_USER = {
  isLoggedIn: false,
  basicKycCompleted: false,
  fullKycCompleted: false,
  profile: DEFAULT_PROFILE,
};

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

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_USER,
        ...parsed,
        profile: {
          ...DEFAULT_PROFILE,
          ...(parsed.profile || {}),
        },
      };
    }
  } catch {
    // fall through
  }
  return { ...DEFAULT_USER };
}

export function AppProvider({ children }) {
  const [cleaners, setCleaners] = useState(loadCleaners);
  const [bookings, setBookings] = useState(loadBookings);
  const [user, setUser] = useState(loadUser);

  useEffect(() => {
    localStorage.setItem(CLEANERS_KEY, JSON.stringify(cleaners));
  }, [cleaners]);

  useEffect(() => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, [user]);

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

  function completeBasicKyc(data) {
    setUser((prev) => ({
      ...prev,
      isLoggedIn: true,
      basicKycCompleted: true,
      profile: {
        ...prev.profile,
        ...data,
      },
    }));
  }

  function completeFullKyc(data) {
    setUser((prev) => ({
      ...prev,
      fullKycCompleted: true,
      profile: {
        ...prev.profile,
        ...data,
      },
    }));
  }

  function logout() {
    setUser({ ...DEFAULT_USER });
  }

  const value = {
    cleaners,
    addCleaner,
    removeCleaner,
    bookings,
    addBooking,
    user,
    completeBasicKyc,
    completeFullKyc,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
