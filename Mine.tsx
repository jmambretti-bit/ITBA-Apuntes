import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { Title, card, btn2 } from "./common";

type Sub = { id: string; subject: string; section: string; title: string; url: string; status: "pending" | "approved" | "rejected"; reject_reason: string | null; created_at: string };
const SEC: Record<string, string> = { Apuntes: "Apuntes", "Ex-1P": "Primer parcial", "Ex-2P": "Segundo parcial", "Ex-F": "Finales", Libros: "Libros y materiales", Hitos: "Hitos" };
const ST = { pending: ["En revisión", "#FFF4D6", "#4A3A00"], approved: ["Publicado", "#E3F4EA", "#12301f"], rejected: ["Rechazado", "#FDECEA", "#7A1C15"] } as const;

export default function Mine() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const load = async () => {
    const { data, error } = await supabase.from("file_submissions").select("id,subject,section,title,url,status,reject_reason,created_at").order("created_at", { ascending: false }).limit(200);
    if (error) setErr("No pudimos cargar tus envíos."); else setSubs((data as Sub[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const remove = async (id: string) => { await supabase.from("file_submissions").delete().eq("id", id); load(); };
  return (
    <>
      <Title title="Mis envíos" sub="El estado de los enlaces que mandaste. Los moderadores los revisan antes de publicarlos; si uno se rechaza, acá ves el motivo." />
      {loading ? <p className="text-slate-500 text-sm">Cargando…</p> : err ? <p role="alert" className="text-sm text-[#B3261E]">{err}</p> : subs.length === 0 ? <div className={`${card} p-6 text-sm text-slate-500`}>Todavía no enviaste ningún archivo. Podés hacerlo desde cualquier materia.</div> : (
        <div className="space-y-3">
          {subs.map((s) => { const [label, bg, fg] = ST[s.status]; return (
            <article key={s.id} className={`${card} p-4`}>
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <p className="text-xs font-semibold text-slate-500">{s.subject.replace(" (Ingreso)", "")}, {SEC[s.section] || s.section}</p>
                <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: bg, color: fg }}>{label}</span>
              </div>
              <h3 className="font-bold mt-1">{s.title}</h3>
              <a href={s.url} target="_blank" rel="noreferrer" className="text-sm text-[#2B52A1] underline break-all">{s.url}</a>
              {s.status === "rejected" && <p className="mt-2 text-sm"><span className="font-semibold">Motivo:</span> {s.reject_reason || "No se indicó un motivo."}</p>}
              {s.status === "pending" && <div className="mt-3"><button onClick={() => remove(s.id)} className={btn2}>Retirar envío</button></div>}
            </article>); })}
        </div>
      )}
    </>
  );
}
