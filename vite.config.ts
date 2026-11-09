import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

// Dirección pública del sitio, usada en la vista previa al compartir el enlace.
// Si más adelante comprás un dominio propio, cambiala acá.
const SITE = process.env.SITE_URL || "https://apuntesitba.vercel.app";

const siteMeta = () => ({
  name: "site-meta",
  transformIndexHtml: (html: string) => html.split("__SITE__").join(SITE),
  generateBundle(this: { emitFile: (f: { type: "asset"; fileName: string; source: Buffer }) => void }) {
    try { this.emitFile({ type: "asset", fileName: "og.png", source: readFileSync("og.png") }); } catch { /* si falta og.png, el sitio igual se publica sin imagen de vista previa */ }
  },
});

export default defineConfig({ plugins: [react(), siteMeta()] });
