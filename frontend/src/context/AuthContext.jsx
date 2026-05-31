import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext   = createContext();
const USER_KEY      = "user";
const TOKEN_KEY     = "token";

/* ── Safe parse — avoids crashes on corrupt localStorage data ── */
function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadUser);

  const login = useCallback((userData, token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch {
      // localStorage write failed (private mode quota) — still update state
    }
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [login, logout, user]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};