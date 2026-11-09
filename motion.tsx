import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** Movimiento de la página. Todo se desactiva con prefers-reduced-motion. */
export const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** true cuando se bajó un poco la página (para darle sombra al encabezado). */
export function useScrolled(px = 8) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const f = () => setS(window.scrollY > px);
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, [px]);
  return s;
}

/** Aparece suavemente la primera vez que entra en pantalla. */
export function Reveal({ as: Tag = "div", className = "", style, children }: { as?: "div" | "section"; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(() => reduced() || typeof IntersectionObserver === "undefined");
  useEffect(() => {
    if (on) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting || e.boundingClientRect.top < 0)) { setOn(true); io.disconnect(); } }, { rootMargin: "0px 0px -6% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [on]);
  return <Tag ref={ref as never} className={`rv ${on ? "rv-on" : ""} ${className}`} style={style}>{children}</Tag>;
}

/** Número que sube hasta su valor. Los lectores de pantalla leen siempre el valor final. */
export function Count({ to, ms = 900 }: { to: number; ms?: number }) {
  const [v, setV] = useState(() => (reduced() ? to : 0));
  const from = useRef(v);
  useEffect(() => {
    if (reduced()) { setV(to); return; }
    let raf = 0, t0 = 0;
    const a = from.current;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / ms);
      const val = Math.round(a + (to - a) * (1 - Math.pow(1 - p, 3)));
      from.current = val; setV(val);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <><span className="sr-only">{to}</span><span aria-hidden="true">{v}</span></>;
}

/** Marcador de carga con brillo suave, en lugar de un "Cargando…" suelto. */
export function Skeleton({ lines = 4, head = false }: { lines?: number; head?: boolean }) {
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">Cargando…</span>
      {head && <div className="sk h-28 rounded-2xl" />}
      {Array.from({ length: lines }).map((_, i) => <div key={i} className="sk h-12 rounded-xl" style={{ opacity: 1 - i * 0.14 }} />)}
    </div>
  );
}

/** Barra de pestañas con una línea que se desliza hasta la pestaña activa (la activa lleva aria-pressed="true"). */
export function Tabbar({ active, className = "", label = "Secciones", children }: { active: string; className?: string; label?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ l: number; w: number } | null>(null);
  const [anim, setAnim] = useState(false);
  const measure = () => {
    const el = ref.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (el) setBar((b) => (b && b.l === el.offsetLeft && b.w === el.offsetWidth ? b : { l: el.offsetLeft, w: el.offsetWidth }));
  };
  useLayoutEffect(measure, [active]);
  useEffect(() => {
    const t = setTimeout(() => setAnim(true), 60);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ref.current?.querySelectorAll("button").forEach((b) => ro?.observe(b));
    (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready.then(measure);
    return () => { clearTimeout(t); ro?.disconnect(); };
  }, []);
  return (
    <div ref={ref} role="group" aria-label={label} className={`relative ${className}`}>
      {children}
      {bar && <span aria-hidden="true" className="tabbar-line pointer-events-none absolute bottom-0 left-0 h-0 border-b-[3px] border-[#2B52A1]" style={{ width: bar.w, transform: `translateX(${bar.l}px)`, transition: anim && !reduced() ? "transform .32s cubic-bezier(.2,.7,.2,1), width .32s cubic-bezier(.2,.7,.2,1)" : "none" }} />}
    </div>
  );
}

/** Cambia el tema con un círculo que se expande desde el botón (si el navegador lo permite). */
export function themeTransition(from: HTMLElement | null, apply: () => void) {
  const d = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<unknown> } };
  if (!d.startViewTransition || reduced()) return apply();
  const r = from?.getBoundingClientRect();
  const x = r ? r.left + r.width / 2 : innerWidth;
  const y = r ? r.top + r.height / 2 : 0;
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = d.startViewTransition(apply);
  t.ready.then(() => document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] }, { duration: 520, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" })).catch(() => {});
}
