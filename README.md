# INFECTED HUB — Frontend (Fase 1)

Frontend de la tienda independiente de **mods de personaje** para Left 4 Dead 2: supervivientes, infectados especiales y comunes, atuendos y brazos. Cada mod indica a qué personaje reemplaza. **No afiliada a Valve ni a Steam.**
Especificación completa del proyecto: [`../docs/PROMPT_MAESTRO.md`](../docs/PROMPT_MAESTRO.md).

> ⚠️ Esta fase funciona con **datos simulados** (`src/mocks/catalog.mock.ts`) y lo indica en pantalla.
> Descargas, compras, reportes y cuentas **no** están conectados: la interfaz lo dice explícitamente en lugar de simularlo.
> Los creadores pueden ponerle precio a un mod, pero el cobro está desactivado hasta habilitar pagos.
>
> ⚠️ El video del hero (`public/hero/`) es arte oficial de Valve: sustitúyelo por material propio o con licencia antes de publicar el sitio.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Motion (Framer Motion) · lucide-react · Vitest

## Comandos

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # pruebas unitarias (Vitest)
npm run lint
npm run build
```

## Rutas

Dos experiencias separadas: la **tienda** (grupo `app/(tienda)`, con header y footer) para quien compra, y los **dashboards** (`/creador`, `/admin`) con su propio shell (`DashboardShell`: sidebar fija, drawer en móvil).

### Tienda (comprador)

| Ruta | Contenido |
| --- | --- |
| `/` | Hero tipo panel con selector de personajes, destacados, categorías, por personaje, recientes, packs, creadores, “vende tus mods” |
| `/mods` · `/mods/[slug]` | Catálogo con filtros en la URL · ficha con carrito, deseos, “ya lo tienes” y aviso si choca con un mod de tu biblioteca |
| `/categorias` · `/categorias/[slug]` | Las 6 categorías |
| `/carrito` | Carrito local con aviso de conflictos por personaje; “Pagar” termina en un aviso: pagos no habilitados, no se cobra nada |
| `/cuenta/biblioteca` · `/cuenta/deseos` · `/cuenta/ajustes` | Sesión simulada: mods agrupados por personaje, actualizaciones, detector de conflictos (activo / inactivo); deseos; ajustes |
| `/creadores` · `/creadores/[slug]` | Perfiles públicos de creadores con sus mods |
| `/vender` | Landing para creadores: cómo funciona, requisitos, comisión (20 %) y preguntas frecuentes |
| `/acceso` · `/registro` · `/recuperar` | UI de cuentas con validación en cliente. Sin API |

### Dashboard del creador (demo con la creadora ficticia FerroVieja)

| Ruta | Contenido |
| --- | --- |
| `/creador` | KPIs de 30 días (ventas e ingresos simulados), gráfico diario descargas/ventas, tareas pendientes, top por ingresos, actividad |
| `/creador/mods` | Tabla con filtros (estado, categoría, personaje), búsqueda, orden, paginación, menú por fila y acciones masivas con confirmación |
| `/creador/mods/nuevo` | Asistente de 5 pasos con autoguardado local, restaurar borrador, galería reordenable (arrastrar o teclado) y vista previa |
| `/creador/mods/[id]` | Pestañas: detalles (en un mod publicado crea versión en revisión), versiones (semver), galería, precio (historial), estadísticas, reseñas, moderación |
| `/creador/ventas` | Transacciones simuladas con comprador anonimizado, totales, comisión y exportación CSV en el navegador. Cobros bloqueados |
| `/creador/resenas` | Bandeja con filtros, respuestas y reportes (solo locales) |
| `/creador/estadisticas` | Rango 7/30/90 días, comparativa entre mods y demanda por personaje en la tienda |
| `/creador/perfil` · `/creador/ajustes` | Perfil público con vista previa en vivo · notificaciones; datos fiscales bloqueados |

### Administración

| Ruta | Contenido |
| --- | --- |
| `/admin` y subrutas | Moderación, reportes, mods, usuarios, categorías, auditoría y configuración (cambios solo locales) |

## Estructura

```
src/
├── app/
│   ├── (tienda)/        rutas públicas con header y footer de la tienda
│   ├── creador/         dashboard del creador
│   └── admin/           dashboard de administración
├── components/          cards, forms, layout (DashboardShell, SideNav…), ui (Modal, Popover, Pagination…)
├── features/
│   ├── store/           carrito, deseos, biblioteca, conflictos por personaje (+ tests)
│   ├── creators/        asistente, gestor del mod, tablas, ventas, reseñas, estadísticas (+ tests)
│   ├── admin/ · auth/ · catalog/ · home/ · mods/
├── mocks/               datos ficticios (solo vía services/)
├── services/            capa de acceso a datos → se reemplaza por la API REST
├── lib/                 formateadores, comisión, CSV, store local
└── types/               modelos de dominio
```

Lógica con tests: conflictos y totales del carrito, comisión, filtros y duplicado de “Mis mods”, validación por paso del asistente, semver de versiones, reordenar galería, URL de video, CSV.

## Diseño

- **Tokens** en `src/app/globals.css`: asphalt / soot / concrete (fondos), bone (texto), blood (acento), flare (acciones).
- **Tipografía**: Big Shoulders Stencil (display), Archivo (texto), JetBrains Mono (datos y etiquetas).
- **Hero**: panel con esquinas en chaflán, video en duotono y selector de personajes animado con GSAP.
- El dashboard es más sobrio que la tienda: densidad de datos, sin efectos de hero.
- Las portadas son arte procedural hasta que los creadores suban imágenes. ⚠️ El video del hero es arte de Valve: sustitúyelo antes de publicar.
- Se respeta `prefers-reduced-motion` en GSAP, Motion y CSS.

## Pendiente (siguientes fases)

Backend Spring Boot + PostgreSQL, autenticación y roles (validados en el servidor), descargas con URLs prefirmadas, subida real a S3 con antivirus, pagos y retiros (solo con autorización legal).
