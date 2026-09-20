import { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, getToken, logout as apiLogout, setToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  async function hydrate() {
    try {
      const data = await fetchMe();
      setUser(data.user);
      setCustomer(data.customer);
      return data.user;
    } catch {
      setToken(null);
      setUser(null);
      setCustomer(null);
      return null;
    }
  }

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    hydrate().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(token) {
    setToken(token);
    return hydrate();
  }

  async function logout() {
    try {
      await apiLogout();
    } catch {
      // token may already be invalid/expired — clear local state regardless
    }
    setToken(null);
    setUser(null);
    setCustomer(null);
  }

  const value = {
    user,
    customer,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
