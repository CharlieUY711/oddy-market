# 🔐 Sistema de Roles y Permisos - ODDY Market

## 📋 Descripción General

Sistema completo de gestión de roles y permisos con flujo de aprobación manual por parte del administrador. Los usuarios pueden solicitar roles superiores y el admin los aprueba o rechaza desde un panel centralizado.

---

## 👥 Roles Disponibles

### 1. 🛒 **Cliente** (Rol por defecto)
- **Asignación**: Automática al registrarse
- **Permisos**:
  - Realizar compras
  - Ver y editar perfil personal
  - Ver historial de pedidos
  - Guardar productos favoritos
  - Recibir notificaciones

### 2. 📦 **Proveedor**
- **Asignación**: Por solicitud y aprobación del admin
- **Permisos**:
  - Todo lo del Cliente +
  - Gestionar inventario propio
  - Subir productos al catálogo
  - Ver reportes de ventas
  - Gestionar órdenes de compra

### 3. ✏️ **Editor**
- **Asignación**: Por solicitud y aprobación del admin
- **Permisos**:
  - Todo lo del Cliente +
  - Crear y editar productos
  - Gestionar categorías y departamentos
  - Modificar contenido del sitio
  - Acceso a herramientas de marketing

### 4. 👑 **Administrador**
- **Asignación**: 
  - Primer usuario registrado (automático)
  - Por solicitud y aprobación de otro admin
- **Permisos**:
  - **Acceso completo al sistema**
  - Gestión de usuarios y roles
  - Control total del Dashboard Admin
  - ERP, CRM y todas las integraciones
  - Aprobar/rechazar solicitudes de roles

---

## 🔄 Flujo de Solicitud de Roles

### Para Usuarios:

1. **Iniciar sesión** en ODDY Market
2. Ir a **Mi Cuenta** → **Ver Mi Perfil**
3. Ir a la pestaña **"Seguridad"**
4. Click en **"🔓 Solicitar Rol Avanzado"**
5. Seleccionar el rol deseado (Editor, Proveedor o Admin)
6. Escribir un mensaje explicando por qué necesitas el rol (opcional)
7. **Enviar solicitud**
8. Esperar aprobación del administrador

### Para Administradores:

1. Acceder al **Dashboard Admin**
2. Ir a la sección **"Roles y Permisos"** (ícono de escudo 🛡️)
3. Ver todas las solicitudes pendientes
4. Click en **"Revisar"** en una solicitud
5. Ver detalles del usuario y rol solicitado
6. **Aprobar** o **Rechazar** (con motivo)
7. El usuario recibe la actualización inmediatamente

---

## 📊 Panel de Gestión de Roles (Solo Admin)

### Estadísticas en Tiempo Real:
- ⏳ Solicitudes Pendientes
- ✅ Solicitudes Aprobadas
- ❌ Solicitudes Rechazadas
- 📈 Total de Solicitudes
- 👥 Usuarios por Rol

### Funcionalidades:
- **Búsqueda**: Por nombre o email
- **Filtros**: Todas, Pendientes, Aprobadas, Rechazadas
- **Tabla Detallada**: Usuario, rol actual, rol solicitado, fecha
- **Revisión Rápida**: Modal con toda la información
- **Historial Completo**: Todas las solicitudes procesadas

---

## 🛠️ Endpoints de Backend

### Para Usuarios:

```
POST /auth/request-role
- Solicitar un rol superior
- Body: { requestedRole: "editor" | "proveedor" | "admin", message: "..." }
```

```
GET /auth/my-requests
- Ver mis solicitudes de roles
- Devuelve historial completo con estados
```

### Para Administradores:

```
GET /auth/role-requests
- Ver todas las solicitudes (requiere rol admin)
- Ordenadas por estado (pendientes primero)
```

```
POST /auth/approve-role
- Aprobar una solicitud (requiere rol admin)
- Body: { requestId: "uuid" }
```

```
POST /auth/reject-role
- Rechazar una solicitud (requiere rol admin)
- Body: { requestId: "uuid", rejectionReason: "..." }
```

```
GET /auth/role-stats
- Estadísticas de roles y solicitudes (requiere rol admin)
```

---

## 💾 Estructura de Datos

### Role Request (KV Store):
```typescript
{
  id: "uuid",
  userId: "user-uuid",
  email: "user@example.com",
  name: "Usuario",
  currentRole: "cliente",
  requestedRole: "editor",
  message: "Necesito este rol porque...",
  status: "pending" | "approved" | "rejected",
  createdAt: "2026-02-11T10:00:00.000Z",
  reviewedAt: "2026-02-11T11:00:00.000Z" | null,
  reviewedBy: "admin@oddymarket.com" | null,
  rejectionReason: "Motivo..." | null
}
```

### User Profile (Supabase Auth + KV):
```typescript
{
  id: "uuid",
  email: "user@example.com",
  user_metadata: {
    name: "Usuario",
    role: "cliente" | "proveedor" | "editor" | "admin"
  },
  // ... otros campos de Supabase
}
```

---

## 🎨 Componentes Frontend

### 1. **RoleRequestModal** (`/src/app/components/RoleRequestModal.tsx`)
- Modal para solicitar roles
- Muestra permisos de cada rol
- Historial de solicitudes del usuario
- Indica si hay solicitud pendiente

### 2. **RoleManagement** (`/src/app/components/RoleManagement.tsx`)
- Panel completo de gestión para admins
- Estadísticas en tiempo real
- Tabla de solicitudes con filtros
- Modal de revisión con aprobación/rechazo

### 3. **UserProfile** (Actualizado)
- Sección de roles en pestaña "Seguridad"
- Badge visual del rol actual
- Estado de solicitudes pendientes
- Botón para solicitar rol avanzado

### 4. **AdminDashboard** (Actualizado)
- Nueva sección "Roles y Permisos"
- Ícono de escudo en el sidebar
- Integración completa con RoleManagement

---

## 🔒 Seguridad y Validaciones

### Backend:
- ✅ Verificación de token en cada request
- ✅ Validación de rol admin para endpoints protegidos
- ✅ No se puede solicitar un rol que ya se tiene
- ✅ Solo una solicitud pendiente a la vez
- ✅ Validación de roles permitidos
- ✅ Logs detallados de todas las acciones

### Frontend:
- ✅ UI actualizada en tiempo real
- ✅ Feedback visual claro (toast notifications)
- ✅ Desactivación de botones durante loading
- ✅ Validación de formularios
- ✅ Estados sincronizados con backend

---

## 📝 Notas Importantes

### Primer Usuario:
- El **primer usuario** que se registre en el sistema será automáticamente **Admin**
- Los siguientes usuarios serán **Cliente** por defecto

### Desarrollo vs Producción:
- En **desarrollo**: Sistema de solicitudes completo
- En **producción**: Se recomienda desactivar solicitudes de admin y gestionar manualmente desde Supabase

### Actualización de Roles:
- Los cambios de rol se reflejan **inmediatamente**
- La página se recarga automáticamente al aprobar
- Los permisos se actualizan en Supabase Auth y KV Store

---

## 🚀 Cómo Empezar

### 1. Como Primer Usuario (Admin):
```bash
1. Registrarse en ODDY Market
2. Automáticamente serás Admin
3. Acceder al Dashboard Admin
4. Ir a "Roles y Permisos"
5. Gestionar solicitudes de otros usuarios
```

### 2. Como Usuario Regular:
```bash
1. Registrarse en ODDY Market
2. Tu rol inicial será "Cliente"
3. Ir a Mi Cuenta → Ver Perfil → Seguridad
4. Solicitar rol avanzado
5. Esperar aprobación del admin
```

### 3. Verificar Estado:
```bash
# En la consola del navegador:
console.log(user.user_metadata.role)

# O ver en el perfil:
Mi Cuenta → Ver Perfil → Seguridad
```

---

## 🎯 Próximas Mejoras Sugeridas

- [ ] Notificaciones por email cuando se aprueba/rechaza
- [ ] Sistema de auditoría completo
- [ ] Roles personalizados por el admin
- [ ] Permisos granulares por módulo
- [ ] Límite de solicitudes por usuario
- [ ] Expiración de roles temporales
- [ ] Dashboard de actividad por rol

---

## 📞 Soporte

Si tienes problemas con el sistema de roles:

1. Revisa los logs en la consola del navegador (F12)
2. Verifica que tu sesión esté activa
3. Asegúrate de que el servidor esté corriendo
4. Verifica las variables de entorno de Supabase

---

**Desarrollado para ODDY Market** 🛍️  
Sistema de roles profesional y escalable  
Versión 1.0 - Febrero 2026
