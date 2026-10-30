import { useEffect, useMemo, useRef, useState } from "react";
import { norm, DRIVES, DRV, link, CAREERS, SEED, ASOC, ALL, COL, BLUE, NAVY, SECS, EXS } from "./data";
import type { Item } from "./data";
import { Doc, Search } from "./ui";
import { useAuth, AuthModal, Gate, isMod } from "./auth";
import { supabase } from "./supabase";
import Planner from "./Planner";
import Schedule from "./Schedule";
import CalendarView from "./CalendarView";
import Help from "./Help";
import Admin from "./Admin";

type Remote = { id: string; subject: string; section: string; title: string; url: string };
type View = "home" | "asoc" | "planner" | "calendar" | "schedule" | "help" | "admin";

export default function App() {
  const [car, setCar] = useState<string | null>(null);
  const [view, setView] = useState<View>("home");
  const [yr, setYr] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [sec, setSec] = useState("Apuntes");
  const [ex, setEx] = useState("1P");
  const [remote, setRemote] = useState<Remote[]>([]);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [fmsg, setFmsg] = useState("");
  const [t, setT] = useState("");
  const [u, setU] = useState("");
  const [pal, setPal] = useState(false);
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const inp = useRef<HTMLInputElement>(null);
  const auth = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const login = () => { setMenu(false); setAuthOpen(true); };
  const goTool = (v: View) => { setMenu(false); go(null, v); };

  const career = CAREERS.find((c) => c.name === car);
  const accent = (car && COL[car]) || BLUE;
  const isIng = !!sel && sel.endsWith("(Ingreso)");
  const disp = (n: string) => n.replace(" (Ingreso)", "");
  const eff = (k: string) => [...(SEED[k] || []).filter((i) => !removed.has(i.u)).map((i) => ({ t: i.t, u: i.u, id: null as string | null })), ...remote.filter((r) => `${r.subject}|${r.section}` === k).map((r) => ({ t: r.title, u: r.url, id: r.id as string | null }))];
  const fileCount = (n: string) => Object.keys(SEED).filter((k) => k.startsWith(n + "|")).reduce((a, k) => a + (SEED[k] || []).filter((i) => !removed.has(i.u)).length, 0) + remote.filter((r) => r.subject === n).length;
  const notes = (n: string) => eff(`${n}|Apuntes`).length > 0;
  const has = (n: string) => !!DRV[norm(n)];
  const total = Object.keys(SEED).reduce((a, k) => a + (SEED[k] || []).filter((i) => !removed.has(i.u)).length, 0) + remote.length;
  const top = useMemo(() => [...ALL].map((n) => [n, fileCount(n)] as const).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 6), [remote, removed]);
  const found = useMemo(() => (q.trim() ? ALL.filter((n) => norm(n).includes(norm(q))).slice(0, 10) : top.map((x) => x[0])), [q, top]);

  const key = sel ? `${sel}|${sec === "Ex" ? (isIng ? "Hitos" : "Ex-" + ex) : sec}` : "";
  const cur = eff(key);
  const mod = isMod(auth.profile);
  const section = sel ? (sec === "Ex" ? (isIng ? "Hitos" : "Ex-" + ex) : sec) : "";
  const loadFiles = async () => {
    const [f, r] = await Promise.all([supabase.from("file_submissions").select("id,subject,section,title,url").eq("status", "approved").order("created_at").limit(5000), supabase.from("file_removals").select("url").limit(5000)]);
    if (f.data) setRemote(f.data as Remote[]);
    if (r.data) setRemoved(new Set(r.data.map((x: { url: string }) => x.url)));
  };
  useEffect(() => { if (auth.session) loadFiles(); }, [auth.session?.user.id]);
  const add = async () => {
    if (t.trim().length < 3 || !/^https:\/\//.test(u.trim())) return setFmsg("Poné un título y un enlace que empiece con https://.");
    const { error } = await supabase.from("file_submissions").insert({ subject: sel, section, title: t.trim(), url: u.trim(), ...(mod ? { status: "approved" } : {}) });
    if (error) return setFmsg(error.code === "23505" ? "Ese enlace ya fue enviado para esta sección." : error.message.includes("pendientes") ? error.message : "No se pudo enviar el archivo.");
    setT(""); setU(""); setFmsg(mod ? "Publicado." : "Gracias. Un moderador lo va a revisar antes de publicarlo."); loadFiles();
  };
  const quitar = async (i: { u: string; id: string | null }) => {
    if (!window.confirm("¿Quitar este archivo de la página?")) return;
    const { error } = i.id ? await supabase.from("file_submissions").delete().eq("id", i.id) : await supabase.from("file_removals").insert({ url: i.u });
    setFmsg(error ? "No se pudo quitar el archivo." : "Archivo quitado."); loadFiles();
  };

  const go = (c: string | null, v: View = "home") => { setCar(c); setSel(null); setView(v); setYr(0); window.scrollTo(0, 0); };
  const open = (n: string, c?: string | null) => { if (c !== undefined) setCar(c); setView("home"); setSel(n); setSec("Apuntes"); setEx("1P"); setPal(false); setQ(""); window.scrollTo(0, 0); };
  const openPal = () => { setPal(true); setHi(0); setTimeout(() => inp.current?.focus(), 30); };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPal((p) => !p); setHi(0); setTimeout(() => inp.current?.focus(), 30); }
      if (e.key === "Escape") setPal(false);
    };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, []);

  const Row = ({ n }: { n: string }) => {
    const c = fileCount(n);
    return (
      <button onClick={() => open(n)} className="w-full flex items-center justify-between gap-3 text-left px-4 py-3 border-b border-[#DCE3F0] last:border-0 hover:bg-[#EEF2F9] focus-visible:bg-[#EEF2F9]">
        <span className="font-medium text-[15px] leading-snug">{disp(n)}</span>
        <span className={`shrink-0 text-xs ${notes(n) ? "text-[#2B52A1] font-semibold" : "text-slate-400"}`}>{notes(n) ? `${c} archivos` : "Sin apuntes subidos"}</span>
      </button>
    );
  };

  const nav = "px-3 py-2 text-[15px] font-medium text-slate-700 hover:text-[#2B52A1] rounded";

  if (!auth.ready) return <Gate loading />;
  if (!auth.session) return <Gate />;
  if (auth.profile?.banned) return <Gate banned />;

  return (
    <div className="min-h-screen bg-white text-[#1B2433]" style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="sticky top-0 z-30">
      <div role="note" className="bg-[#FFE98A] text-[#4A3A00] text-[13px] sm:text-sm text-center px-4 py-2 border-b border-[#E6CB5C]"><strong>Página no oficial.</strong> Hecha por estudiantes: no pertenece ni está avalada por el ITBA.</div>
      <header className="bg-white border-b border-[#DCE3F0]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-2">
          <button onClick={() => go(null)} className="flex items-center gap-3 mr-4" aria-label="Inicio">
            <span className="grid place-items-center h-9 px-2 text-white font-extrabold tracking-tight text-lg" style={{ background: BLUE, borderRadius: "10px 10px 10px 2px" }}>ITBA</span>
            <span className="hidden sm:block text-[15px] font-semibold text-slate-800">Apuntes</span>
          </button>
          <nav className="hidden md:flex items-center">
            <button className={nav} onClick={() => { go(null); setTimeout(() => document.getElementById("carreras")?.scrollIntoView({ behavior: "smooth" }), 50); }}>Carreras</button>
            <button className={nav} onClick={() => go("Ingreso")}>Ingreso</button>
          </nav>
          <div className="relative">
            <button onClick={() => setMenu(!menu)} aria-expanded={menu} className={nav}>Herramientas</button>
            {menu && (
              <div className="absolute left-0 top-12 w-72 rounded-2xl border border-[#DCE3F0] bg-white shadow-xl p-2 z-40">
                {([["planner", "Planificador de carrera"], ["calendar", "Calendario compartido"], ["schedule", "Armador de horarios"], ["help", "Ayudantes y grupos de estudio"], ["asoc", "Asociaciones estudiantiles"]] as [View, string][]).map(([v, l]) => <button key={v} onClick={() => goTool(v)} className="block w-full text-left rounded-xl px-3 py-2.5 text-[15px] hover:bg-[#EEF2F9]">{l}</button>)}
                <div className="md:hidden border-t border-[#DCE3F0] mt-1 pt-1"><button onClick={() => { setMenu(false); go(null); }} className="block w-full text-left rounded-xl px-3 py-2.5 hover:bg-[#EEF2F9]">Carreras</button><button onClick={() => { setMenu(false); go("Ingreso"); }} className="block w-full text-left rounded-xl px-3 py-2.5 hover:bg-[#EEF2F9]">Ingreso</button></div>
                {isMod(auth.profile) && <button onClick={() => goTool("admin")} className="block w-full text-left rounded-xl px-3 py-2.5 text-[15px] font-semibold text-[#2B52A1] hover:bg-[#EEF2F9] border-t border-[#DCE3F0] mt-1">Moderación</button>}
              </div>
            )}
          </div>
          <button onClick={openPal} className="ml-auto flex items-center gap-2 rounded-full border border-[#C5D0E6] px-4 h-10 text-sm text-slate-500 hover:border-[#2B52A1]">
            <Search /><span className="hidden sm:inline">Buscar materia</span><kbd className="hidden sm:inline rounded bg-[#EEF2F9] px-1.5 py-0.5 text-xs text-slate-500">Ctrl K</kbd>
          </button>
          {auth.session ? (
            <button onClick={() => supabase.auth.signOut()} title={auth.session.user.email || ""} className="rounded-full h-10 px-4 text-sm font-semibold border border-[#C5D0E6] hover:border-[#2B52A1]">Salir</button>
          ) : (
            <button onClick={login} className="rounded-full h-10 px-5 text-sm font-semibold text-white" style={{ background: BLUE }}>Ingresar</button>
          )}
        </div>
      </header>
      </div>

      {!car && !sel && view === "home" && (
        <section className="relative overflow-hidden text-white" style={{ background: BLUE }}>
          <div className="absolute -right-32 -top-32 w-[460px] h-[460px] rounded-full" style={{ background: NAVY }} />
          <div className="absolute right-24 bottom-[-120px] w-[260px] h-[260px] rounded-full border-[18px] border-white/10" />
          <div className="relative max-w-6xl mx-auto px-5 py-16 md:py-24">
            <h1 className="font-extrabold tracking-tight leading-[1.05] text-4xl md:text-6xl max-w-2xl">
              <span className="rise block" style={{ animationDelay: "0ms" }}>Encontrá los apuntes</span>
              <span className="rise inline-block mt-3 px-4 py-1 rounded-2xl" style={{ background: "#94C11F", color: NAVY, animationDelay: "120ms" }}>de tu materia</span>
            </h1>
            <p className="rise mt-6 text-lg text-white/85 max-w-xl" style={{ animationDelay: "240ms" }}>Apuntes, exámenes viejos y libros de cada carrera del ITBA, organizados por año y cuatrimestre.</p>
            <button onClick={openPal} className="rise mt-8 w-full max-w-xl flex items-center gap-3 rounded-full bg-white text-slate-500 px-6 h-14 text-left shadow-lg" style={{ animationDelay: "360ms" }}>
              <Search /><span className="flex-1">Buscar materia, por ejemplo Análisis Matemático II</span><kbd className="hidden sm:inline rounded bg-[#EEF2F9] px-2 py-1 text-xs">Ctrl K</kbd>
            </button>
            <p className="rise mt-5 text-sm text-white/75" style={{ animationDelay: "440ms" }}>{CAREERS.length - 1} carreras, {ALL.length} materias y {total} archivos cargados.</p>
            <div className="rise mt-6 max-w-xl rounded-2xl bg-white/10 border border-white/30 px-5 py-4 text-sm leading-relaxed" style={{ animationDelay: "520ms" }}><strong className="font-bold">Sitio no oficial.</strong> Lo armamos estudiantes para compartir apuntes. No tiene vínculo institucional con el ITBA ni está avalado por la universidad.</div>
          </div>
        </section>
      )}

      <main className="max-w-6xl mx-auto px-5 py-10">
        {view === "planner" ? (<Planner />) : view === "calendar" ? (<CalendarView auth={auth} login={login} />) : view === "schedule" ? (<Schedule />) : view === "help" ? (<Help auth={auth} login={login} />) : view === "admin" ? (<Admin auth={auth} />) : view === "asoc" && !car && !sel ? (<>
          <button onClick={() => go(null)} className="text-sm font-medium text-[#2B52A1] mb-4">Volver a los apuntes</button>
          <h1 className="text-4xl font-extrabold tracking-tight">Asociaciones estudiantiles</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">Organizaciones de estudiantes del ITBA con actividades educativas, culturales, solidarias y deportivas. Para sumarte, entrá a <a href="https://estudiantes.itba.edu.ar/asociaciones-estudiantiles/" target="_blank" rel="noreferrer" className="underline text-[#2B52A1]">estudiantes.itba.edu.ar</a> con tu cuenta ITBA.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {ASOC.map(([n, f, d]) => (
              <div key={n} className="rounded-2xl border border-[#DCE3F0] p-5 border-t-[6px]" style={{ borderTopColor: BLUE }}>
                <h2 className="text-xl font-bold">{n}</h2>
                <p className="text-sm font-medium text-[#2B52A1] mt-1">{f}</p>
                <p className="text-sm text-slate-600 mt-3">{d}</p>
              </div>
            ))}
          </div>
        </>) : sel ? (<>
          <nav className="text-sm text-slate-500 mb-5 flex flex-wrap gap-x-2">
            <button onClick={() => go(null)} className="hover:text-[#2B52A1]">Carreras</button><span>/</span>
            {career ? <button onClick={() => setSel(null)} className="hover:text-[#2B52A1]">{career.name}</button> : <span>Búsqueda</span>}<span>/</span>
            <span className="text-slate-800">{disp(sel)}</span>
          </nav>
          <div className="rounded-2xl p-6 md:p-8 bg-[#EEF2F9] border-l-[10px]" style={{ borderLeftColor: accent }}>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{disp(sel)}</h1>
            <p className="mt-2 text-slate-600 text-sm">{career ? career.name : "Materia"}{fileCount(sel) > 0 ? `, ${fileCount(sel)} archivos` : ""}</p>
            {has(sel) && <a href={link(DRV[norm(sel)][0])} target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs text-slate-500 underline">Ver carpeta original en Drive (parte del material aún no cargado)</a>}
          </div>
          <div role="tablist" className="flex gap-1 border-b border-[#DCE3F0] mt-8 overflow-x-auto">
            {SECS.map(([k, l]) => (
              <button key={k} role="tab" aria-selected={sec === k} onClick={() => setSec(k)} className={`px-5 py-3 text-[15px] font-semibold whitespace-nowrap border-b-[3px] -mb-px ${sec === k ? "border-[#2B52A1] text-[#2B52A1]" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{k === "Ex" && isIng ? "Hitos" : l}</button>
            ))}
          </div>
          {sec === "Ex" && !isIng && <div className="flex flex-wrap gap-2 mt-5">{EXS.map(([k, l]) => <button key={k} onClick={() => setEx(k)} className={`rounded-full px-4 py-1.5 text-sm font-medium border ${ex === k ? "bg-[#2B52A1] text-white border-[#2B52A1]" : "border-[#C5D0E6] hover:border-[#2B52A1]"}`}>{l}</button>)}</div>}
          <div className="mt-5 rounded-2xl border border-[#DCE3F0] overflow-hidden">
            {cur.length ? cur.map((i, n) => (
              <div key={n} className="flex items-center border-b border-[#DCE3F0] last:border-0 hover:bg-[#EEF2F9]">
                <a href={i.u} target="_blank" rel="noreferrer" className="flex flex-1 items-center gap-3 px-4 py-3 focus-visible:bg-[#EEF2F9]">
                  <span className="text-[#2B52A1]"><Doc /></span><span className="flex-1 text-[15px]">{i.t}</span>
                </a>
                {mod && <button onClick={() => quitar(i)} className="mr-3 rounded-lg px-3 h-8 text-xs font-semibold text-[#B3261E] border border-[#E6B8B4] bg-white">Quitar</button>}
              </div>
            )) : <div className="px-5 py-12 text-center"><p className="font-semibold text-slate-700">{sec === "Apuntes" ? "Sin apuntes subidos" : "Todavía no hay material en esta sección"}</p><p className="text-sm text-slate-500 mt-1">Sumá el primero con el formulario de abajo.</p></div>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <input value={t} onChange={(e) => setT(e.target.value)} placeholder="Título del archivo" className="flex-1 min-w-[160px] rounded-xl border border-[#C5D0E6] px-4 h-11" />
            <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Enlace (https://…)" className="flex-[2] min-w-[200px] rounded-xl border border-[#C5D0E6] px-4 h-11" />
            <button onClick={add} className="rounded-xl px-6 h-11 font-semibold text-white" style={{ background: BLUE }}>{mod ? "Publicar enlace" : "Enviar para revisión"}</button>
          </div>
          {fmsg && <p role="status" className="mt-2 text-sm text-slate-700">{fmsg}</p>}
          {!mod && <p className="mt-2 text-xs text-slate-500">Los enlaces los revisa un moderador antes de aparecer en la página.</p>}
        </>) : career ? (<>
          <button onClick={() => go(null)} className="text-sm font-medium text-[#2B52A1] mb-4">Todas las carreras</button>
          <div className="rounded-2xl p-6 md:p-8 bg-[#EEF2F9] border-l-[10px]" style={{ borderLeftColor: accent }}>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{career.name}</h1>
            <p className="mt-2 text-slate-600">{career.name === "Ingreso" ? `${career.years.flat(2).length} materias de ingreso` : `${career.years.length} años, ${career.years.flat(2).length} materias`}</p>
          </div>
          {career.name !== "Ingreso" && (
            <div role="tablist" className="flex gap-2 mt-8 overflow-x-auto pb-1">
              {career.years.map((_, i) => <button key={i} role="tab" aria-selected={yr === i} onClick={() => setYr(i)} className={`rounded-full px-5 py-2 text-[15px] font-semibold whitespace-nowrap border ${yr === i ? "text-white border-transparent" : "border-[#C5D0E6] hover:border-[#2B52A1]"}`} style={yr === i ? { background: BLUE } : {}}>{i + 1}.º año</button>)}
            </div>
          )}
          <div className={`mt-6 grid gap-5 ${career.name === "Ingreso" ? "max-w-xl" : "md:grid-cols-2"}`}>
            {(career.name === "Ingreso" ? [career.years[0][0]] : career.years[yr]).map((ys, j) => (
              <section key={j} className="rounded-2xl border border-[#DCE3F0] overflow-hidden self-start">
                <h2 className="px-4 py-3 font-bold bg-[#EEF2F9] border-b border-[#DCE3F0]">{career.name === "Ingreso" ? "Materias de ingreso" : `${j + 1}.${j === 0 ? "er" : "º"} cuatrimestre`}</h2>
                {ys.length ? ys.map((n) => <Row key={n} n={n} />) : <p className="px-4 py-6 text-sm text-slate-400">Sin materias obligatorias en este cuatrimestre.</p>}
              </section>
            ))}
          </div>
        </>) : (<>
          <section id="carreras" className="scroll-mt-24">
            <h2 className="text-3xl font-extrabold tracking-tight">Elegí tu carrera</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {CAREERS.map((c) => (
                <button key={c.name} onClick={() => go(c.name)} className="group text-left rounded-2xl border border-[#DCE3F0] p-5 border-l-[8px] hover:shadow-md focus-visible:shadow-md bg-white" style={{ borderLeftColor: COL[c.name] }}>
                  <span className="block text-lg font-bold leading-snug">{c.name}</span>
                  <span className="block text-sm text-slate-500 mt-1">{c.name === "Ingreso" ? "Matemática, Física, Química y más" : `${c.years.length} años, ${c.years.flat(2).length} materias`}</span>
                  <span className="block text-xs text-slate-500 mt-3">{c.years.flat(2).filter(notes).length} con apuntes</span>
                </button>
              ))}
            </div>
          </section>
          {top.length > 0 && (
            <section className="mt-14">
              <h2 className="text-3xl font-extrabold tracking-tight">Materias con más material</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {top.map(([n, c]) => (
                  <button key={n} onClick={() => open(n, null)} className="flex items-center justify-between gap-3 text-left rounded-2xl bg-[#EEF2F9] px-5 py-4 hover:bg-[#E1E8F5]">
                    <span className="font-semibold">{disp(n)}</span><span className="text-sm font-bold text-[#2B52A1] whitespace-nowrap">{c} archivos</span>
                  </button>
                ))}
              </div>
            </section>
          )}
          <section className="mt-14">
            <h2 className="text-3xl font-extrabold tracking-tight">Herramientas para la comunidad</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {([["planner", "Planificador de carrera", "Marcá tus materias aprobadas y mirá cuánto te falta."], ["calendar", "Calendario compartido", "Parciales, finales, inscripciones y eventos."], ["schedule", "Armador de horarios", "Probá combinaciones de comisiones sin superposiciones."], ["help", "Ayudantes y grupos", "Encontrá ayuda en una materia o armá un grupo de estudio."]] as [View, string, string][]).map(([v, t, d]) => (
                <button key={v} onClick={() => goTool(v)} className="text-left rounded-2xl border border-[#DCE3F0] p-5 hover:shadow-md focus-visible:shadow-md bg-white border-t-[6px]" style={{ borderTopColor: BLUE }}>
                  <span className="block text-lg font-bold leading-snug">{t}</span><span className="block text-sm text-slate-600 mt-2">{d}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="mt-14 rounded-3xl p-8 md:p-10 text-white flex flex-wrap items-center justify-between gap-4" style={{ background: NAVY }}>
            <div className="max-w-xl"><h2 className="text-2xl font-extrabold">Asociaciones estudiantiles</h2><p className="mt-2 text-white/80">Conocé las organizaciones de estudiantes del ITBA y sumate a la que más te interese.</p></div>
            <button onClick={() => go(null, "asoc")} className="rounded-full px-6 h-12 font-semibold" style={{ background: "#94C11F", color: NAVY }}>Ver asociaciones</button>
          </section>
        </>)}
      </main>

      <footer className="mt-10 text-white" style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-5 py-10 grid gap-8 md:grid-cols-3">
          <div><span className="inline-grid place-items-center h-9 px-2 font-extrabold text-lg bg-white" style={{ color: BLUE, borderRadius: "10px 10px 10px 2px" }}>ITBA</span><p className="mt-3 text-sm text-white/70 max-w-xs">Sitio no oficial hecho por estudiantes, sin vínculo institucional con el ITBA. Los nombres y marcas pertenecen a sus titulares.</p></div>
          <div><h3 className="font-bold mb-3">Navegar</h3><div className="flex flex-col gap-2 text-sm text-white/80 items-start"><button onClick={() => go(null)}>Carreras</button><button onClick={() => go("Ingreso")}>Ingreso</button><button onClick={() => go(null, "planner")}>Planificador de carrera</button><button onClick={() => go(null, "calendar")}>Calendario compartido</button><button onClick={() => go(null, "schedule")}>Armador de horarios</button><button onClick={() => go(null, "help")}>Ayudantes y grupos</button><button onClick={() => go(null, "asoc")}>Asociaciones estudiantiles</button></div></div>
          <div><h3 className="font-bold mb-3">Carpetas de Drive</h3><div className="flex flex-wrap gap-2">{DRIVES.map(([n, h]) => <a key={h} href={h} target="_blank" rel="noreferrer" className="rounded-full border border-white/30 px-4 py-1.5 text-sm hover:bg-white/10">{n}</a>)}</div></div>
        </div>
      </footer>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {pal && (
        <div className="fixed inset-0 z-50 bg-[#0B2A6B]/60 grid place-items-start justify-items-center pt-[12vh] px-4" onClick={() => setPal(false)}>
          <div role="dialog" aria-label="Buscar materia" className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5 h-14 border-b border-[#DCE3F0]"><Search />
              <input ref={inp} value={q} onChange={(e) => { setQ(e.target.value); setHi(0); }} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, found.length - 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); } if (e.key === "Enter" && found[hi]) open(found[hi], null); }} placeholder="Buscar materia" className="flex-1 outline-none text-base" />
              <button onClick={() => setPal(false)} className="text-xs text-slate-500 rounded bg-[#EEF2F9] px-2 py-1">Esc</button>
            </div>
            <p className="px-5 pt-3 text-xs font-semibold text-slate-500">{q.trim() ? `${found.length} resultados` : "Materias con más material"}</p>
            <div className="p-2 max-h-[50vh] overflow-y-auto">
              {found.map((n, i) => (
                <button key={n} onMouseEnter={() => setHi(i)} onClick={() => open(n, null)} className={`w-full flex items-center justify-between gap-3 text-left rounded-xl px-3 py-2.5 ${i === hi ? "bg-[#EEF2F9]" : ""}`}>
                  <span className="font-medium">{disp(n)}</span><span className="text-xs text-slate-500">{notes(n) ? `${fileCount(n)} archivos` : "Sin apuntes subidos"}</span>
                </button>
              ))}
              {!found.length && <p className="px-3 py-8 text-center text-sm text-slate-500">No hay materias con ese nombre. Probá con otra palabra.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
