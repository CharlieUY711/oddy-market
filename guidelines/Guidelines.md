# Guidelines — ODDY Market / Charlie v1.5

Proyecto: Marketplace Admin + Storefront  
Stack: React 18 · TypeScript · Vite · Tailwind v4 · shadcn/ui · MUI · Supabase · React Router v7

---

## Identidad de marca

- Color principal (Orange): `#FF6835` — siempre declarado como `const ORANGE = '#FF6835'` al tope del archivo cuando se use.
- Nunca usar valores naranja distintos (no `#FF6600`, no `orange`, no `--color-primary`). Solo `#FF6835`.
- El texto sobre fondo naranja usa `#FFFFFF` sólido o `rgba(255,255,255,0.82)` para subtítulos y textos secundarios.
- Los íconos en sidebar activo usan `strokeWidth={2.5}`, inactivo `strokeWidth={2}` (sub-items: `2.5` activo / `1.8` inactivo).

---

## Estructura del proyecto

```
src/
  app/
    components/
      admin/          ← Componentes del panel de administración
        views/        ← Una vista por sección (DashboardView, EcommerceView, etc.)
      ui/             ← Componentes shadcn/ui — NO modificar directamente
      figma/          ← Helpers de imágenes con fallback
    storefront/       ← Páginas del portal del cliente
    AdminDashboard.tsx
    App.tsx
    routes.tsx
  styles/
    theme.css         ← Variables CSS del design system
    index.css
```

---

## Reglas de estilo

### Inline styles vs Tailwind
- Los componentes del **Admin** usan **inline styles** con `style={{...}}`. Mantener esa consistencia al agregar o modificar componentes admin.
- El **Storefront** puede usar Tailwind. No mezclar dentro del mismo componente.
- Nunca usar clases de Tailwind en componentes admin que ya usan inline styles, y viceversa.

### Layout general del Admin
- El sidebar tiene `width: 210px` fijo y `position: sticky; top: 0; height: 100vh`.
- El `OrangeHeader` tiene siempre `height: 100px`, igual que el área del logo en el sidebar — mantener esa alineación.
- El contenido principal usa `flex: 1; overflow-y: auto`.

---

## Componentes reutilizables — usar siempre en lugar de recrear

### `OrangeHeader`
```tsx
<OrangeHeader
  title="Título de la sección"
  subtitle="Subtítulo opcional"
  actions={[
    { label: 'Acción secundaria' },
    { label: 'Acción principal', primary: true, onClick: handleClick },
  ]}
/>
```
- Siempre es el primer elemento de una vista admin.
- Los botones `primary: true` se renderizan blancos con texto naranja.
- Los botones sin `primary` son transparentes con borde y texto blanco.

### `ModuleCard` y `ModuleCardGrid`
```tsx
const cards: CardDef[] = [
  { id: 'unico', icon: IconName, label: 'Etiqueta', description: 'Descripción corta', color: 'blue', onClick: () => onNavigate('seccion') },
];
<ModuleCardGrid cards={cards} columns={3} />
```
- Colores disponibles: `lavender` `green` `pink` `orange` `blue` `yellow` `teal` `purple` `rose`
- Íconos: siempre de `lucide-react`, `size={28}` y `strokeWidth={1.5}` para cards.
- No recrear tarjetas de módulo con estilos propios — usar este componente.

### Íconos
- Librería exclusiva: `lucide-react`. No usar MUI Icons ni emojis en la navegación.
- Emojis solo se permiten en datos de mockup/placeholder (ej: KPIs del dashboard).

---

## Navegación y routing

- El tipo `MainSection` está definido en `AdminDashboard.tsx` — siempre extender ahí al agregar secciones.
- Las vistas reciben `onNavigate: (section: MainSection) => void` como prop cuando necesitan navegar.
- Al agregar una nueva sección: (1) agregar el tipo a `MainSection`, (2) crear `NombreView.tsx` en `views/`, (3) agregar al `NAV_GROUPS` en `AdminSidebar.tsx`, (4) agregar el case en `AdminDashboard.tsx`.

---

## Convenciones de código

- Comentarios de sección: `/* ── Nombre ── */` (con guiones dobles y espacios em).
- Interfaces de Props siempre llamadas `Props` dentro de cada archivo, no `NombreComponenteProps`.
- Exports: nombrados (no default) para todos los componentes admin. Ej: `export function DashboardView`.
- Idioma de UI: **español rioplatense**. Labels, placeholders, mensajes de error y tooltips en español.
- Código (variables, funciones, tipos): **inglés**.

---

## Gráficos y datos

- Librería de gráficos: `recharts` únicamente. No introducir Chart.js ni otras.
- Datos de mockup aceptables mientras no esté conectado Supabase. Marcar con comentario `/* TODO: conectar Supabase */`.
- Colores de gráficos: `ORANGE` como color primario, luego `#1F2937`, `#6B7280`, `#9CA3AF`.
- Los gráficos siempre van dentro de `<ResponsiveContainer width="100%" height={...}>`.

---

## Base de datos — Supabase

- Credenciales en `src/utils/supabase/info.ts` (actualmente vacías — no conectado).
- Funciones del servidor en `supabase/functions/server/`. Al agregar una nueva entidad, crear su propio archivo (ej: `productos.tsx`).
- No hardcodear projectId ni claves en ningún otro archivo.

---

## Lo que NO hacer

- No usar `position: absolute` salvo que sea estrictamente necesario y documentado con un comentario.
- No modificar archivos en `src/app/components/ui/` — son componentes shadcn/ui generados.
- No agregar nuevas librerías de íconos, gráficos o UI sin necesidad real.
- No usar colores naranja distintos a `#FF6835`.
- No crear vistas nuevas sin agregar la sección correspondiente en `MainSection` y `NAV_GROUPS`.
- No mezclar inline styles con Tailwind en el mismo componente.
