# 🔄 Second Hand Department - ODDY Market

## Descripción General

El departamento **Second Hand** es un marketplace completo dentro de ODDY Market que permite a los usuarios vender y comprar productos de segunda mano. Funciona como un sistema de clasificados con moderación administrativa para garantizar la calidad de las publicaciones.

## 🎯 Características Principales

### Para Vendedores (Usuarios/Clientes)
- ✅ **Publicar productos** de segunda mano con imágenes, descripciones detalladas y precios
- 📸 **Hasta 6 imágenes** por publicación
- 🏷️ **Categorías** predefinidas (Electrónica, Moda, Hogar, Deportes, etc.)
- 📊 **Estados del producto** (Nuevo, Como nuevo, Buen estado, etc.)
- 💰 **Precios negociables** opcionalmente
- 📍 **Ubicación** del vendedor
- 🚚 **Opciones de entrega** (envío o encuentro personal)
- 🏷️ **Etiquetas personalizadas** (hasta 10)
- 📈 **Estadísticas** de visualizaciones y favoritos
- 🔔 **Estados de publicación**: Pendiente, Aprobado, Rechazado, Vendido

### Para Compradores
- 🔍 **Búsqueda avanzada** con filtros múltiples
- 📱 **Vista responsiva** (grid o lista)
- ❤️ **Favoritos** para guardar productos de interés
- 👀 **Galería de imágenes** con navegación
- 💬 **Contactar al vendedor** (función preparada para mensajería)
- 🔗 **Compartir publicaciones** vía redes sociales
- 📊 **Ordenamiento** por precio, fecha, popularidad

### Para Administradores
- 🛡️ **Panel de moderación** especializado
- ✅ **Aprobar publicaciones** antes de que se publiquen
- ❌ **Rechazar publicaciones** con razones específicas
- 📊 **Dashboard de estadísticas** (pendientes, aprobados, vendedores activos, etc.)
- 📝 **Revisión detallada** con galería de imágenes
- 📧 **Notificaciones** al vendedor sobre el estado

## 🗂️ Estructura de Archivos

```
/src/app/components/secondhand/
├── SecondHandMain.tsx              # Componente principal y navegación
├── SecondHandMarketplace.tsx       # Vista pública del marketplace
├── SecondHandSeller.tsx            # Panel del vendedor
├── SecondHandAdmin.tsx             # Panel de moderación (admin)
├── SecondHandListingForm.tsx       # Formulario de creación/edición
└── SecondHandListingCard.tsx       # Card de producto

/supabase/functions/server/
└── secondhand.tsx                  # Rutas backend completas
```

## 🔌 Backend - API Endpoints

### Públicos (requieren autenticación básica)
- `GET /secondhand/listings` - Listar productos aprobados (con filtros)
- `GET /secondhand/listings/:id` - Ver detalle de una publicación

### Autenticados (requieren usuario logueado)
- `GET /secondhand/my-listings` - Mis publicaciones como vendedor
- `GET /secondhand/seller-stats` - Mis estadísticas de vendedor
- `GET /secondhand/favorites` - Mis favoritos
- `POST /secondhand/listings` - Crear nueva publicación
- `PUT /secondhand/listings/:id` - Actualizar publicación (solo propia)
- `DELETE /secondhand/listings/:id` - Eliminar publicación (solo propia)
- `POST /secondhand/listings/:id/mark-sold` - Marcar como vendido
- `POST /secondhand/listings/:id/favorite` - Agregar/quitar de favoritos
- `POST /secondhand/offers` - Crear oferta de precio
- `GET /secondhand/offers/:listingId` - Ver ofertas (solo vendedor)
- `POST /secondhand/offers/:offerId/accept` - Aceptar oferta

### Admin (requieren rol admin)
- `GET /secondhand/pending-review` - Publicaciones pendientes de aprobación
- `GET /secondhand/admin-stats` - Estadísticas globales
- `POST /secondhand/listings/:id/approve` - Aprobar publicación
- `POST /secondhand/listings/:id/reject` - Rechazar publicación (con razón)

## 📦 Modelo de Datos

### Listing (Publicación)
```typescript
{
  id: string;
  title: string;                    // Título (mínimo 10 caracteres)
  description: string;              // Descripción (mínimo 50 caracteres)
  price: number;                    // Precio
  category: string;                 // Categoría
  condition: string;                // Estado: new, like-new, good, fair, poor
  brand?: string;                   // Marca (opcional)
  location: string;                 // Ubicación del vendedor
  negotiable: boolean;              // Precio negociable
  images: string[];                 // URLs de imágenes (1-6)
  tags?: string[];                  // Etiquetas (hasta 10)
  shippingAvailable: boolean;       // Disponible para envío
  meetupAvailable: boolean;         // Disponible para encuentro
  
  // Auto-generado
  sellerId: string;                 // ID del vendedor
  sellerName: string;               // Nombre del vendedor
  sellerEmail: string;              // Email del vendedor
  status: string;                   // pending, approved, rejected, sold
  viewCount: number;                // Cantidad de vistas
  favoriteCount: number;            // Cantidad de favoritos
  
  // Aprobación
  approvedBy?: string;              // ID del admin que aprobó
  approvedAt?: string;              // Fecha de aprobación
  rejectedBy?: string;              // ID del admin que rechazó
  rejectionReason?: string;         // Razón del rechazo
  rejectedAt?: string;              // Fecha de rechazo
  
  createdAt: string;                // Fecha de creación
  updatedAt: string;                // Última actualización
  soldAt?: string;                  // Fecha de venta
}
```

### Offer (Oferta de precio)
```typescript
{
  id: string;
  listingId: string;                // ID de la publicación
  buyerId: string;                  // ID del comprador
  buyerName: string;                // Nombre del comprador
  buyerEmail: string;               // Email del comprador
  amount: number;                   // Monto ofrecido
  message?: string;                 // Mensaje opcional
  status: string;                   // pending, accepted, rejected, expired
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
}
```

### Favorites (Favoritos del usuario)
```typescript
{
  userId: string;
  listingIds: string[];             // Array de IDs de publicaciones favoritas
}
```

## 🚀 Flujo de Usuario

### Vendedor quiere publicar un producto:
1. Usuario hace clic en "Second Hand" en la homepage
2. Navega a "Mis Publicaciones"
3. Hace clic en "Nueva Publicación"
4. Completa el formulario con todos los datos
5. Envía la publicación
6. **Estado: PENDIENTE** - La publicación queda en revisión
7. Administrador revisa y aprueba/rechaza
8. Usuario recibe notificación del resultado
9. Si es **APROBADA**: Aparece en el marketplace público
10. Si es **RECHAZADA**: Usuario puede editarla y volver a enviar

### Comprador quiere comprar:
1. Usuario navega al "Second Hand" marketplace
2. Usa filtros para buscar (categoría, estado, precio)
3. Ve los productos aprobados
4. Hace clic en uno para ver detalles completos
5. Puede agregar a favoritos
6. Contacta al vendedor (funcionalidad preparada)
7. Realiza la transacción fuera de la plataforma

### Administrador modera:
1. Ingresa al Admin Dashboard
2. Navega a "Management" → "Second Hand (Moderación)"
3. Ve todas las publicaciones pendientes
4. Hace clic en "Ver Detalles" en una publicación
5. Revisa imágenes, descripción, precio, etc.
6. Decide:
   - **Aprobar**: Publicación visible inmediatamente
   - **Rechazar**: Indica razón del rechazo, se notifica al vendedor

## 🎨 Diseño y UX

### Colores
- **Naranja** (#FF6B35): Color principal, botones de acción
- **Rojo** (#E94560): Gradientes y acentos
- **Celeste** (#00ADB5): Secundario, tags y detalles
- **Púrpura** (#9D4EDD): Panel de admin
- **Amarillo** (#FFC107): Estado pendiente
- **Verde** (#4CAF50): Estado aprobado
- **Rojo** (#F44336): Estado rechazado

### Responsive
- Mobile-first design
- Grid adaptativo (1 columna en móvil, hasta 4 en desktop)
- Navegación touch-friendly
- Imágenes optimizadas para móvil

### Animaciones
- Transiciones suaves con Motion (Framer Motion)
- Hover effects en cards
- Modal animations
- Loading states

## 🔐 Seguridad y Permisos

### Roles
- **Cliente**: Puede crear y gestionar sus propias publicaciones
- **Admin**: Puede aprobar/rechazar publicaciones + todo lo de cliente
- **Editor/Proveedor**: Mismo acceso que cliente en Second Hand

### Validaciones Backend
- ✅ Verificación de autenticación en todas las rutas
- ✅ Verificación de propiedad (solo editar/eliminar propias publicaciones)
- ✅ Verificación de rol admin para moderación
- ✅ Registro de auditoría en acciones importantes

## 📊 Sistema de Estadísticas

### Para Vendedores:
- Total de publicaciones
- Pendientes de aprobación
- Aprobadas y activas
- Rechazadas
- Vendidas
- Total de visualizaciones
- Ingresos totales (suma de vendidos)

### Para Admins:
- Total de publicaciones en el sistema
- Pendientes de aprobación
- Aprobadas
- Rechazadas
- Vendidas
- Total de visualizaciones
- Ingresos totales de la plataforma
- Vendedores activos

## 🔮 Futuras Mejoras

- [ ] Sistema de mensajería interna entre compradores y vendedores
- [ ] Sistema de calificaciones y reseñas
- [ ] Comisión por venta para la plataforma
- [ ] Integración con pasarelas de pago
- [ ] Sistema de envíos con tracking
- [ ] Notificaciones push/email
- [ ] Chat en tiempo real
- [ ] Sistema de denuncias
- [ ] Verificación de vendedores
- [ ] Promocionar publicaciones (pago)
- [ ] Sistema de subastas
- [ ] Recordatorios automáticos de precio reducido
- [ ] IA para detectar publicaciones sospechosas

## 🎯 Categorías Disponibles

1. **Electrónica**: Teléfonos, laptops, tablets, cámaras, etc.
2. **Moda y Accesorios**: Ropa, zapatos, carteras, joyas
3. **Hogar y Jardín**: Muebles, decoración, electrodomésticos
4. **Deportes y Fitness**: Equipamiento deportivo, ropa, accesorios
5. **Juguetes y Niños**: Juguetes, ropa infantil, accesorios
6. **Libros y Música**: Libros físicos, vinilos, instrumentos
7. **Vehículos y Accesorios**: Autos, motos, bicicletas, repuestos
8. **Herramientas**: Herramientas manuales, eléctricas, jardín
9. **Belleza y Cuidado Personal**: Cosméticos, perfumes, cuidado
10. **Mascotas**: Accesorios, alimentos, productos
11. **Otros**: Cualquier categoría no listada

## 🛠️ Estados del Producto

1. **Nuevo**: Sin usar, con etiquetas originales, en caja
2. **Como nuevo**: Sin señales visibles de uso, perfecto estado
3. **Buen estado**: Ligeras señales de uso, completamente funcional
4. **Estado aceptable**: Uso visible pero funcional
5. **Para reparar**: No funcional o necesita reparación

## 💡 Tips para Vendedores

1. **Fotos de calidad**: Usa buena iluminación y muestra el producto desde varios ángulos
2. **Descripción detallada**: Especifica estado real, defectos, accesorios incluidos
3. **Precio justo**: Investiga precios similares en el marketplace
4. **Responde rápido**: Los compradores valoran respuestas rápidas
5. **Honestidad**: Describe defectos para evitar devoluciones
6. **Etiquetas útiles**: Usa etiquetas relevantes para mejor visibilidad

## 📝 Notas Técnicas

- **Storage de imágenes**: Actualmente usa URLs externas. Para producción, implementar Supabase Storage
- **KV Store**: Usa el sistema de key-value de Supabase. Para mayor escala, considerar PostgreSQL completo
- **Rate limiting**: Implementar límites de creación de publicaciones por usuario
- **Caché**: Implementar caché en listados públicos para mejor performance
- **Búsqueda**: Considerar Algolia o similar para búsqueda avanzada con typos

## 🌟 Conclusión

El departamento **Second Hand** está completamente funcional y listo para uso. Ofrece una experiencia completa de marketplace con moderación administrativa, diseño mobile-first, y todas las características necesarias para comprar y vender productos de segunda mano de forma segura y profesional.

---

**Desarrollado para ODDY Market** | Versión 1.0 | Febrero 2026
