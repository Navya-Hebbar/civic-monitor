import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ✅ Initialize from localStorage to survive page refresh
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // ✅ Check auth on mount (refresh)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get("/users/me", { withCredentials: true });
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data)); // save user
      } catch {
        setUser(null);
        localStorage.removeItem("user"); // remove if not authenticated
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // ✅ Logout
  const logout = async () => {
    try {
      await api.delete("/auth/logout", { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
