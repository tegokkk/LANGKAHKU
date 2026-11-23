import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api, setCsrf } from "../services/api";
import { setSchoolTimezone } from "../utils/time";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const generation = useRef(0);
  const channel = useRef(null);
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [demo, setDemo] = useState(false);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setError("");
    try {
      const data = await api("/auth/me", { updateCsrf: false });
      if (request !== generation.current) return;
      setCsrf(data.csrf || "");
      setUser(data.user);
      setSchoolTimezone(data.user?.schoolTimezone);
      setDemo(data.demo);
      return data.user;
    } catch (e) {
      if (request === generation.current) setError(e.message);
      throw e;
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh().catch(() => {});
    const expired = () => {
      ++generation.current;
      setCsrf("");
      setUser(null);
      setError("");
      refresh().catch(() => {});
    };
    window.addEventListener("session-expired", expired);
    const restricted = () => {
      setUser((current) =>
        current ? { ...current, active: false, destination: "/status" } : null,
      );
      refresh().catch(() => {});
    };
    window.addEventListener("session-restricted", restricted);
    return () => {
      window.removeEventListener("session-expired", expired);
      window.removeEventListener("session-restricted", restricted);
    };
  }, [refresh]);
  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const connection = new BroadcastChannel("langkahku-auth");
    channel.current = connection;
    connection.onmessage = () => {
      ++generation.current;
      setUser(null);
      setLoading(true);
      setCsrf("");
      refresh().catch(() => {});
    };
    return () => {
      channel.current = null;
      connection.close();
    };
  }, [refresh]);
  const login = async (input) => {
    ++generation.current;
    const data = await api("/auth/login", { method: "POST", body: input });
    setUser(data.user);
    setError("");
    setSchoolTimezone(data.user?.schoolTimezone);
    channel.current?.postMessage("changed");
    return data;
  };
  const register = async (input) => {
    ++generation.current;
    const data = await api("/auth/register", { method: "POST", body: input });
    setUser(data.user);
    setError("");
    setSchoolTimezone(data.user?.schoolTimezone);
    channel.current?.postMessage("changed");
    return data;
  };
  const logout = async () => {
    ++generation.current;
    await api("/auth/logout", { method: "POST" });
    setCsrf("");
    setUser(null);
    channel.current?.postMessage("changed");
    await refresh();
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        demo,
        refresh,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
