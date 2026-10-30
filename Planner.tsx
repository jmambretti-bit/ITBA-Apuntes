import { useMemo, useState } from "react";
import { CAREERS, COL } from "./data";
import { ls } from "./store";
import { Title, card, btn2 } from "./common";

const OPTIONS = CAREERS.filter((c) => c.name !== "Ingreso");

export default function Planner() {
  const [name, setName] = useState<string>(() => ls.get("itba.planner.career", OPTIONS[0].name));
  const [done, setDone] = useState<Record<string, Record<string, boolean>>>(() => ls.get("itba.planner.done", {}));
  const career = OPTIONS.find((c) => c.name === name) || OPTIONS[0];
  const mine = done[career.name] || {};
  const all = useMemo(() => [...new Set(career.years.flat(2))], [career]);
  const ok = all.filter((n) => mine[n]).length;
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

  const pick = (n: string) => { setName(n); ls.set("itba.planner.career", n); };
  const toggle = (s: string) => { const next = { ...done, [career.name]: { ...mine, [s]: !mine[s] } }; setDone(next); ls.set("itba.planner.done", next); };
  const reset = () => { const next = { ...done, [career.name]: {} }; setDone(next); ls.set("itba.planner.done", next); };
  const color = COL[career.name] || "#2B52A1";

  return (
    <>
      <Title title="Planificador de carrera" sub="Marcá las materias que ya aprobaste y mirá cuánto te falta, año por año. Se guarda en este navegador; no hace falta cuenta." />
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold" htmlFor="pc">Carrera</label>
        <select id="pc" value={career.name} onChange={(e) => pick(e.target.value)} className="rounded-xl border border-[#C5D0E6] px-4 h-11 bg-white">
          {OPTIONS.map((c) => <option key={c.name}>{c.name}</option>)}
        </select>
        <button onClick={reset} className={btn2}>Reiniciar esta carrera</button>
      </div>
      <div className={`${card} p-5 mt-6 border-l-[10px]`} style={{ borderLeftColor: color }}>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div><p className="text-4xl font-extrabold">{pct(ok, all.length)}%</p><p className="text-sm text-slate-600">{ok} de {all.length} materias aprobadas, te faltan {all.length - ok}</p></div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-[#EEF2F9] overflow-hidden" role="progressbar" aria-valuenow={pct(ok, all.length)} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-[#2B52A1]" style={{ width: `${pct(ok, all.length)}%` }} /></div>
      </div>
      <div className="mt-8 space-y-8">
        {career.years.map((qs, i) => {
          const ys = [...new Set(qs.flat())];
          const yd = ys.filter((n) => mine[n]).length;
          return (
            <section key={i}>
              <div className="flex items-baseline justify-between gap-3 border-b border-[#DCE3F0] pb-2">
                <h2 className="text-xl font-bold">{i + 1}.º año</h2>
                <span className="text-sm text-slate-500">{yd} de {ys.length}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {qs.map((subs, j) => subs.length > 0 && (
                  <div key={j} className={`${card} overflow-hidden self-start`}>
                    <h3 className="px-4 py-2.5 text-sm font-bold bg-[#EEF2F9] border-b border-[#DCE3F0]">{j + 1}.{j === 0 ? "er" : "º"} cuatrimestre</h3>
                    {subs.map((s) => (
                      <label key={s} className="flex items-center gap-3 px-4 py-3 border-b border-[#DCE3F0] last:border-0 cursor-pointer hover:bg-[#F7F9FD]">
                        <input type="checkbox" checked={!!mine[s]} onChange={() => toggle(s)} className="h-5 w-5 accent-[#2B52A1]" />
                        <span className={mine[s] ? "text-slate-400 line-through" : ""}>{s}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
