import { useMemo, useState } from "react";
import { ALL } from "./data";
import { ls } from "./store";
import { Title, card, btn, field, btn2 } from "./common";

type Slot = { id: string; name: string; commission: string; day: number; start: string; end: string; place: string; active: boolean };
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const H0 = 7, H1 = 23, PX = 44;
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const hue = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };

export default function Schedule() {
  const [slots, setSlots] = useState<Slot[]>(() => ls.get("itba.schedule", []));
  const [f, setF] = useState({ name: "", commission: "", day: 0, start: "08:00", end: "10:00", place: "" });
  const [err, setErr] = useState("");
  const save = (n: Slot[]) => { setSlots(n); ls.set("itba.schedule", n); };
  const add = () => {
    if (!f.name.trim()) return setErr("Escribí el nombre de la materia.");
    if (toMin(f.end) <= toMin(f.start)) return setErr("La hora de fin debe ser posterior a la de inicio.");
    if (toMin(f.start) < H0 * 60 || toMin(f.end) > H1 * 60) return setErr(`El horario debe estar entre ${H0}:00 y ${H1}:00.`);
    setErr("");
    save([...slots, { ...f, name: f.name.trim(), id: Math.random().toString(36).slice(2), active: true }]);
  };
  const conflicts = useMemo(() => {
    const ids = new Set<string>(); const pairs: [Slot, Slot][] = [];
    const act = slots.filter((s) => s.active);
    for (let i = 0; i < act.length; i++) for (let j = i + 1; j < act.length; j++) {
      const a = act[i], b = act[j];
      if (a.day === b.day && toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end)) { ids.add(a.id); ids.add(b.id); pairs.push([a, b]); }
    }
    return { ids, pairs };
  }, [slots]);
  const hours = Array.from({ length: H1 - H0 }, (_, i) => H0 + i);

  return (
    <>
      <Title title="Armador de horarios" sub="Cargá los horarios de las comisiones que estás pensando cursar y fijate si se superponen. Activá o desactivá cada una para probar combinaciones. Se guarda en este navegador." />
      <div className={`${card} p-5`}>
        <div className="grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2"><label className="text-xs font-semibold" htmlFor="sn">Materia</label><input id="sn" list="mats" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} placeholder="Análisis Matemático II" /><datalist id="mats">{ALL.map((n) => <option key={n} value={n.replace(" (Ingreso)", "")} />)}</datalist></div>
          <div><label className="text-xs font-semibold" htmlFor="sc">Comisión</label><input id="sc" value={f.commission} onChange={(e) => setF({ ...f, commission: e.target.value })} className={field} placeholder="Ej. A" /></div>
          <div><label className="text-xs font-semibold" htmlFor="sd">Día</label><select id="sd" value={f.day} onChange={(e) => setF({ ...f, day: Number(e.target.value) })} className={field}>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></div>
          <div><label className="text-xs font-semibold" htmlFor="ss">Desde</label><input id="ss" type="time" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} className={field} /></div>
          <div><label className="text-xs font-semibold" htmlFor="se">Hasta</label><input id="se" type="time" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} className={field} /></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]"><label className="text-xs font-semibold" htmlFor="sp">Aula o sede (opcional)</label><input id="sp" value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })} className={field} /></div>
          <button onClick={add} className={btn}>Agregar horario</button>
          {slots.length > 0 && <button onClick={() => save([])} className={btn2}>Vaciar todo</button>}
        </div>
        {err && <p role="alert" className="mt-2 text-sm text-[#B3261E]">{err}</p>}
      </div>

      {conflicts.pairs.length > 0 && (
        <div role="alert" className="mt-5 rounded-2xl border border-[#E6B8B4] bg-[#FDECEA] p-4 text-sm text-[#7A1C15]">
          <p className="font-bold">Hay {conflicts.pairs.length} {conflicts.pairs.length === 1 ? "superposición" : "superposiciones"}</p>
          {conflicts.pairs.map(([a, b], i) => <p key={i} className="mt-1">{a.name}{a.commission && ` (${a.commission})`} y {b.name}{b.commission && ` (${b.commission})`}, el {DAYS[a.day].toLowerCase()}.</p>)}
        </div>
      )}

      <div className={`${card} mt-6 overflow-x-auto`}>
        <div className="min-w-[720px]">
          <div className="grid" style={{ gridTemplateColumns: "56px repeat(6, 1fr)" }}>
            <div />
            {DAYS.map((d) => <div key={d} className="px-2 py-2 text-sm font-bold text-center bg-[#EEF2F9] border-l border-[#DCE3F0]">{d}</div>)}
          </div>
          <div className="grid relative" style={{ gridTemplateColumns: "56px repeat(6, 1fr)", height: (H1 - H0) * PX }}>
            <div>{hours.map((h) => <div key={h} className="text-[11px] text-slate-500 text-right pr-2" style={{ height: PX }}>{h}:00</div>)}</div>
            {DAYS.map((_, d) => (
              <div key={d} className="relative border-l border-[#DCE3F0]" style={{ backgroundImage: `linear-gradient(#EEF2F9 1px, transparent 1px)`, backgroundSize: `100% ${PX}px` }}>
                {slots.filter((s) => s.day === d && s.active).map((s) => {
                  const bad = conflicts.ids.has(s.id);
                  return (
                    <div key={s.id} className="absolute left-1 right-1 rounded-lg px-2 py-1 text-xs overflow-hidden" style={{ top: ((toMin(s.start) - H0 * 60) / 60) * PX, height: ((toMin(s.end) - toMin(s.start)) / 60) * PX - 2, background: bad ? "#FDECEA" : `hsl(${hue(s.name)} 70% 90%)`, border: `2px solid ${bad ? "#B3261E" : `hsl(${hue(s.name)} 50% 45%)`}`, color: "#1B2433" }}>
                      <p className="font-bold leading-tight">{s.name}{s.commission && ` · ${s.commission}`}</p>
                      <p>{s.start} a {s.end}{s.place && `, ${s.place}`}</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {slots.length > 0 && (
        <div className={`${card} mt-6 overflow-hidden`}>
          {slots.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#DCE3F0] last:border-0">
              <input type="checkbox" checked={s.active} onChange={() => save(slots.map((x) => (x.id === s.id ? { ...x, active: !x.active } : x)))} className="h-5 w-5 accent-[#2B52A1]" aria-label={`Incluir ${s.name}`} />
              <span className="flex-1 text-sm"><strong>{s.name}</strong>{s.commission && ` · comisión ${s.commission}`}, {DAYS[s.day].toLowerCase()} {s.start} a {s.end}{s.place && `, ${s.place}`}</span>
              <button onClick={() => save(slots.filter((x) => x.id !== s.id))} className="text-sm text-slate-500 underline">Quitar</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
