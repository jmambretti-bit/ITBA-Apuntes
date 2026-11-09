import { useCallback, useEffect, useMemo, useState } from "react";
import { CAREERS } from "./data";
import { supabase } from "./supabase";
import { isMod, type Auth } from "./auth";
import { Title, card, btn, btn2, field, ReportButton } from "./common";

export type Ev = { id: string; title: string; description: string | null; category: string; career: string | null; subject: string | null; starts_at: string; ends_at: string | null; location: string | null; status: string; created_by: string };
const CATS: Record<string, [string, string]> = { parcial: ["Parcial", "#D6452D"], final: ["Final", "#B8398B"], inscripcion: ["Inscripción", "#1F8FD6"], asociacion: ["Asociación", "#00A14B"], otro: ["Otro", "#3A3F4A"] };
const CAREER_NAMES = CAREERS.map((c) => c.name);
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
const fmtDay = (iso: string) => new Date(iso).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
const blank = { title: "", category: "parcial", career: "", subject: "", date: "", time: "09:00", endTime: "", location: "", description: "" };

export default function CalendarView({ auth, login }: { auth: Auth; login: () => void }) {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [evs, setEvs] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [career, setCareer] = useState("");
  const [cat, setCat] = useState("");
  const [day, setDay] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const since = new Date(Date.now() - 60 * 864e5).toISOString();
    const { data, error: e } = await supabase.from("events").select("*").gte("starts_at", since).order("starts_at").limit(500);
    if (e) setError("No pudimos cargar el calendario. Probá de nuevo en un rato."); else { setError(""); setEvs((data as Ev[]) || []); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load, auth.session?.user.id]);

  const shown = useMemo(() => evs.filter((e) => (!career || !e.career || e.career === career) && (!cat || e.category === cat)), [evs, career, cat]);
  const byDay = useMemo(() => { const m: Record<string, Ev[]> = {}; shown.forEach((e) => { (m[key(new Date(e.starts_at))] ||= []).push(e); }); return m; }, [shown]);
  const first = (month.getDay() + 6) % 7;
  const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((first + dim) / 7) * 7 }, (_, i) => (i >= first && i < first + dim ? new Date(month.getFullYear(), month.getMonth(), i - first + 1) : null));
  const upcoming = shown.filter((e) => new Date(e.starts_at).getTime() >= Date.now() - 36e5).slice(0, 8);
  const list = day ? byDay[day] || [] : upcoming;
  const canPost = !!auth.session && !!auth.profile && !auth.profile.banned;

  const submit = async () => {
    if (form.title.trim().length < 3 || !form.date) return setMsg("Completá al menos el título y la fecha.");
    setBusy(true); setMsg("");
    const starts = new Date(`${form.date}T${form.time || "09:00"}`);
    const ends = form.endTime ? new Date(`${form.date}T${form.endTime}`) : null;
    const { error: e } = await supabase.from("events").insert({ title: form.title.trim(), category: form.category, career: form.career || null, subject: form.subject.trim() || null, starts_at: starts.toISOString(), ends_at: ends ? ends.toISOString() : null, location: form.location.trim() || null, description: form.description.trim() || null });
    setBusy(false);
    if (e) return setMsg(e.message.includes("pendientes") ? e.message : "No se pudo guardar el evento.");
    setForm(blank); setShowForm(false);
    setMsg(isMod(auth.profile) ? "Evento publicado." : "Gracias. Un moderador lo va a revisar antes de que aparezca para todos.");
    load();
  };

  const mine = (e: Ev) => e.status !== "approved";
  return (
    <>
      <Title title="Calendario compartido" sub="Parciales, finales, inscripciones y eventos de las asociaciones. Cualquiera puede verlo; para sumar un evento necesitás ingresar, y un moderador lo aprueba antes de publicarlo." />
      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Filtrar por carrera" value={career} onChange={(e) => setCareer(e.target.value)} className="rounded-xl border border-[#C5D0E6] px-4 h-11 bg-white"><option value="">Todas las carreras</option>{CAREER_NAMES.map((c) => <option key={c}>{c}</option>)}</select>
        <select aria-label="Filtrar por tipo" value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl border border-[#C5D0E6] px-4 h-11 bg-white"><option value="">Todos los tipos</option>{Object.entries(CATS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select>
        <button onClick={() => (canPost ? setShowForm(!showForm) : login())} className={`${btn} ml-auto`}>{showForm ? "Cerrar" : "Agregar evento"}</button>
      </div>
      {msg && <p role="status" className="mt-3 text-sm text-slate-700">{msg}</p>}
      {showForm && (
        <div className={`${card} p-5 mt-4 grid gap-3 md:grid-cols-4`}>
          <div className="md:col-span-2"><label className="text-xs font-semibold" htmlFor="et">Título</label><input id="et" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={field} maxLength={120} /></div>
          <div><label className="text-xs font-semibold" htmlFor="ec">Tipo</label><select id="ec" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={field}>{Object.entries(CATS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label className="text-xs font-semibold" htmlFor="er">Carrera</label><select id="er" value={form.career} onChange={(e) => setForm({ ...form, career: e.target.value })} className={field}><option value="">Todas</option>{CAREER_NAMES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="text-xs font-semibold" htmlFor="ed">Fecha</label><input id="ed" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={field} /></div>
          <div><label className="text-xs font-semibold" htmlFor="eh">Hora</label><input id="eh" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={field} /></div>
          <div><label className="text-xs font-semibold" htmlFor="ef">Hasta (opcional)</label><input id="ef" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={field} /></div>
          <div><label className="text-xs font-semibold" htmlFor="el">Lugar (opcional)</label><input id="el" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={field} maxLength={120} /></div>
          <div className="md:col-span-2"><label className="text-xs font-semibold" htmlFor="es">Materia (opcional)</label><input id="es" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={field} maxLength={80} /></div>
          <div className="md:col-span-4"><label className="text-xs font-semibold" htmlFor="eds">Detalle (opcional)</label><textarea id="eds" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-[#C5D0E6] px-4 py-2 bg-white" rows={2} maxLength={1000} /></div>
          <div className="md:col-span-4"><button onClick={submit} disabled={busy} className={btn}>{busy ? "Guardando…" : "Enviar evento"}</button></div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mt-6 items-start">
        <div className={`${card} overflow-hidden`}>
          <div className="flex items-center justify-between px-4 py-3 bg-[#EEF2F9] border-b border-[#DCE3F0]">
            <button className={btn2} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Mes anterior">Anterior</button>
            <h2 className="font-bold capitalize">{month.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}</h2>
            <button className={btn2} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Mes siguiente">Siguiente</button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500 py-2">{["L", "M", "X", "J", "V", "S", "D"].map((d) => <div key={d}>{d}</div>)}</div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="h-16 border-t border-[#EEF2F9]" />;
              const k = key(d), es = byDay[k] || [];
              return (
                <button key={i} onClick={() => setDay(day === k ? null : k)} className={`h-16 border-t border-l border-[#EEF2F9] p-1 text-left align-top hover:bg-[#F7F9FD] ${day === k ? "bg-[#EEF2F9]" : ""}`}>
                  <span className={`text-xs font-semibold ${k === key(new Date()) ? "inline-grid place-items-center h-5 w-5 rounded-full bg-[#2B52A1] text-white" : ""}`}>{d.getDate()}</span>
                  <span className="flex gap-0.5 flex-wrap mt-1">{es.slice(0, 4).map((e) => <span key={e.id} className="h-2 w-2 rounded-full" style={{ background: CATS[e.category]?.[1] }} />)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3">{day ? fmtDay(`${day}T12:00:00`) : "Próximos eventos"}</h2>
          {loading ? <p className="text-slate-500 text-sm">Cargando…</p> : error ? <p role="alert" className="text-sm text-[#B3261E]">{error}</p> : list.length === 0 ? <div className={`${card} p-6 text-sm text-slate-500`}>No hay eventos {day ? "ese día" : "próximos"} con estos filtros.</div> : (
            <div className="space-y-3">
              {list.map((e) => (
                <article key={e.id} className={`${card} p-4 border-l-[6px]`} style={{ borderLeftColor: CATS[e.category]?.[1] }}>
                  <p className="text-xs font-semibold" style={{ color: CATS[e.category]?.[1] }}>{CATS[e.category]?.[0]}{mine(e) && <span className="ml-2 rounded bg-[#FFE98A] px-1.5 py-0.5 text-[#4A3A00]">{e.status === "pending" ? "Pendiente de aprobación" : "Rechazado"}</span>}</p>
                  <h3 className="font-bold mt-0.5">{e.title}</h3>
                  <p className="text-sm text-slate-600">{fmtDay(e.starts_at)}, {fmtTime(e.starts_at)}{e.ends_at && ` a ${fmtTime(e.ends_at)}`}{e.location && `. ${e.location}`}</p>
                  {(e.career || e.subject) && <p className="text-xs text-slate-500 mt-1">{[e.career, e.subject].filter(Boolean).join(", ")}</p>}
                  {e.description && <p className="text-sm mt-2">{e.description}</p>}
                  {e.status === "approved" && <div className="mt-2"><ReportButton type="event" id={e.id} auth={auth} login={login} /></div>}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
