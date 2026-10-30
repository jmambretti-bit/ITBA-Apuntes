# ITBA Apuntes (sitio no oficial)

Catálogo de apuntes, exámenes viejos y libros del ITBA, más herramientas para la comunidad.

**Sitio no oficial, hecho por estudiantes. Sin vínculo institucional con el ITBA ni avalado por la universidad.**
Los archivos no están en este repositorio: la página enlaza a Google Drive.

## Qué incluye

- Catálogo por carrera, año y cuatrimestre, con apuntes, exámenes (1P, 2P, finales) y libros por materia.
- Planificador de carrera y armador de horarios (se guardan en el navegador, sin cuenta).
- Calendario compartido, ayudantes y grupos de estudio, y panel de moderación (usan Supabase).
- Inicio de sesión por enlace al correo, **solo con cuentas @itba.edu.ar**. Hay que ingresar para ver la página.
- Archivos nuevos: cualquier usuario puede enviar un enlace; queda pendiente hasta que un moderador lo aprueba. Los moderadores pueden quitar cualquier archivo, incluso los que ya venían con la página.

## Estructura

Todo vive en la raíz del repositorio, sin carpetas, a propósito, para que se pueda subir fácil desde la web de GitHub.

- `App.tsx`: pantalla principal, navegación y catálogo.
- `data.ts`: carreras, materias, archivos y asociaciones (acá se editan los datos).
- `Planner.tsx`, `Schedule.tsx`, `CalendarView.tsx`, `Help.tsx`, `Admin.tsx`: herramientas.
- `auth.tsx`, `supabase.ts`, `common.tsx`, `store.ts`, `ui.tsx`: cuentas, cliente y utilidades.
- `main.tsx`, `index.html`, `index.css` y la configuración de Vite y Tailwind.

## Datos del catálogo (en `data.ts`)

- `CAREERS`: carreras, años y cuatrimestres (`1C#2C`, materias separadas por `/`).
- `DRV`: carpetas de Drive por materia (respaldo).
- `FILES`: archivos por materia y sección (`Apuntes`, `Ex-1P`, `Ex-2P`, `Ex-F`, `Libros`, `Hitos` para Ingreso), con formato `id:título` separados por `¦`.
- `ASOC`: asociaciones estudiantiles.

## Base de datos (Supabase)

Proyecto `itba-apuntes`. Las tablas son `profiles`, `events`, `help_posts`, `reports`, `file_submissions` y `file_removals`, todas con Row Level Security.

- Un trigger sobre `auth.users` rechaza cualquier correo que no termine en `@itba.edu.ar`.
- Los eventos de usuarios comunes quedan `pending` hasta que un moderador los aprueba. Los moderadores publican directo.
- Las publicaciones de ayudantes y grupos son visibles de inmediato (máximo 5 activas por persona). Con 3 reportes abiertos distintos se ocultan hasta que las revise un moderador.
- Los roles son `user`, `moderator` y `admin`. El administrador inicial es `jmambretti@itba.edu.ar`; desde el panel de Moderación puede nombrar moderadores.
- La clave que está en `supabase.ts` es la publicable (pública por diseño). Nunca pongas la clave `service_role` en este repositorio.

**Importante:** el acceso obligatorio controla qué ve la interfaz, pero el catálogo (`data.ts`) viaja en el código público de la página. Lo que protege los archivos es el permiso de cada carpeta o archivo en Google Drive.

### Configuración pendiente en el panel de Supabase

1. **Authentication > URL Configuration**: poné como *Site URL* el dominio publicado (por ejemplo `https://tu-proyecto.vercel.app`) y agregalo también en *Redirect URLs*. Sin esto, el enlace del correo no vuelve a la página.
2. **Authentication > SMTP Settings**: el correo integrado de Supabase tiene un límite muy bajo de envíos por hora. Para uso real, configurá un SMTP propio (por ejemplo Resend).

## Desarrollo local

```bash
pnpm install
pnpm dev
pnpm build
```

## Publicar en Vercel

Importá el repositorio desde Vercel (Add New > Project). Detecta Vite solo y no hace falta configurar nada.
