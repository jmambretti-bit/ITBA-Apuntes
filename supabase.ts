import { createClient } from "@supabase/supabase-js";

// La clave "publishable" es pública por diseño: la seguridad la dan las reglas RLS de la base.
export const supabase = createClient(
  "https://mknsxrohptqhlmddimir.supabase.co",
  "sb_publishable_0_v0MFpQf6d51fXQ0lHRVw_LTthngyE"
);
