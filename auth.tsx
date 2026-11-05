import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { LegalTab } from "./Legal";

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

function LoginForm({ onSent }: { onSent?: () => void }) {
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
      setErr(m.includes("rate") ? "Se alcanzó el límite de correos. Probá de nuevo en unos minutos." : m.includes("database error") ? "Solo se permiten cuentas @itba.edu.ar." : error.status === 500 ? "El envío de correos no está funcionando en este momento. Avisá a quienes administran el sitio." : "No pudimos enviar el correo. Probá de nuevo.");
    } else { setSent(true); onSent?.(); }
  };
  if (sent) return <p className="text-slate-700">Te enviamos un enlace a <strong>{email.trim().toLowerCase()}</strong>. Abrilo desde este mismo dispositivo para entrar. Si no llega, revisá spam.</p>;
  return (
    <div>
      <label htmlFor="lg" className="text-sm font-semibold">Correo ITBA</label>
      <input id="lg" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} type="email" autoFocus placeholder="tu-usuario@itba.edu.ar" className="mt-1 w-full rounded-xl border border-[#C5D0E6] px-4 h-12" />
      {err && <p role="alert" className="mt-2 text-sm text-[#B3261E]">{err}</p>}
      <button onClick={submit} disabled={busy} className="mt-4 rounded-xl px-6 h-12 font-semibold text-white bg-[#2B52A1] disabled:opacity-50">{busy ? "Enviando…" : "Enviarme el enlace de acceso"}</button>
    </div>
  );
}

export function AuthModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0B2A6B]/60 grid place-items-center px-4" onClick={onClose}>
      <div role="dialog" aria-label="Ingresar" className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 pop" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-extrabold tracking-tight">Ingresar</h2>
        <p className="mt-2 mb-4 text-sm text-slate-600">Es solo para la comunidad ITBA: necesitás un correo @itba.edu.ar. Sin contraseña, te mandamos un enlace de acceso.</p>
        <LoginForm />
        <button onClick={onClose} className="mt-3 text-sm text-slate-500 underline">Cerrar</button>
      </div>
    </div>
  );
}

export function Gate({ loading, banned, onLegal }: { loading?: boolean; banned?: boolean; onLegal?: (t: LegalTab) => void }) {
  return (
    <div className="min-h-screen text-white" style={{ background: "#2B52A1", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <div role="note" className="bg-[#FFE98A] text-[#4A3A00] text-[13px] sm:text-sm text-center px-4 py-2"><strong>Página no oficial.</strong> Hecha por estudiantes: no pertenece ni está avalada por el ITBA.</div>
      <div className="relative overflow-hidden">
        <div className="absolute -right-32 -top-32 w-[460px] h-[460px] rounded-full" style={{ background: "#0B2A6B" }} />
        <div className="relative max-w-3xl mx-auto px-5 py-14 md:py-20">
          <span className="inline-grid place-items-center h-10 px-3 font-extrabold text-xl" style={{ background: "#fff", color: "#2B52A1", borderRadius: "10px 10px 10px 2px" }}>ITBA</span>
          <h1 className="mt-6 font-extrabold tracking-tight leading-[1.05] text-4xl md:text-5xl">Apuntes de la comunidad ITBA</h1>
          <p className="mt-4 text-lg text-white/85 max-w-xl">Apuntes, exámenes viejos y libros por carrera y materia, más calendario, horarios y grupos de estudio. Para entrar, ingresá con tu correo @itba.edu.ar.</p>
          <div className="mt-8 max-w-md rounded-2xl bg-white text-[#1B2433] p-6 shadow-xl">
            {loading ? <p className="text-slate-600">Cargando…</p> : banned ? <p className="text-slate-700">Tu cuenta está suspendida. Si creés que es un error, contactá a los moderadores.</p> : <LoginForm />}
          </div>
          <p className="mt-6 text-sm text-white/75 max-w-xl">Sitio no oficial hecho por estudiantes, sin vínculo institucional con el ITBA. Los nombres y marcas pertenecen a sus titulares.</p>
          {onLegal && <p className="mt-3 text-sm flex flex-wrap gap-x-5 gap-y-1">{([["privacidad", "Privacidad"], ["terminos", "Términos y reglas"], ["autor", "Derechos de autor"], ["contacto", "Contacto"]] as [LegalTab, string][]).map(([k, l]) => <button key={k} onClick={() => onLegal(k)} className="underline text-white/90">{l}</button>)}</p>}
        </div>
      </div>
    </div>
  );
}
