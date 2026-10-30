import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    apiFetch("/auth/me")
      .then((response) => {
        if (!response.ok) {
          return null;
        }
        return response.json();
      })
      .then((result) => {
        if (!ignore) {
          setUser(result?.data || null);
        }
      })
      .catch(() => {
        if (!ignore) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function login(email, password) {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    const response = await apiFetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch {
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
