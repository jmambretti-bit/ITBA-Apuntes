import { useMemo, useState } from "react";
import correl from "./correl.json";
import { ALL, COL, norm } from "./data";
import { ls } from "./store";
import { Title, card, btn2 } from "./common";

type S = { c: string; n: string; s: number; k: number; r?: number; p?: string[]; g?: string };
type Plan = { plan: string; credits: number; subjects: S[] };
type St = "ok" | "cur";
type Kind = "ok" | "cur" | "av" | "lock";
const DATA = correl as unknown as Record<string, Plan>;
const NAMES = Object.keys(DATA);
const KIND_LABEL: Record<Kind, string> = { ok: "Aprobada", cur: "Cursando", av: "Habilitada", lock: "Bloqueada" };
const yearOf = (s: number) => Math.ceil(s / 2);

export default function Planner({ open }: { open: (name: string) => void }) {
  const [name, setName] = useState<string>(() => { const v = ls.get("itba.plan.career", NAMES[0]); return DATA[v] ? v : NAMES[0]; });
  const [all, setAll] = useState<Record<string, Record<string, St>>>(() => ls.get("itba.plan.status", {}));
  const [view, setView] = useState<"map" | "now" | "elec">("map");
  const [focus, setFocus] = useState<string | null>(null);
  const [onlyAv, setOnlyAv] = useState(false);
  const [q, setQ] = useState("");

  const plan = DATA[name];
  const st = all[name] || {};
  const subs = plan.subjects;
  const by = useMemo(() => Object.fromEntries(subs.map((s) => [s.c, s])), [subs]);
  const mand = useMemo(() => subs.filter((s) => !s.g), [subs]);
  const elec = useMemo(() => subs.filter((s) => !!s.g), [subs]);
  const kids = useMemo(() => { const m: Record<string, S[]> = {}; subs.forEach((s) => (s.p || []).forEach((p) => (m[p] ||= []).push(s))); return m; }, [subs]);
  const okCr = subs.reduce((a, s) => a + (st[s.c] === "ok" ? s.k : 0), 0);
  const curCr = subs.reduce((a, s) => a + (st[s.c] === "cur" ? s.k : 0), 0);
  const pct = Math.min(100, Math.round((okCr / plan.credits) * 100));

  const missing = (s: S) => ({ parents: (s.p || []).filter((p) => st[p] !== "ok").map((p) => by[p]).filter(Boolean), credits: s.r && okCr < s.r ? s.r - okCr : 0 });
  const kind = (s: S): Kind => { if (st[s.c]) return st[s.c] as Kind; const m = missing(s); return m.parents.length === 0 && m.credits === 0 ? "av" : "lock"; };
  const chain = (c: string, dir: "up" | "down") => { const seen = new Set<string>(); const go = (x: string) => { (dir === "up" ? by[x]?.p || [] : (kids[x] || []).map((k) => k.c)).forEach((y) => { if (!seen.has(y)) { seen.add(y); go(y); } }); }; go(c); return [...seen].map((x) => by[x]).filter(Boolean); };

  const save = (n: Record<string, Record<string, St>>) => { setAll(n); ls.set("itba.plan.status", n); };
  const setStatus = (c: string, v: St | null) => { const cur = { ...st }; if (v) cur[c] = v; else delete cur[c]; save({ ...all, [name]: cur }); };
  const toggleOk = (c: string) => setStatus(c, st[c] === "ok" ? null : "ok");
  const pick = (n: string) => { setName(n); ls.set("itba.plan.career", n); setFocus(null); };
  const catalog = (n: string) => ALL.find((x) => norm(x) === norm(n));
  const color = COL[name] || "#2B52A1";

  const sems = useMemo(() => { const m: Record<number, S[]> = {}; mand.forEach((s) => (m[s.s] ||= []).push(s)); return Object.entries(m).sort((a, b) => Number(a[0]) - Number(b[0])); }, [mand]);
  const f = focus ? by[focus] : null;
  const fUp = f ? new Set(f.p || []) : new Set<string>();
  const fDown = f ? new Set((kids[f.c] || []).map((k) => k.c)) : new Set<string>();
  const now = mand.filter((s) => kind(s) === "av");
  const almost = mand.filter((s) => kind(s) === "lock" && missing(s).parents.length + (missing(s).credits ? 1 : 0) === 1);
  const doing = subs.filter((s) => st[s.c] === "cur");
  const mandOk = mand.filter((s) => st[s.c] === "ok").length;

  const Tile = ({ s }: { s: S }) => {
    const k = kind(s);
    const rel = f ? (s.c === f.c ? "rel-self" : fUp.has(s.c) ? "rel-parent" : fDown.has(s.c) ? "rel-child" : "dim") : onlyAv && k !== "av" ? "dim" : "";
    return (
      <div className={`pl pl-${k} ${rel} flex items-start gap-2 rounded-xl border-2 px-3 py-2`}>
        <button onClick={() => setFocus(focus === s.c ? null : s.c)} className="flex-1 text-left" aria-pressed={focus === s.c}>
          <span className="block text-[13px] font-semibold leading-snug">{s.n}</span>
          <span className="block text-[11px] opacity-75 mt-0.5">{s.c} · {s.k} cr.{s.r ? ` · req. ${s.r} cr.` : ""}</span>
        </button>
        <input type="checkbox" checked={st[s.c] === "ok"} onChange={() => toggleOk(s.c)} aria-label={`Aprobada: ${s.n}`} className="mt-1 h-5 w-5 accent-[#2E9E5B]" />
      </div>
    );
  };

  const tabs = [["map", "Mapa de correlativas"], ["now", "Qué puedo cursar"], ["elec", `Electivas (${elec.length})`]] as const;
  return (
    <>
      <Title title="Planificador de carrera" sub="Marcá lo que aprobaste y mirá qué materias te habilita, qué te falta y cómo se encadenan las correlativas. Se guarda en este navegador; no hace falta cuenta." />
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold" htmlFor="pc">Carrera</label>
        <select id="pc" value={name} onChange={(e) => pick(e.target.value)} className="rounded-xl border border-[#C5D0E6] px-4 h-11 bg-white">{NAMES.map((n) => <option key={n}>{n}</option>)}</select>
        <span className="text-sm text-slate-500">Plan {plan.plan}</span>
        <button onClick={() => { if (window.confirm("¿Borrar todo el avance de esta carrera?")) save({ ...all, [name]: {} }); }} className={`${btn2} ml-auto`}>Reiniciar</button>
      </div>

      <div className={`${card} p-5 mt-5 border-l-[10px]`} style={{ borderLeftColor: color }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-4xl font-extrabold">{pct}%</p><p className="text-sm text-slate-600">{okCr} de {plan.credits} créditos aprobados, te faltan {Math.max(0, plan.credits - okCr)}</p></div>
          <div className="text-sm text-slate-600 text-right"><p>{mandOk} de {mand.length} materias obligatorias aprobadas</p><p>Cursando: {doing.length} {doing.length === 1 ? "materia" : "materias"} ({curCr} créditos)</p></div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-[#EEF2F9] overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Avance de la carrera"><div className="h-full rounded-full bg-[#2B52A1]" style={{ width: `${pct}%` }} /></div>
        {name === "Ing. Mecánica" && <p className="mt-3 text-xs text-slate-500">Para Mecánica se muestran solo las materias comunes; el resto del plan depende de la concentración que elijas.</p>}
      </div>

      <div role="tablist" className="flex gap-1 border-b border-[#DCE3F0] mt-6 overflow-x-auto">
        {tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={view === k} onClick={() => setView(k)} className={`px-5 py-3 text-[15px] font-semibold whitespace-nowrap border-b-[3px] -mb-px ${view === k ? "border-[#2B52A1] text-[#2B52A1]" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{l}</button>)}
      </div>

      {view === "map" && (<>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs">
          {(["ok", "cur", "av", "lock"] as Kind[]).map((k) => <span key={k} className="flex items-center gap-1.5"><span className={`pl pl-${k} inline-block h-4 w-4 rounded border-2`} />{KIND_LABEL[k]}</span>)}
          <span className="flex items-center gap-1.5"><span className="inline-block h-4 w-4 rounded rel-parent bg-white" />Correlativa previa</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-4 w-4 rounded rel-child bg-white" />Habilita</span>
          <label className="ml-auto flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyAv} onChange={() => setOnlyAv(!onlyAv)} className="h-4 w-4 accent-[#2B52A1]" />Resaltar solo habilitadas</label>
        </div>
        <p className="mt-2 text-sm text-slate-500">Tocá una materia para ver sus correlativas. La casilla de la derecha la marca como aprobada.</p>
        <div className="mt-4 overflow-x-auto pb-3">
          <div className="flex gap-3 min-w-max">
            {sems.map(([sem, list]) => (
              <section key={sem} className="w-[210px] shrink-0">
                <h3 className="text-xs font-bold mb-2 px-1">{yearOf(Number(sem))}.º año, cuatrimestre {Number(sem) % 2 ? 1 : 2}</h3>
                <div className="space-y-2">{list.map((s) => <Tile key={s.c} s={s} />)}</div>
              </section>
            ))}
          </div>
        </div>
        {f ? (
          <div className={`${card} p-5 mt-3`} role="region" aria-label={`Detalle de ${f.n}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-xl font-bold">{f.n}</h2><p className="text-sm text-slate-500">{f.c} · {f.k} créditos{f.s ? ` · ${yearOf(f.s)}.º año, cuatrimestre ${f.s % 2 ? 1 : 2}` : ""}{f.g ? ` · ${f.g}` : ""}</p></div>
              <div className="flex gap-2">{([["Sin cursar", null], ["Cursando", "cur"], ["Aprobada", "ok"]] as [string, St | null][]).map(([l, v]) => <button key={l} onClick={() => setStatus(f.c, v)} aria-pressed={(st[f.c] || null) === v} className={`rounded-xl px-3 h-9 text-sm font-semibold border ${(st[f.c] || null) === v ? "bg-[#2B52A1] text-white border-[#2B52A1]" : "border-[#C5D0E6] bg-white"}`}>{l}</button>)}</div>
            </div>
            <div className="grid md:grid-cols-3 gap-5 mt-4 text-sm">
              <div>
                <h3 className="font-bold mb-1">Para cursarla necesitás</h3>
                {(f.p || []).length === 0 && !f.r ? <p className="text-slate-500">Nada: no tiene correlativas.</p> : (<ul className="space-y-1">
                  {(f.p || []).map((p) => by[p] && <li key={p}><button onClick={() => setFocus(p)} className="underline text-left">{by[p].n}</button> <span className={st[p] === "ok" ? "text-[#2E9E5B] font-semibold" : "text-[#B3261E] font-semibold"}>{st[p] === "ok" ? "(aprobada)" : "(falta)"}</span></li>)}
                  {f.r ? <li>{f.r} créditos aprobados <span className={okCr >= f.r ? "text-[#2E9E5B] font-semibold" : "text-[#B3261E] font-semibold"}>{okCr >= f.r ? "(los tenés)" : `(te faltan ${f.r - okCr})`}</span></li> : null}
                </ul>)}
              </div>
              <div>
                <h3 className="font-bold mb-1">Te habilita</h3>
                {(kids[f.c] || []).length === 0 ? <p className="text-slate-500">No es correlativa de ninguna otra.</p> : <ul className="space-y-1">{(kids[f.c] || []).map((k) => <li key={k.c}><button onClick={() => setFocus(k.c)} className="underline text-left">{k.n}</button></li>)}</ul>}
              </div>
              <div>
                <h3 className="font-bold mb-1">En cadena</h3>
                <p className="text-slate-600">Depende de {chain(f.c, "up").length} {chain(f.c, "up").length === 1 ? "materia" : "materias"} previas y de ella dependen {chain(f.c, "down").length} más.</p>
                {chain(f.c, "up").length > 0 && <p className="text-xs text-slate-500 mt-2">Previas: {chain(f.c, "up").map((x) => x.n).join(", ")}.</p>}
                {catalog(f.n) && <button onClick={() => open(catalog(f.n) as string)} className={`${btn2} mt-3`}>Ver apuntes de esta materia</button>}
              </div>
            </div>
          </div>
        ) : null}
      </>)}

      {view === "now" && (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="text-lg font-bold mb-2">Podés cursar ahora ({now.length})</h2>
            {now.length === 0 ? <div className={`${card} p-5 text-sm text-slate-500`}>Marcá las materias aprobadas para ver cuáles quedan habilitadas.</div> : (
              <div className={`${card} overflow-hidden`}>{now.map((s) => (
                <div key={s.c} className="flex items-center gap-3 px-4 py-3 border-b border-[#DCE3F0] last:border-0">
                  <span className="flex-1"><span className="font-medium">{s.n}</span><span className="block text-xs text-slate-500">{yearOf(s.s)}.º año, cuatrimestre {s.s % 2 ? 1 : 2} · {s.k} cr.</span></span>
                  <button onClick={() => setStatus(s.c, "cur")} className={btn2}>Estoy cursando</button>
                </div>))}</div>)}
          </section>
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-bold mb-2">Cursando ({doing.length})</h2>
              {doing.length === 0 ? <div className={`${card} p-5 text-sm text-slate-500`}>No marcaste ninguna materia como cursando.</div> : <div className={`${card} overflow-hidden`}>{doing.map((s) => <div key={s.c} className="flex items-center gap-3 px-4 py-3 border-b border-[#DCE3F0] last:border-0"><span className="flex-1">{s.n} <span className="text-xs text-slate-500">· {s.k} cr.</span></span><button onClick={() => setStatus(s.c, "ok")} className={btn2}>Aprobada</button><button onClick={() => setStatus(s.c, null)} className="text-sm text-slate-500 underline">Quitar</button></div>)}</div>}
            </section>
            <section>
              <h2 className="text-lg font-bold mb-2">Casi habilitadas ({almost.length})</h2>
              <p className="text-sm text-slate-500 mb-2">Les falta una sola cosa.</p>
              <div className={`${card} overflow-hidden`}>{almost.slice(0, 12).map((s) => { const m = missing(s); return <div key={s.c} className="px-4 py-3 border-b border-[#DCE3F0] last:border-0"><span className="font-medium">{s.n}</span><span className="block text-xs text-slate-500">Falta: {m.parents[0] ? m.parents[0].n : `${m.credits} créditos más`}</span></div>; })}{almost.length === 0 && <p className="px-4 py-4 text-sm text-slate-500">Nada por ahora.</p>}</div>
            </section>
          </div>
        </div>
      )}

      {view === "elec" && (
        <div className="mt-5">
          <p className="text-sm text-slate-600 mb-3">Las electivas suman créditos para llegar al total de la carrera. Las que aprobás acá se cuentan en tu avance.</p>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar electiva" aria-label="Buscar electiva" className="w-full max-w-md rounded-xl border border-[#C5D0E6] px-4 h-11 mb-4 bg-white" />
          {elec.length === 0 ? <div className={`${card} p-5 text-sm text-slate-500`}>Este plan no tiene electivas cargadas.</div> : (
            <div className={`${card} overflow-hidden`}>{elec.filter((s) => norm(s.n).includes(norm(q))).map((s) => { const k = kind(s); return (
              <label key={s.c} className="flex items-center gap-3 px-4 py-3 border-b border-[#DCE3F0] last:border-0 cursor-pointer hover:bg-[#F7F9FD]">
                <input type="checkbox" checked={st[s.c] === "ok"} onChange={() => toggleOk(s.c)} className="h-5 w-5 accent-[#2E9E5B]" />
                <span className="flex-1"><span className={st[s.c] === "ok" ? "line-through text-slate-400" : "font-medium"}>{s.n}</span><span className="block text-xs text-slate-500">{s.g} · {s.k} cr.{s.r ? ` · req. ${s.r} cr.` : ""}</span></span>
                <span className={`pl pl-${k} rounded-full border px-2 py-0.5 text-xs font-semibold`}>{KIND_LABEL[k]}</span>
              </label>); })}</div>)}
        </div>
      )}
      <p className="mt-8 text-xs text-slate-500">Las correlativas y los créditos vienen del proyecto abierto <a className="underline" href="https://correlativas-itba.vercel.app/" target="_blank" rel="noreferrer">Correlativas ITBA</a> (licencia MIT). Confirmalas siempre con el plan oficial vigente de tu carrera.</p>
    </>
  );
}
