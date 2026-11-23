import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
export function useResource(path) {
  const [state, setState] = useState({
    path,
    data: null,
    error: "",
    loading: !!path,
  });
  const controller = useRef(null);
  const sequence = useRef(0);
  const reload = useCallback(async () => {
    controller.current?.abort();
    const request = ++sequence.current;
    const pending = new AbortController();
    controller.current = pending;
    if (!path) {
      setState({ path, data: null, error: "", loading: false });
      return;
    }
    setState((previous) => ({
      path,
      data: previous.path === path ? previous.data : null,
      error: "",
      loading: true,
    }));
    try {
      const result = await api(path, { signal: pending.signal });
      if (request !== sequence.current || pending.signal.aborted) return;
      setState({ path, data: result, error: "", loading: false });
      return result;
    } catch (e) {
      if (request === sequence.current && !pending.signal.aborted)
        setState((previous) => ({
          ...previous,
          error: e.message,
          loading: false,
        }));
    }
  }, [path]);
  useEffect(() => {
    void reload();
    const pending = controller.current;
    return () => {
      pending?.abort();
    };
  }, [reload]);
  const setData = useCallback((update) => {
    setState((previous) => ({
      ...previous,
      data: typeof update === "function" ? update(previous.data) : update,
    }));
  }, []);
  const current =
    state.path === path ? state : { data: null, error: "", loading: !!path };
  return { ...current, setData, reload };
}
export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const change = () => setOnline(navigator.onLine);
    window.addEventListener("online", change);
    window.addEventListener("offline", change);
    return () => {
      window.removeEventListener("online", change);
      window.removeEventListener("offline", change);
    };
  }, []);
  return online;
}
