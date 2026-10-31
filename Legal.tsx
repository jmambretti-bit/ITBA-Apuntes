import { useState } from "react";
import { supabase } from "./supabase";
import { CONTACT_EMAIL } from "./data";
import { Title, card, btn, field } from "./common";

export type LegalTab = "privacidad" | "terminos" | "autor" | "contacto";
export const LEGAL_TABS: [LegalTab, string][] = [["privacidad", "Privacidad"], ["terminos", "Términos y reglas"], ["autor", "Derechos de autor"], ["contacto", "Contacto"]];
const UPDATED = "30 de octubre de 2026";

const H = ({ children }: { children: string }) => <h2 className="text-xl font-bold mt-8 mb-2">{children}</h2>;
const P = ({ children }: { children: React.ReactNode }) => <p className="text-slate-700 leading-relaxed mb-3">{children}</p>;
const L = ({ items }: { items: React.ReactNode[] }) => <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-3">{items.map((i, n) => <li key={n}>{i}</li>)}</ul>;

function Privacidad() {
  return (<>
    <Title title="Política de privacidad" sub={`Última actualización: ${UPDATED}.`} />
    <H>Quiénes somos</H>
    <P>Este sitio es un proyecto no oficial hecho por estudiantes. No pertenece al ITBA ni está avalado por la universidad. No es una persona jurídica: lo administra un grupo de estudiantes, a quienes podés escribirles desde la sección Contacto.</P>
    <H>Qué datos recopilamos</H>
    <L items={[
      <><strong>Cuenta:</strong> tu correo @itba.edu.ar, la fecha de alta y tu rol dentro del sitio (usuario, moderador o administrador).</>,
      <><strong>Lo que enviás:</strong> eventos del calendario, publicaciones de ayudantes y grupos de estudio (incluido el medio de contacto que escribas), enlaces a archivos, reportes y mensajes de contacto.</>,
      <><strong>Datos técnicos:</strong> registros de acceso (dirección IP, navegador, fecha y hora) que generan los servicios de autenticación y alojamiento.</>,
      <><strong>En tu dispositivo:</strong> la sesión de ingreso, el avance del planificador, los horarios que armás y la preferencia de modo noche, guardados en el almacenamiento local de tu navegador. No usamos cookies de publicidad ni de seguimiento.</>,
    ]} />
    <H>Para qué los usamos</H>
    <P>Para permitirte ingresar, mostrar el contenido, moderarlo, mantener la seguridad del sitio y responder tus mensajes. No vendemos ni cedemos tus datos a terceros y el sitio no tiene publicidad.</P>
    <H>Quién puede ver qué</H>
    <L items={[
      "Tu correo lo ven los administradores y moderadores. Los demás usuarios no lo ven.",
      "Las publicaciones de ayudantes y grupos las ven los usuarios que ingresaron, con el contacto que hayas escrito. No pongas datos que no quieras compartir.",
      "Los eventos aprobados del calendario y los enlaces aprobados son visibles para quienes usan el sitio.",
    ]} />
    <H>Servicios de terceros</H>
    <L items={[
      "Supabase: base de datos y autenticación (servidores en São Paulo, Brasil).",
      "Vercel: alojamiento del sitio.",
      "Un proveedor de correo, para enviarte el enlace de acceso.",
      "Google Fonts: la tipografía se carga desde servidores de Google, que reciben tu dirección IP al hacerlo.",
      "Google Drive: los archivos están en Drive. Al abrir uno rigen las condiciones y la política de privacidad de Google.",
    ]} />
    <H>Cuánto tiempo los conservamos</H>
    <P>Mientras tengas cuenta. Si pedís la baja, eliminamos tu cuenta y el contenido asociado, salvo los registros mínimos de moderación y seguridad que haga falta conservar por un tiempo acotado. Los registros técnicos se rigen por los plazos de cada proveedor.</P>
    <H>Tus derechos</H>
    <P>La Ley 25.326 de Protección de los Datos Personales de la República Argentina te permite acceder a tus datos, rectificarlos, actualizarlos y pedir su supresión. Para ejercerlos escribinos desde la sección Contacto eligiendo el motivo “Datos personales”. La Agencia de Acceso a la Información Pública, como órgano de control de esa ley, tiene la atribución de atender las denuncias y reclamos por incumplimiento de las normas de protección de datos personales.</P>
    <H>Seguridad</H>
    <P>Usamos conexiones cifradas y reglas de acceso en la base de datos para que cada persona vea solo lo que le corresponde. Ningún sistema es completamente seguro, por eso no te podemos garantizar una protección absoluta.</P>
    <H>Cambios</H>
    <P>Si modificamos esta política, actualizamos la fecha de arriba. Si el cambio es importante, lo avisamos en el sitio.</P>
  </>);
}

function Terminos() {
  return (<>
    <Title title="Términos de uso y reglas de la comunidad" sub={`Última actualización: ${UPDATED}.`} />
    <H>Qué es este sitio</H>
    <P>Es un proyecto no oficial hecho por estudiantes, sin vínculo institucional con el ITBA. Los nombres y marcas pertenecen a sus titulares. Al usarlo aceptás estos términos.</P>
    <H>Quién puede usarlo</H>
    <P>Personas con un correo @itba.edu.ar. Sos responsable de lo que se haga desde tu cuenta.</P>
    <H>Qué hace y qué no</H>
    <L items={[
      "Organiza enlaces a materiales, no aloja los archivos: están en Google Drive, en cuentas de terceros.",
      "No garantizamos que los enlaces funcionen, que el material esté actualizado ni que sea correcto.",
      "Las correlativas, los créditos, las fechas y los horarios son informativos. Para decisiones académicas, consultá siempre la información oficial de la universidad.",
    ]} />
    <H>Lo que aportás</H>
    <P>Al enviar un enlace, un evento o una publicación declarás que tenés derecho a compartirlo y que no infringe derechos de otras personas. Nos das permiso para mostrarlo en el sitio, revisarlo y quitarlo cuando corresponda. Usá el material para estudiar y respetá las normas académicas del ITBA: el sitio no es para plagiar ni para evadir evaluaciones.</P>
    <H>Reglas de la comunidad</H>
    <L items={[
      "Tratá bien a las demás personas. No se admite acoso, discriminación ni amenazas.",
      "No publiques datos personales de otras personas sin su consentimiento.",
      "Nada de spam, publicidad ni enlaces engañosos o peligrosos.",
      "No subas contenido ilegal ni material que no tengas derecho a compartir.",
      "Ayudantes y grupos: los acuerdos, los pagos y las clases son entre las personas. El sitio no interviene, no verifica la calidad ni garantiza resultados. Cuidá tus datos y acordá encuentros en lugares seguros.",
    ]} />
    <H>Moderación</H>
    <P>Los moderadores pueden aprobar, rechazar, ocultar o eliminar contenido, y suspender cuentas que incumplan estas reglas. Cualquier persona puede reportar contenido. Si creés que una decisión fue un error, escribinos desde Contacto.</P>
    <H>Responsabilidad</H>
    <P>El sitio se ofrece tal como está, sin garantías. En la medida que la ley lo permita, quienes lo administran no responden por daños derivados de su uso, de archivos de terceros o de acuerdos entre usuarios.</P>
    <H>Cambios y ley aplicable</H>
    <P>Podemos modificar estos términos o dar de baja el sitio. Se rigen por las leyes de la República Argentina.</P>
  </>);
}

function Autor() {
  return (<>
    <Title title="Derechos de autor y retiro de contenido" sub={`Última actualización: ${UPDATED}.`} />
    <H>Qué hacemos</H>
    <P>El sitio solo guarda títulos y enlaces a archivos que están en Google Drive. Algunos materiales (libros, apuntes, exámenes) pueden estar protegidos por derechos de autor, por ejemplo bajo la Ley 11.723 de Propiedad Intelectual. No queremos alojar ni difundir material sin autorización de quien tiene los derechos.</P>
    <H>Si sos titular de derechos y querés que quitemos un enlace</H>
    <P>Escribinos desde Contacto eligiendo el motivo “Derechos de autor” e incluí:</P>
    <L items={[
      "La identificación de la obra protegida.",
      "Dónde está en el sitio (carrera, materia y sección) o el enlace exacto.",
      "Tu nombre y un medio de contacto.",
      "Una declaración de que sos titular de los derechos o actuás en su nombre, y de que el uso que se hace no está autorizado.",
    ]} />
    <P>Revisamos cada pedido y, si corresponde, quitamos el enlace a la brevedad. Tené en cuenta que el archivo en sí sigue estando en la cuenta de Drive de quien lo subió; para eliminarlo de ahí hay que reclamarle a Google.</P>
    <H>Si subís contenido</H>
    <P>Compartí solo lo que tengas derecho a compartir o lo que sus autores permitan. Los moderadores pueden quitar cualquier enlace y suspender a quienes reincidan en subir material sin permiso.</P>
    <H>Si ves un problema</H>
    <P>En cada archivo hay un botón para reportar un enlace roto, una materia equivocada o contenido inadecuado. También podés escribirnos desde Contacto.</P>
    <H>Créditos</H>
    <P>Los datos de correlativas y créditos provienen del proyecto abierto Correlativas ITBA (<a className="underline text-[#2B52A1]" href="https://github.com/Secreto31126/correlativas-itba" target="_blank" rel="noreferrer">github.com/Secreto31126/correlativas-itba</a>), publicado bajo licencia MIT, Copyright (c) 2023 Tomás Raiti.</P>
  </>);
}

const KINDS: [string, string][] = [["consulta", "Consulta"], ["sugerencia", "Sugerencia"], ["reporte", "Reportar un problema o contenido"], ["derechos_de_autor", "Derechos de autor"], ["datos_personales", "Datos personales"], ["otro", "Otro"]];

function Contacto({ email }: { email?: string }) {
  const [f, setF] = useState({ name: "", email: email || "", kind: "consulta", message: "", website: "" });
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [err, setErr] = useState("");
  const send = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) return setErr("Escribí un correo válido para poder responderte.");
    if (f.message.trim().length < 10) return setErr("El mensaje es muy corto (mínimo 10 caracteres).");
    setErr("");
    if (f.website) { setState("ok"); return; }
    setState("busy");
    const { error } = await supabase.from("contact_messages").insert({ name: f.name.trim() || null, email: f.email.trim(), kind: f.kind, message: f.message.trim() });
    setState(error ? "err" : "ok");
  };
  return (<>
    <Title title="Contacto" sub="Para consultas, sugerencias, reportes, pedidos de retiro de contenido o para ejercer tus derechos sobre tus datos personales." />
    {CONTACT_EMAIL && <P>También podés escribir a <a className="underline text-[#2B52A1]" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</P>}
    {state === "ok" ? (
      <div role="status" className={`${card} p-6`}><p className="font-bold">Mensaje enviado</p><p className="text-slate-700 mt-1">Gracias. Lo vamos a revisar y, si hace falta, te respondemos al correo que dejaste. No podemos garantizar un plazo de respuesta.</p></div>
    ) : (
      <div className={`${card} p-5 grid gap-3 max-w-2xl`}>
        <div><label className="text-xs font-semibold" htmlFor="cn">Nombre (opcional)</label><input id="cn" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={80} className={field} /></div>
        <div><label className="text-xs font-semibold" htmlFor="ce">Tu correo (para responderte)</label><input id="ce" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} maxLength={120} className={field} /></div>
        <div><label className="text-xs font-semibold" htmlFor="ck">Motivo</label><select id="ck" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className={field}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <div><label className="text-xs font-semibold" htmlFor="cm">Mensaje</label><textarea id="cm" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} rows={6} maxLength={2000} className="w-full rounded-xl border border-[#C5D0E6] px-4 py-2 bg-white" /></div>
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}><label>No completar<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></label></div>
        {err && <p role="alert" className="text-sm text-[#B3261E]">{err}</p>}
        {state === "err" && <p role="alert" className="text-sm text-[#B3261E]">No pudimos enviar el mensaje. Probá de nuevo en un rato.</p>}
        <p className="text-xs text-slate-500">Usamos tu correo solo para responderte. Más información en la política de privacidad.</p>
        <div><button onClick={send} disabled={state === "busy"} className={btn}>{state === "busy" ? "Enviando…" : "Enviar mensaje"}</button></div>
      </div>
    )}
  </>);
}

export default function Legal({ tab, setTab, email }: { tab: LegalTab; setTab: (t: LegalTab) => void; email?: string }) {
  return (
    <div className="max-w-3xl">
      <div role="tablist" className="flex gap-1 border-b border-[#DCE3F0] mb-8 overflow-x-auto">
        {LEGAL_TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`px-5 py-3 text-[15px] font-semibold whitespace-nowrap border-b-[3px] -mb-px ${tab === k ? "border-[#2B52A1] text-[#2B52A1]" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{l}</button>)}
      </div>
      {tab === "privacidad" && <Privacidad />}
      {tab === "terminos" && <Terminos />}
      {tab === "autor" && <Autor />}
      {tab === "contacto" && <Contacto email={email} />}
    </div>
  );
}

export function PublicLegal({ tab, setTab, onBack }: { tab: LegalTab; setTab: (t: LegalTab) => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-white text-[#1B2433]" style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <div role="note" className="bg-[#FFE98A] text-[#4A3A00] text-[13px] sm:text-sm text-center px-4 py-2"><strong>Página no oficial.</strong> Hecha por estudiantes: no pertenece ni está avalada por el ITBA.</div>
      <header className="border-b border-[#DCE3F0]"><div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between"><span className="grid place-items-center h-9 px-2 text-white font-extrabold text-lg bg-[#2B52A1]" style={{ borderRadius: "10px 10px 10px 2px" }}>ITBA</span><button onClick={onBack} className="text-sm font-semibold text-[#2B52A1]">Volver al ingreso</button></div></header>
      <main className="max-w-6xl mx-auto px-5 py-10"><Legal tab={tab} setTab={setTab} /></main>
    </div>
  );
}
