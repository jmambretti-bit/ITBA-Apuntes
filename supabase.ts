import { createClient } from "@supabase/supabase-js";

// La clave "publishable" es pública por diseño: la seguridad la dan las reglas RLS de la base.
export const supabase = createClient(
  "https://mknsxrohptqhlmddimir.supabase.co",
  "sb_publishable_0_v0MFpQf6d51fXQ0lHRVw_LTthngyE",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

// Pide al navegador que no borre los datos del sitio (incluida la sesión) cuando falte espacio.
try { navigator.storage?.persist?.(); } catch { /* no disponible */ }
