# 🔧 Second Hand - Notas Técnicas para Desarrolladores

## 📁 Estructura del Proyecto

```
ODDY Market/
├── /src/app/
│   ├── App.tsx                                    # ✅ Integrado
│   └── /components/
│       ├── Header.tsx                             # ✅ Botón agregado
│       ├── HomePage.tsx                           # ✅ Banner agregado
│       ├── AdminDashboard.tsx                     # ✅ Módulo agregado
│       └── /secondhand/                           # ⭐ NUEVO
│           ├── SecondHandMain.tsx                 # Navegador principal
│           ├── SecondHandMarketplace.tsx          # Vista pública
│           ├── SecondHandSeller.tsx               # Panel vendedor
│           ├── SecondHandAdmin.tsx                # Panel admin
│           ├── SecondHandListingForm.tsx          # Formulario
│           └── SecondHandListingCard.tsx          # Card producto
│
├── /supabase/functions/server/
│   ├── index.tsx                                  # ✅ Rutas montadas
│   └── secondhand.tsx                             # ⭐ NUEVO - 22 endpoints
│
└── /docs/
    ├── SECOND_HAND_DOCUMENTATION.md               # ⭐ Documentación completa
    ├── SECOND_HAND_COMPLETADO.md                  # ⭐ Resumen ejecutivo
    ├── SECOND_HAND_GUIA_USUARIO.md                # ⭐ Guía de usuario
    └── SECOND_HAND_TECH_NOTES.md                  # ⭐ Este archivo
```

---

## 🔄 Flujo de Datos

### Estado de la Aplicación

```typescript
// En App.tsx
const [currentPage, setCurrentPage] = useState("home");
// Cuando currentPage === "secondhand", se renderiza SecondHandMain

// En SecondHandMain.tsx
const [currentView, setCurrentView] = useState<"marketplace" | "seller" | "admin">();
// Controla qué vista mostrar dentro de Second Hand
```

### Comunicación Frontend ↔ Backend

```typescript
// Ejemplo de llamada típica
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/listings`,
  {
    headers: {
      Authorization: `Bearer ${session?.access_token}`, // O publicAnonKey para públicos
    },
  }
);
```

---

## 🔐 Sistema de Autenticación

### Tokens y Sesiones

```typescript
// Access Token (para usuarios autenticados)
const accessToken = session?.access_token;

// Public Anon Key (para endpoints públicos)
import { publicAnonKey } from "/utils/supabase/info";
```

### Verificación de Roles en Backend

```typescript
// En secondhand.tsx
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Verificar admin
const user = await getUserFromToken(c.req.header("Authorization"));
if (!user || user.user_metadata?.role !== "admin") {
  return c.json({ error: "Unauthorized - Admin only" }, 403);
}
```

---

## 💾 Almacenamiento de Datos (KV Store)

### Prefijos de Keys

```typescript
// Publicaciones
`secondhand:listing:${id}` 
// Ejemplo: "secondhand:listing:550e8400-e29b-41d4-a716-446655440000"

// Ofertas
`secondhand:offer:${listingId}:${offerId}`
// Ejemplo: "secondhand:offer:abc123:def456"

// Favoritos del usuario
`secondhand:favorites:${userId}`
// Ejemplo: "secondhand:favorites:user789"
// Valor: { listingIds: ["id1", "id2", "id3"] }

// Auditoría
`audit:${timestamp}:secondhand-${action}`
// Ejemplo: "audit:1709251200000:secondhand-create"
```

### Operaciones CRUD

```typescript
// Crear
await kv.set(`secondhand:listing:${id}`, listingObject);

// Leer uno
const listing = await kv.get(`secondhand:listing:${id}`);

// Leer todos por prefijo
const allListings = await kv.getByPrefix("secondhand:listing:");

// Actualizar (sobrescribir)
await kv.set(`secondhand:listing:${id}`, updatedListingObject);

// Eliminar
await kv.del(`secondhand:listing:${id}`);
```

---

## 🎨 Componentes y Props

### SecondHandMain

```typescript
interface SecondHandMainProps {
  user?: any;                    // Usuario de Supabase
  session?: any;                 // Sesión de Supabase
  initialView?: "marketplace" | "seller" | "admin";
}
```

### SecondHandMarketplace

```typescript
interface SecondHandMarketplaceProps {
  user?: any;
  session?: any;
}
```

### SecondHandSeller

```typescript
interface SecondHandSellerProps {
  user: any;                     // Requerido
  session: any;                  // Requerido
  onClose: () => void;
}
```

### SecondHandAdmin

```typescript
interface SecondHandAdminProps {
  session: any;                  // Requerido
  onClose: () => void;
}
```

### SecondHandListingForm

```typescript
interface SecondHandListingFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingListing?: any;          // Si está presente, es modo edición
}
```

### SecondHandListingCard

```typescript
interface SecondHandListingCardProps {
  listing: any;
  onView: (listing: any) => void;
  onFavorite?: (listing: any) => void;
  isFavorited?: boolean;
  showStatus?: boolean;          // Muestra badge de estado (seller view)
}
```

---

## 🔀 Endpoints del Backend

### Públicos (Authorization: Bearer ${publicAnonKey})

```
GET  /make-server-0dd48dc4/secondhand/listings
     Query params: status, category, condition, search, sortBy, order
     
GET  /make-server-0dd48dc4/secondhand/listings/:id
```

### Autenticados (Authorization: Bearer ${accessToken})

```
GET  /make-server-0dd48dc4/secondhand/my-listings
GET  /make-server-0dd48dc4/secondhand/seller-stats
GET  /make-server-0dd48dc4/secondhand/favorites

POST /make-server-0dd48dc4/secondhand/listings
PUT  /make-server-0dd48dc4/secondhand/listings/:id
DEL  /make-server-0dd48dc4/secondhand/listings/:id

POST /make-server-0dd48dc4/secondhand/listings/:id/mark-sold
POST /make-server-0dd48dc4/secondhand/listings/:id/favorite

POST /make-server-0dd48dc4/secondhand/offers
     Body: { listingId, amount, message }
     
GET  /make-server-0dd48dc4/secondhand/offers/:listingId
POST /make-server-0dd48dc4/secondhand/offers/:offerId/accept
```

### Admin (Authorization: Bearer ${accessToken} + role check)

```
GET  /make-server-0dd48dc4/secondhand/pending-review
GET  /make-server-0dd48dc4/secondhand/admin-stats

POST /make-server-0dd48dc4/secondhand/listings/:id/approve
POST /make-server-0dd48dc4/secondhand/listings/:id/reject
     Body: { reason: string }
```

---

## 📝 Modelos de Datos TypeScript

### Listing

```typescript
interface Listing {
  // Campos del usuario
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: "new" | "like-new" | "good" | "fair" | "poor";
  brand?: string;
  location: string;
  negotiable: boolean;
  images: string[];
  tags?: string[];
  shippingAvailable: boolean;
  meetupAvailable: boolean;
  
  // Auto-generado
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  status: "pending" | "approved" | "rejected" | "sold";
  viewCount: number;
  favoriteCount: number;
  
  // Aprobación/Rechazo
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  soldAt?: string;
}
```

### Offer

```typescript
interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
}
```

### Stats (Vendedor)

```typescript
interface SellerStats {
  totalListings: number;
  pendingListings: number;
  approvedListings: number;
  rejectedListings: number;
  soldListings: number;
  totalViews: number;
  totalRevenue: number;
}
```

### Stats (Admin)

```typescript
interface AdminStats {
  totalListings: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  sold: number;
  totalViews: number;
  totalRevenue: number;
  activeSellers: number;
}
```

---

## 🎨 Temas y Estilos

### Colores Principales

```typescript
const COLORS = {
  primary: {
    orange: "#FF6B35",      // Naranja principal
    red: "#E94560",         // Rojo para gradientes
  },
  secondary: {
    cyan: "#00ADB5",        // Celeste
  },
  admin: {
    purple: "#9D4EDD",      // Panel admin
    indigo: "#6366F1",
  },
  status: {
    pending: "#FFC107",     // Amarillo
    approved: "#4CAF50",    // Verde
    rejected: "#F44336",    // Rojo
    sold: "#9C27B0",        // Púrpura
  },
};
```

### Gradientes Usados

```css
/* Botones principales */
.bg-gradient-to-r {
  background: linear-gradient(to right, #FF6B35, #E94560);
}

/* Panel admin */
.bg-gradient-to-r {
  background: linear-gradient(to right, #9D4EDD, #6366F1);
}
```

---

## 🔄 Animaciones con Motion

### Componentes Animados

```typescript
import { motion, AnimatePresence } from "motion/react";

// Card entrance
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  whileHover={{ y: -4 }}
>

// Modal
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
  )}
</AnimatePresence>
```

---

## 🚨 Manejo de Errores

### Frontend

```typescript
try {
  const response = await fetch(url, options);
  
  if (response.ok) {
    const data = await response.json();
    // Handle success
  } else {
    const error = await response.json();
    toast.error(error.error || "Error desconocido");
  }
} catch (error) {
  console.error("Error:", error);
  toast.error("Error de conexión");
}
```

### Backend

```typescript
try {
  // Lógica
  return c.json({ success: true, data });
} catch (error) {
  console.error("Error en endpoint:", error);
  return c.json(
    { error: "Mensaje de error específico" },
    500
  );
}
```

---

## 📊 Queries y Filtros

### Filtrado en Backend

```typescript
// GET /secondhand/listings?category=Electrónica&condition=good&sortBy=price&order=asc

let listings = await kv.getByPrefix("secondhand:listing:");

// Filtrar por status
listings = listings.filter((item: any) => item.status === "approved");

// Filtrar por categoría
if (category && category !== "all") {
  listings = listings.filter((item: any) => item.category === category);
}

// Filtrar por condición
if (condition && condition !== "all") {
  listings = listings.filter((item: any) => item.condition === condition);
}

// Búsqueda por texto
if (search) {
  const searchLower = search.toLowerCase();
  listings = listings.filter((item: any) =>
    item.title?.toLowerCase().includes(searchLower) ||
    item.description?.toLowerCase().includes(searchLower) ||
    item.brand?.toLowerCase().includes(searchLower)
  );
}

// Ordenar
listings.sort((a: any, b: any) => {
  let aVal = a[sortBy];
  let bVal = b[sortBy];
  
  if (sortBy === "price") {
    aVal = parseFloat(aVal) || 0;
    bVal = parseFloat(bVal) || 0;
  }
  
  return order === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
});
```

---

## 🔒 Consideraciones de Seguridad

### Validaciones Necesarias

1. **Input Sanitization**
   ```typescript
   // Limpiar HTML y scripts
   const sanitizedTitle = title.trim().substring(0, 100);
   ```

2. **Verificación de Propiedad**
   ```typescript
   if (existing.sellerId !== user.id && !isAdmin) {
     return c.json({ error: "Forbidden" }, 403);
   }
   ```

3. **Rate Limiting**
   ```typescript
   // TODO: Implementar límite de publicaciones por día/hora
   // Ejemplo: Máximo 10 publicaciones por día por usuario
   ```

4. **Content Moderation**
   ```typescript
   // TODO: Integrar servicio de moderación de contenido
   // Para detectar palabras prohibidas, imágenes inapropiadas, etc.
   ```

---

## ⚡ Optimizaciones Recomendadas

### Para Producción

1. **Caché de Listados Públicos**
   ```typescript
   // Implementar caché de 5 minutos para listados aprobados
   // Reduce carga en KV store
   ```

2. **Paginación**
   ```typescript
   // GET /secondhand/listings?page=1&limit=20
   // Actualmente retorna todos, implementar paginación
   ```

3. **Imágenes en Supabase Storage**
   ```typescript
   // Migrar de URLs externas a Supabase Storage
   const { data, error } = await supabase.storage
     .from('secondhand-images')
     .upload(`${userId}/${filename}`, file);
   ```

4. **Índices y Búsqueda**
   ```typescript
   // Considerar migrar a PostgreSQL con índices
   // O integrar Algolia para búsqueda avanzada
   ```

5. **Compresión de Imágenes**
   ```typescript
   // Implementar optimización automática de imágenes
   // Generar thumbnails
   ```

---

## 🧪 Testing

### Tests Sugeridos

```typescript
// Unit Tests
describe("SecondHandListingForm", () => {
  test("valida campos requeridos", () => {});
  test("permite hasta 6 imágenes", () => {});
  test("valida mínimo de caracteres", () => {});
});

// Integration Tests
describe("Second Hand API", () => {
  test("crear publicación requiere autenticación", async () => {});
  test("solo admin puede aprobar", async () => {});
  test("vendedor puede editar solo sus publicaciones", async () => {});
});

// E2E Tests
describe("Second Hand Flow", () => {
  test("flujo completo de vendedor", async () => {});
  test("flujo de aprobación admin", async () => {});
  test("comprador puede buscar y favoritar", async () => {});
});
```

---

## 📱 Responsive Breakpoints

```typescript
// Tailwind breakpoints usados
// sm: 640px   - Tablet
// md: 768px   - Tablet landscape
// lg: 1024px  - Desktop
// xl: 1280px  - Large desktop

// Ejemplo de grid responsivo
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
```

---

## 🐛 Debug y Logs

### Logs Importantes

```typescript
// En backend
console.log("Creating listing:", { id, sellerId, title });
console.log("Approving listing:", { id, adminId });

// En frontend
console.error("Error loading listings:", error);
console.log("User authenticated:", user?.email);
```

### Auditoría

```typescript
// Todas las acciones críticas se registran
await kv.set(`audit:${Date.now()}:secondhand-${action}`, {
  action: "secondhand_listing_created",
  userId: user.id,
  userEmail: user.email,
  listingId: id,
  timestamp: new Date().toISOString(),
});
```

---

## 🔮 Roadmap Técnico

### Fase 1 (Actual) - Completado ✅
- ✅ Backend API completo
- ✅ Frontend completo
- ✅ Sistema de moderación
- ✅ Búsqueda y filtros básicos

### Fase 2 - Mejoras Inmediatas
- [ ] Supabase Storage para imágenes
- [ ] Paginación en listados
- [ ] Rate limiting
- [ ] Tests automatizados
- [ ] Monitoring y analytics

### Fase 3 - Features Avanzados
- [ ] Sistema de mensajería
- [ ] Notificaciones push/email
- [ ] Calificaciones y reseñas
- [ ] Sistema de pagos
- [ ] Tracking de envíos

### Fase 4 - Escalabilidad
- [ ] Migración a PostgreSQL
- [ ] Algolia para búsqueda
- [ ] CDN para imágenes
- [ ] Redis para caché
- [ ] Microservicios

---

## 📚 Dependencies

### Packages Usados

```json
{
  "dependencies": {
    "motion": "^12.23.24",           // Animaciones
    "sonner": "^2.0.3",              // Toast notifications
    "lucide-react": "^0.487.0",      // Iconos
    "@supabase/supabase-js": "^2.95.3"  // Backend
  }
}
```

### Backend (Deno)

```typescript
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
```

---

## 💡 Tips para Desarrolladores

1. **Siempre verificar autenticación antes de operaciones sensibles**
2. **Usar toast notifications para feedback inmediato al usuario**
3. **Mantener consistencia en nombres de variables y funciones**
4. **Comentar lógica compleja**
5. **Usar TypeScript para mejor type safety**
6. **Validar tanto en frontend como backend**
7. **Manejar estados de loading y error apropiadamente**
8. **Usar AnimatePresence para modales y transiciones**
9. **Optimizar imágenes antes de subirlas**
10. **Testear en móvil real, no solo en emulador**

---

## 🆘 Troubleshooting

### Problema: Las publicaciones no aparecen
**Solución**: Verificar que el status sea "approved"

### Problema: Error de autenticación
**Solución**: Verificar que session.access_token esté presente

### Problema: Imágenes no cargan
**Solución**: Verificar URLs válidas, considerar fallback

### Problema: Modales no se cierran
**Solución**: Verificar que AnimatePresence envuelva el modal

### Problema: Performance lenta
**Solución**: Implementar paginación, lazy loading de imágenes

---

**🚀 ¡Happy coding!**

*Si tienes preguntas técnicas, consulta la documentación completa en SECOND_HAND_DOCUMENTATION.md*
