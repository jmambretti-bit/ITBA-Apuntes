import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { isMod, type Auth, type Profile } from "./auth";
import { Title, card, btn2, field } from "./common";
import type { Ev } from "./CalendarView";

type Rep = { id: string; target_type: "help_post" | "event"; target_id: string; reason: string; created_at: string };
type FileSub = { id: string; subject: string; section: string; title: string; url: string; created_at: string };
type Tgt = { id: string; title: string; subject?: string | null; contact?: string; status: string };

export default function Admin({ auth }: { auth: Auth }) {
  const [tab, setTab] = useState<"files" | "events" | "reports" | "users">("files");
  const [pending, setPending] = useState<Ev[]>([]);
  const [reports, setReports] = useState<Rep[]>([]);
  const [targets, setTargets] = useState<Record<string, Tgt>>({});
  const [users, setUsers] = useState<Profile[]>([]);
  const [files, setFiles] = useState<FileSub[]>([]);
  const [gone, setGone] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const admin = auth.profile?.role === "admin";

  const load = useCallback(async () => {
    const [fl, rm] = await Promise.all([supabase.from("file_submissions").select("*").eq("status", "pending").order("created_at"), supabase.from("file_removals").select("url").order("created_at", { ascending: false })]);
    setFiles((fl.data as FileSub[]) || []); setGone(((rm.data as { url: string }[]) || []).map((x) => x.url));
    const [e, r, u] = await Promise.all([
      supabase.from("events").select("*").eq("status", "pending").order("created_at"),
      supabase.from("reports").select("*").eq("status", "open").order("created_at"),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(300),
    ]);
    setPending((e.data as Ev[]) || []); setUsers((u.data as Profile[]) || []);
    const reps = (r.data as Rep[]) || []; setReports(reps);
    const t: Record<string, Tgt> = {};
    const hid = reps.filter((x) => x.target_type === "help_post").map((x) => x.target_id);
    const eid = reps.filter((x) => x.target_type === "event").map((x) => x.target_id);
    if (hid.length) (await supabase.from("help_posts").select("id,title,subject,contact,status").in("id", hid)).data?.forEach((x) => (t[x.id] = x as Tgt));
    if (eid.length) (await supabase.from("events").select("id,title,subject,status").in("id", eid)).data?.forEach((x) => (t[x.id] = x as Tgt));
    setTargets(t);
  }, []);
  useEffect(() => { if (isMod(auth.profile)) load(); }, [auth.profile, load]);

  if (!isMod(auth.profile)) return (<><Title title="Moderación" /><div className={`${card} p-6 text-slate-600`}>Esta sección es solo para moderadores.</div></>);
  const run = async (p: PromiseLike<{ error: { message: string } | null }>, ok: string) => { const { error } = await p; setMsg(error ? error.message : ok); load(); };

  const setEvent = (id: string, status: string) => run(supabase.from("events").update({ status }).eq("id", id), status === "approved" ? "Evento aprobado." : "Evento rechazado.");
  const resolve = (id: string) => supabase.from("reports").update({ status: "resolved" }).eq("id", id);
  const act = async (r: Rep, what: "hide" | "restore" | "delete" | "dismiss") => {
    if (what === "dismiss") return run(resolve(r.id), "Reporte descartado.");
    if (r.target_type === "help_post") {
      if (what === "delete") await supabase.from("help_posts").delete().eq("id", r.target_id);
      else await supabase.from("help_posts").update({ status: what === "hide" ? "hidden" : "visible" }).eq("id", r.target_id);
    } else if (what === "delete") await supabase.from("events").delete().eq("id", r.target_id);
    else await supabase.from("events").update({ status: what === "hide" ? "rejected" : "approved" }).eq("id", r.target_id);
    if (what !== "restore") await resolve(r.id);
    setMsg("Listo."); load();
  };
  const setFile = (id: string, status: string) => run(supabase.from("file_submissions").update({ status }).eq("id", id), status === "approved" ? "Archivo aprobado." : "Archivo rechazado.");
  const restore = (url: string) => run(supabase.from("file_removals").delete().eq("url", url), "Archivo restaurado.");
  const filtered = users.filter((u) => u.email.includes(q.trim().toLowerCase()));
  const tabs = [["files", `Archivos pendientes (${files.length})`], ["events", `Eventos pendientes (${pending.length})`], ["reports", `Reportes (${reports.length})`], ["users", "Usuarios"]] as const;

  return (
    <>
      <Title title="Moderación" sub="Aprobá eventos, revisá reportes y administrá usuarios de la comunidad." />
      <div role="tablist" className="flex gap-1 border-b border-[#DCE3F0] overflow-x-auto">{tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`px-5 py-3 text-[15px] font-semibold whitespace-nowrap border-b-[3px] -mb-px ${tab === k ? "border-[#2B52A1] text-[#2B52A1]" : "border-transparent text-slate-500"}`}>{l}</button>)}</div>
      {msg && <p role="status" className="mt-3 text-sm text-slate-700">{msg}</p>}
      <div className="mt-5 space-y-3">
        {tab === "files" && (<>
          {files.length === 0 ? <div className={`${card} p-6 text-sm text-slate-500`}>No hay archivos pendientes de revisión.</div> : files.map((f) => (
            <article key={f.id} className={`${card} p-4`}>
              <p className="text-xs font-semibold text-slate-500">{f.subject}, {f.section}</p>
              <h3 className="font-bold">{f.title}</h3>
              <a href={f.url} target="_blank" rel="noreferrer" className="text-sm text-[#2B52A1] underline break-all">{f.url}</a>
              <div className="mt-3 flex gap-2"><button onClick={() => setFile(f.id, "approved")} className="rounded-xl px-4 h-10 text-sm font-semibold text-white bg-[#00814A]">Aprobar</button><button onClick={() => setFile(f.id, "rejected")} className={btn2}>Rechazar</button></div>
            </article>
          ))}
          {gone.length > 0 && (
            <div className={`${card} p-4`}>
              <h3 className="font-bold">Archivos quitados de la página</h3>
              <p className="text-xs text-slate-500">Los archivos que cargó un usuario y se quitaron se eliminan; acá aparecen los que ya venían con la página y se ocultaron.</p>
              {gone.map((u) => <div key={u} className="flex items-center gap-3 mt-2"><span className="flex-1 text-xs break-all text-slate-600">{u}</span><button onClick={() => restore(u)} className={btn2}>Restaurar</button></div>)}
            </div>
          )}
        </>)}
        {tab === "events" && (pending.length === 0 ? <div className={`${card} p-6 text-sm text-slate-500`}>No hay eventos pendientes.</div> : pending.map((e) => (
          <article key={e.id} className={`${card} p-4`}>
            <h3 className="font-bold">{e.title}</h3>
            <p className="text-sm text-slate-600">{new Date(e.starts_at).toLocaleString("es-AR")}{e.location && `, ${e.location}`}{e.career && `. ${e.career}`}{e.subject && `, ${e.subject}`}</p>
            {e.description && <p className="text-sm mt-1">{e.description}</p>}
            <div className="mt-3 flex gap-2"><button onClick={() => setEvent(e.id, "approved")} className="rounded-xl px-4 h-10 text-sm font-semibold text-white bg-[#00814A]">Aprobar</button><button onClick={() => setEvent(e.id, "rejected")} className={btn2}>Rechazar</button></div>
          </article>
        )))}
        {tab === "reports" && (reports.length === 0 ? <div className={`${card} p-6 text-sm text-slate-500`}>No hay reportes abiertos.</div> : reports.map((r) => {
          const t = targets[r.target_id];
          return (
            <article key={r.id} className={`${card} p-4`}>
              <p className="text-xs font-semibold text-slate-500">{r.target_type === "help_post" ? "Publicación" : "Evento"}{t && ` (${t.status})`}</p>
              <h3 className="font-bold">{t ? t.title : "Contenido eliminado"}</h3>
              {t?.subject && <p className="text-sm text-slate-600">{t.subject}{t.contact && `, contacto: ${t.contact}`}</p>}
              <p className="text-sm mt-2"><span className="font-semibold">Motivo:</span> {r.reason}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => act(r, "hide")} className={btn2}>{r.target_type === "event" ? "Rechazar" : "Ocultar"}</button>
                <button onClick={() => act(r, "restore")} className={btn2}>Restaurar</button>
                <button onClick={() => act(r, "delete")} className="rounded-xl px-4 h-10 text-sm font-semibold text-white bg-[#B3261E]">Eliminar</button>
                <button onClick={() => act(r, "dismiss")} className={btn2}>Descartar reporte</button>
              </div>
            </article>
          );
        }))}
        {tab === "users" && (<>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por correo" aria-label="Buscar usuario" className={field} />
          <div className={`${card} overflow-hidden`}>
            {filtered.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[#DCE3F0] last:border-0">
                <span className="flex-1 min-w-[200px] text-sm"><strong>{u.email}</strong>{u.banned && <span className="ml-2 rounded bg-[#FDECEA] px-1.5 py-0.5 text-xs text-[#7A1C15]">Suspendido</span>}</span>
                {admin ? (
                  <select aria-label={`Rol de ${u.email}`} value={u.role} onChange={(e) => run(supabase.rpc("admin_set_role", { target: u.id, new_role: e.target.value }), "Rol actualizado.")} className="rounded-lg border border-[#C5D0E6] px-2 h-9 text-sm bg-white"><option value="user">Usuario</option><option value="moderator">Moderador</option><option value="admin">Administrador</option></select>
                ) : <span className="text-sm text-slate-500">{u.role}</span>}
                {u.id !== auth.profile?.id && <button onClick={() => run(supabase.rpc("mod_set_banned", { target: u.id, flag: !u.banned }), u.banned ? "Usuario reactivado." : "Usuario suspendido.")} className={btn2}>{u.banned ? "Reactivar" : "Suspender"}</button>}
              </div>
            ))}
          </div>
        </>)}
      </div>
    </>
  );
}
