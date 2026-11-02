import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { ls } from "./store";

export type SyncState = "local" | "saving" | "saved" | "error";

// Guarda un valor en el navegador y, si hay sesión, también en la cuenta (tabla user_state).
// La primera vez, lo que ya había en el navegador se sube a la cuenta. Después, la cuenta manda.
export function useCloud<T>(field: "planner" | "schedule", lsKey: string, initial: T, isEmpty: (v: T) => boolean, legacy?: () => T | null): [T, (v: T) => void, SyncState] {
  const [value, setValue] = useState<T>(() => ls.get<T | null>(lsKey, null) ?? legacy?.() ?? initial);
  const [state, setState] = useState<SyncState>("local");
  const [uid, setUid] = useState<string | null>(null);
  const valueRef = useRef(value);
  const touched = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(false);
  const seen = useRef<string | null>(null);
  const emptyRef = useRef(isEmpty);
  valueRef.current = value;
  emptyRef.current = isEmpty;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUid(data.session?.user.id ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUid(s?.user.id ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const push = useCallback(async () => {
    if (!uid) return;
    pending.current = false;
    setState("saving");
    const { data, error } = await supabase.from("user_state").upsert({ user_id: uid, [field]: valueRef.current }, { onConflict: "user_id" }).select("updated_at").maybeSingle();
    if (error) { setState("error"); pending.current = true; return; }
    if (data) seen.current = (data as { updated_at: string }).updated_at;
    touched.current = false;
    setState("saved");
  }, [uid, field]);

  const pull = useCallback(async () => {
    if (!uid) return;
    const { data, error } = await supabase.from("user_state").select(`${field}, updated_at`).eq("user_id", uid).maybeSingle();
    if (error) { setState("error"); return; }
    const row = data as unknown as Record<string, unknown> | null;
    const cloud = row ? (row[field] as T | null) : null;
    if (cloud === null || cloud === undefined) {
      // nunca se guardó en la cuenta: subimos lo que haya en este dispositivo
      if (!emptyRef.current(valueRef.current)) await push(); else setState("saved");
      return;
    }
    if (touched.current || pending.current) { await push(); return; }
    if (row && seen.current === (row.updated_at as string)) { setState("saved"); return; }
    seen.current = row ? (row.updated_at as string) : null;
    setValue(cloud); ls.set(lsKey, cloud); setState("saved");
  }, [uid, field, lsKey, push]);

  useEffect(() => { pull(); }, [pull]);
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden" && pending.current) { if (timer.current) clearTimeout(timer.current); push(); }
      if (document.visibilityState === "visible" && !pending.current) pull();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [push, pull]);

  const set = useCallback((v: T) => {
    touched.current = true; setValue(v); ls.set(lsKey, v);
    if (!uid) return;
    pending.current = true; setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(push, 800);
  }, [lsKey, uid, push]);

  return [value, set, uid ? state : "local"];
}

export function SyncNote({ state }: { state: SyncState }) {
  const t = { local: "Solo en este dispositivo.", saving: "Guardando en tu cuenta…", saved: "Guardado en tu cuenta: lo ves igual desde cualquier dispositivo.", error: "No pudimos guardar en tu cuenta. Queda en este dispositivo y reintentamos." }[state];
  return <p role="status" className={`text-xs ${state === "error" ? "text-[#B3261E]" : "text-slate-500"}`}>{t}</p>;
}
