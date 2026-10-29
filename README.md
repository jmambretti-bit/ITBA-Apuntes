# ITBA Apuntes (sitio no oficial)

Catálogo de apuntes, exámenes viejos y libros del ITBA, organizado por carrera, año, cuatrimestre y materia.

**Sitio no oficial, hecho por estudiantes. Sin vínculo institucional con el ITBA ni avalado por la universidad.**
Los archivos no están en este repositorio: la página enlaza a Google Drive y se abren con una cuenta ITBA.

## Estructura

Todo vive en la raíz del repositorio (sin carpetas), a propósito, para que se pueda subir fácil desde la web de GitHub:

- `App.tsx`: la página y todos los datos (carreras, materias, archivos, asociaciones).
- `main.tsx`, `index.html`, `index.css`: arranque y estilos.
- `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`: configuración.

## Datos (en `App.tsx`)

- `CAREERS`: carreras, años y cuatrimestres (`1C#2C`, materias separadas por `/`).
- `DRV`: carpetas de Drive por materia (respaldo).
- `FILES`: archivos por materia y sección (`Apuntes`, `Ex-1P`, `Ex-2P`, `Ex-F`, `Libros`, `Hitos` para Ingreso), con formato `id:título` separados por `¦`.
- `ASOC`: asociaciones estudiantiles.

## Desarrollo local

```bash
pnpm install
pnpm dev
pnpm build
```

## Publicar en Vercel

Importá el repositorio desde Vercel (Add New > Project). Detecta Vite solo y no hace falta configurar nada.
