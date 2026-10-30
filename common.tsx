import { useState } from "react";
import { supabase } from "./supabase";
import type { Auth } from "./auth";

export const field = "w-full rounded-xl border border-[#C5D0E6] px-4 h-11 bg-white";
export const btn = "rounded-xl px-5 h-11 font-semibold text-white bg-[#2B52A1] hover:bg-[#244690] disabled:opacity-50";
export const btn2 = "rounded-xl px-4 h-10 text-sm font-semibold border border-[#C5D0E6] hover:border-[#2B52A1] bg-white";
export const card = "rounded-2xl border border-[#DCE3F0] bg-white";

export function Title({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h1>
      {sub && <p className="mt-2 text-slate-600 max-w-2xl">{sub}</p>}
    </div>
  );
}

export function LoginPrompt({ login, text }: { login: () => void; text: string }) {
  return (
    <div className={`${card} p-8 text-center`}>
      <p className="text-slate-700 max-w-md mx-auto">{text}</p>
      <button onClick={login} className={`${btn} mt-5`}>Ingresar con mi correo ITBA</button>
    </div>
  );
}

export function ReportButton({ type, id, auth, login }: { type: "help_post" | "event"; id: string; auth: Auth; login: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const send = async () => {
    const { error } = await supabase.from("reports").insert({ target_type: type, target_id: id, reason: reason.trim() });
    setMsg(error ? (error.code === "23505" ? "Ya reportaste esto." : "No se pudo enviar el reporte.") : "Gracias, un moderador lo va a revisar.");
    if (!error) setOpen(false);
  };
  if (msg && !open) return <span className="text-xs text-slate-500">{msg}</span>;
  return open ? (
    <span className="flex flex-wrap gap-2 items-center mt-2">
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo del reporte" className="rounded-lg border border-[#C5D0E6] px-3 h-9 text-sm" />
      <button disabled={reason.trim().length < 3} onClick={send} className="rounded-lg px-3 h-9 text-sm font-semibold text-white bg-[#B3261E] disabled:opacity-50">Enviar</button>
      <button onClick={() => setOpen(false)} className="text-sm text-slate-500">Cancelar</button>
    </span>
  ) : (
    <button onClick={() => (auth.session ? setOpen(true) : login())} className="text-xs text-slate-500 underline">Reportar</button>
  );
}
