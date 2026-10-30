import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Profile = { id: string; email: string; display_name: string | null; career: string | null; role: "user" | "moderator" | "admin"; banned: boolean };
export type Auth = { session: Session | null; profile: Profile | null; ready: boolean };

export function useAuth(): Auth {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  const uid = session?.user.id;
  useEffect(() => {
    if (!uid) { setProfile(null); return; }
    supabase.from("profiles").select("*").eq("id", uid).maybeSingle().then(({ data }) => setProfile((data as Profile) || null));
  }, [uid]);
  return { session, profile, ready };
}

export const isMod = (p: Profile | null) => !!p && !p.banned && (p.role === "moderator" || p.role === "admin");

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    const e = email.trim().toLowerCase();
    if (!/^[^@\s]+@itba\.edu\.ar$/.test(e)) { setErr("Usá tu correo @itba.edu.ar."); return; }
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithOtp({ email: e, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) {
      const m = error.message.toLowerCase();
      setErr(m.includes("rate") ? "Se alcanzó el límite de correos. Probá de nuevo en unos minutos." : m.includes("database error") ? "Solo se permiten cuentas @itba.edu.ar." : "No pudimos enviar el correo. Probá de nuevo.");
    } else setSent(true);
  };
  return (
    <div className="fixed inset-0 z-50 bg-[#0B2A6B]/60 grid place-items-center px-4" onClick={onClose}>
      <div role="dialog" aria-label="Ingresar" className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 pop" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-extrabold tracking-tight">Ingresar</h2>
        {sent ? (
          <>
            <p className="mt-3 text-slate-700">Te enviamos un enlace a <strong>{email.trim().toLowerCase()}</strong>. Abrilo desde este mismo dispositivo para entrar. Si no llega, revisá spam.</p>
            <button onClick={onClose} className="mt-5 rounded-xl px-5 h-11 font-semibold text-white bg-[#2B52A1]">Listo</button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-600">Es solo para la comunidad ITBA: necesitás un correo @itba.edu.ar. Sin contraseña, te mandamos un enlace de acceso.</p>
            <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} type="email" autoFocus placeholder="tu-usuario@itba.edu.ar" className="mt-4 w-full rounded-xl border border-[#C5D0E6] px-4 h-12" />
            {err && <p role="alert" className="mt-2 text-sm text-[#B3261E]">{err}</p>}
            <div className="mt-5 flex gap-2">
              <button onClick={submit} disabled={busy} className="rounded-xl px-5 h-11 font-semibold text-white bg-[#2B52A1] disabled:opacity-50">{busy ? "Enviando…" : "Enviar enlace"}</button>
              <button onClick={onClose} className="rounded-xl px-4 h-11 text-sm font-semibold border border-[#C5D0E6]">Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
