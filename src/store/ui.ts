// src/store/ui.ts
import * as React from "react";

export type View = "config" | "main";

let _view: View =
  (typeof window !== "undefined" &&
    (localStorage.getItem("ui:view") as View)) || "config";

const subs = new Set<(v: View) => void>();

function setGlobalView(v: View) {
  _view = v;
  try {
    localStorage.setItem("ui:view", v);
  } catch { }
  subs.forEach((fn) => fn(v));
}

export function useUI() {
  const [view, setView] = React.useState<View>(_view);

  React.useEffect(() => {
    const fn = (v: View) => setView(v);
    subs.add(fn);
    // ✅ cleanup debe devolver void, no boolean
    return () => {
      subs.delete(fn);
    };
  }, []);

  return {
    view,
    setView: (v: View) => setGlobalView(v),
    toggleView: () => setGlobalView(_view === "config" ? "main" : "config"),
  };
}
