import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        setUser(result.data || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function login(email, password) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Gagal login");
    }
    setUser(result.data);
    return result.data;
  }

  async function register(name, email, password, confirmPassword) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Gagal mendaftar");
    }
    setUser(result.data);
    return result.data;
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // ignore
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
