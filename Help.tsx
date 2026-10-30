import { useCallback, useEffect, useState } from "react";
import { ALL } from "./data";
import { supabase } from "./supabase";
import { isMod, type Auth } from "./auth";
import { Title, card, btn, btn2, field, LoginPrompt, ReportButton } from "./common";

type Post = { id: string; kind: "ayudante" | "grupo"; subject: string; title: string; description: string | null; contact: string; modality: string; price: string | null; status: string; author_id: string; created_at: string };
const blank = { subject: "", title: "", description: "", contact: "", modality: "ambas", price: "" };

export default function Help({ auth, login }: { auth: Auth; login: () => void }) {
  const [kind, setKind] = useState<"ayudante" | "grupo">("ayudante");
  const [posts, setPosts] = useState<Post[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const uid = auth.session?.user.id;

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const { data, error: e } = await supabase.from("help_posts").select("*").order("created_at", { ascending: false }).limit(200);
    if (e) setError("No pudimos cargar las publicaciones."); else { setError(""); setPosts((data as Post[]) || []); }
    setLoading(false);
  }, [uid]);
  useEffect(() => { load(); }, [load]);

  if (auth.ready && !auth.session) return (<><Title title="Ayudantes y grupos de estudio" sub="Un lugar para encontrar ayuda en una materia o armar un grupo para estudiar. Solo para la comunidad ITBA." /><LoginPrompt login={login} text="Para ver y publicar necesitás ingresar con tu correo @itba.edu.ar." /></>);

  const publish = async () => {
    if (f.subject.trim().length < 2 || f.title.trim().length < 3 || f.contact.trim().length < 3) return setMsg("Completá materia, título y un medio de contacto.");
    setBusy(true); setMsg("");
    const { error: e } = await supabase.from("help_posts").insert({ kind, subject: f.subject.trim(), title: f.title.trim(), description: f.description.trim() || null, contact: f.contact.trim(), modality: f.modality, price: f.price.trim() || null });
    setBusy(false);
    if (e) return setMsg(e.message.includes("máximo") ? e.message : "No se pudo publicar.");
    setF(blank); setShow(false); setMsg("Publicado."); load();
  };
  const remove = async (id: string) => { await supabase.from("help_posts").delete().eq("id", id); load(); };
  const list = posts.filter((p) => p.kind === kind && (!q.trim() || `${p.subject} ${p.title}`.toLowerCase().includes(q.trim().toLowerCase())));

  return (
    <>
      <Title title="Ayudantes y grupos de estudio" sub="Encontrá ayuda en una materia o armá un grupo para preparar un parcial. Cuidá tus datos de contacto: lo que publiques lo ven todos los usuarios ITBA." />
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" className="flex rounded-xl border border-[#C5D0E6] overflow-hidden">
          {([["ayudante", "Ayudantes"], ["grupo", "Grupos de estudio"]] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={`px-5 h-11 text-sm font-semibold ${kind === k ? "bg-[#2B52A1] text-white" : "bg-white"}`}>{l}</button>)}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por materia o título" aria-label="Buscar" className="flex-1 min-w-[200px] rounded-xl border border-[#C5D0E6] px-4 h-11" />
        <button onClick={() => setShow(!show)} className={btn}>{show ? "Cerrar" : kind === "ayudante" ? "Ofrecer ayuda" : "Armar un grupo"}</button>
      </div>
      {msg && <p role="status" className="mt-3 text-sm text-slate-700">{msg}</p>}
      {show && (
        <div className={`${card} p-5 mt-4 grid gap-3 md:grid-cols-3`}>
          <div><label className="text-xs font-semibold" htmlFor="hs">Materia</label><input id="hs" list="hm" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} className={field} maxLength={80} /><datalist id="hm">{ALL.map((n) => <option key={n} value={n.replace(" (Ingreso)", "")} />)}</datalist></div>
          <div className="md:col-span-2"><label className="text-xs font-semibold" htmlFor="ht">Título</label><input id="ht" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={field} maxLength={120} placeholder={kind === "ayudante" ? "Clases de repaso para el primer parcial" : "Grupo para el segundo parcial"} /></div>
          <div><label className="text-xs font-semibold" htmlFor="hc">Contacto</label><input id="hc" value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} className={field} maxLength={120} placeholder="Correo o usuario" /></div>
          <div><label className="text-xs font-semibold" htmlFor="hmo">Modalidad</label><select id="hmo" value={f.modality} onChange={(e) => setF({ ...f, modality: e.target.value })} className={field}><option value="ambas">Presencial o virtual</option><option value="presencial">Presencial</option><option value="virtual">Virtual</option></select></div>
          {kind === "ayudante" && <div><label className="text-xs font-semibold" htmlFor="hp">Precio (opcional)</label><input id="hp" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} className={field} maxLength={60} /></div>}
          <div className="md:col-span-3"><label className="text-xs font-semibold" htmlFor="hd">Detalle (opcional)</label><textarea id="hd" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={3} maxLength={1000} className="w-full rounded-xl border border-[#C5D0E6] px-4 py-2 bg-white" /></div>
          <div className="md:col-span-3"><button onClick={publish} disabled={busy} className={btn}>{busy ? "Publicando…" : "Publicar"}</button></div>
        </div>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {loading ? <p className="text-sm text-slate-500">Cargando…</p> : error ? <p role="alert" className="text-sm text-[#B3261E]">{error}</p> : list.length === 0 ? <div className={`${card} p-6 text-sm text-slate-500 md:col-span-2`}>Todavía no hay publicaciones acá. Sé la primera persona en publicar.</div> : list.map((p) => (
          <article key={p.id} className={`${card} p-5`}>
            <p className="text-xs font-semibold text-[#2B52A1]">{p.subject}{p.status === "hidden" && <span className="ml-2 rounded bg-[#FFE98A] px-1.5 py-0.5 text-[#4A3A00]">Oculta</span>}</p>
            <h3 className="text-lg font-bold mt-1">{p.title}</h3>
            {p.description && <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">{p.description}</p>}
            <p className="text-sm mt-3"><span className="font-semibold">Contacto:</span> {p.contact}</p>
            <p className="text-xs text-slate-500 mt-1">{p.modality === "ambas" ? "Presencial o virtual" : p.modality === "virtual" ? "Virtual" : "Presencial"}{p.price && `, ${p.price}`}</p>
            <div className="mt-3 flex items-center gap-3">
              {p.author_id === uid || isMod(auth.profile) ? <button onClick={() => remove(p.id)} className={btn2}>Eliminar</button> : <ReportButton type="help_post" id={p.id} auth={auth} login={login} />}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
